import asyncio
from enum import Enum
from PySide6.QtCore import QObject, QThread, Signal, QTimer
from PySide6.QtGui import QPixmap
import cv2
from app.ai.proccessor import Proccessor
from app.api.api_client import APIClient
from app.models.call_api_worker import CallApiWorker
from app.models.cam_stream_worker import CamStreamWorker
from app.models.cap_capture_worker import CameraCaptureWorker
from app.models.enums import EventType
from app.models.proccess_plate_worker import ProccessPlateWorker
from app.mqtt.mqtt_client import MQTTClient
from PySide6.QtGui import QImage, QPixmap

from app.utils.convert_util import bytes_to_ndarray, ndarray_to_bytes

class MainController:
    def __init__(self, on_ui_event):
        self.on_ui_event = on_ui_event
        self.mqtt_client = MQTTClient(self._dispatch_message)
        self.mqtt_client.run()

        self.plate_proccessor = Proccessor()
        self.api = APIClient()

        # Quản lý tất cả threads bằng dict để tránh duplicate
        self._cam_stream_threads = {}
        self._cam_capture_threads = {}
        self._proccess_plate_threads = {}
        self._api_threads = {}

        # URLs
        self.capture_url = None
        self.processing: dict[str, any] = None

    def _dispatch_message(self, type, message):
        match type:
            case EventType.ESP32C3_CONNECTED:
                self.on_ui_event(type, None)
            case EventType.ESP32C3_UID:
                self.on_ui_event(type, message)
                self.processing = {}
                self.processing['uid'] = message
                self._capture_image()
            case EventType.ESP32C3_DISCONNECTED:
                self.on_ui_event(type, None)

            case EventType.ESP32CAM_CONNECTED:
                self.on_ui_event(type, None)
            case EventType.ESP32CAM_DISCONNECTED:
                self.capture_url = None
                self._stop_camera_stream()
                self.on_ui_event(type, None)
            case EventType.ESP32CAM_STREAM_URL:
                self._start_camera(message)
            case EventType.ESP32CAM_CAPTURE_URL:
                self.capture_url = message

    # ------------------- Cleanup Helper -------------------
    def _cleanup_threads(self, thread_dict):
        """Cleanup tất cả threads trong dict"""
        thread_ids = list(thread_dict.keys())
        for thread_id in thread_ids:
            try:
                thread, worker = thread_dict[thread_id]
                
                # Disconnect all signals
                try:
                    thread.started.disconnect()
                except:
                    pass
                
                # Stop worker
                if hasattr(worker, 'stop'):
                    worker.stop()
                
                # Stop thread
                if thread.isRunning():
                    thread.quit()
                
                # Remove from dict
                del thread_dict[thread_id]
                
            except Exception as e:
                print(f"Cleanup error for thread {thread_id}: {e}")

    # ------------------- Capture Image -------------------
    def _capture_image(self):
        if not self.capture_url:
            print('Đường dẫn chụp ảnh trống')
            self.processing = None
            return

        print("=== Starting capture image ===")
        # Cleanup threads cũ
        self._cleanup_threads(self._cam_capture_threads)

        # Tạo thread mới
        thread = QThread()
        worker = CameraCaptureWorker(self.capture_url)
        worker.moveToThread(thread)
        
        # Generate unique ID
        thread_id = id(thread)
        self._cam_capture_threads[thread_id] = (thread, worker)
        print(f"Created capture thread {thread_id}")
        
        # Connect signals - CHỈ CONNECT MỘT LẦN
        thread.started.connect(worker.start)
        
        # Wrapper để tránh emit nhiều lần
        captured_emitted = [False]
        def on_captured(b):
            if not captured_emitted[0]:
                captured_emitted[0] = True
                print(f"Captured image, thread {thread_id}")
                self._on_captured(b)
                # Cleanup sau khi xử lý xong
                QTimer.singleShot(100, lambda: self._remove_thread(self._cam_capture_threads, thread_id))
        
        worker.captured.connect(on_captured)
        thread.start()

    def _remove_thread(self, thread_dict, thread_id):
        """Safely remove thread from dict"""
        try:
            if thread_id in thread_dict:
                thread, worker = thread_dict[thread_id]
                print(f"Removing thread {thread_id}")
                
                # Disconnect signals
                try:
                    thread.started.disconnect()
                except:
                    pass
                
                # Quit thread if still running
                if thread.isRunning():
                    thread.quit()
                    thread.wait(1000)  # Wait max 1 second
                
                # Delete later
                thread.deleteLater()
                worker.deleteLater()
                
                # Remove from dict
                del thread_dict[thread_id]
                print(f"Thread {thread_id} removed successfully")
        except Exception as e:
            print(f"Error removing thread {thread_id}: {e}")

    # ------------------- On Captured -------------------
    def _on_captured(self, b):
        print("=== Processing captured image ===")
        self.processing['image'] = b

        # Cleanup threads cũ
        self._cleanup_threads(self._proccess_plate_threads)

        # Plate processing
        thread = QThread()
        worker = ProccessPlateWorker(self.plate_proccessor, bytes_to_ndarray(b))
        worker.moveToThread(thread)
        
        # Generate unique ID
        thread_id = id(thread)
        self._proccess_plate_threads[thread_id] = (thread, worker)
        print(f"Created process plate thread {thread_id}")
        
        # Connect signals
        thread.started.connect(worker.run)
        
        # Wrapper để tránh emit nhiều lần
        finished_emitted = [False]
        def on_finished(data):
            if not finished_emitted[0]:
                finished_emitted[0] = True
                print(f"Plate processing finished, thread {thread_id}")
                self._on_image_proccessing_completed(data)
                # Cleanup sau khi xử lý xong
                QTimer.singleShot(100, lambda: self._remove_thread(self._proccess_plate_threads, thread_id))
        
        worker.finished.connect(on_finished)
        thread.start()

        self.on_ui_event(EventType.ESP32CAM_RECEIVED_CAPTURE, QPixmap.fromImage(QImage.fromData(b)))

    # ------------------- Image Processing Completed -------------------
    def _on_image_proccessing_completed(self, data):
        print("=== Image processing completed ===")
        if data is None:
            self.processing['status'] = 'Xử lý thất bại, không phát hiện biển số'
            print("Plate detection failed")
            self.on_ui_event(EventType.STATUS_CHANGED, "Không phát hiện biển số")
            return

        plate_number, vehicle_type, cropped_plate = data
        self.processing['plate'] = plate_number
        self.processing['vehicle_type'] = vehicle_type
        self.processing['cropped_plate'] = cropped_plate
        
        print(f"Plate: {plate_number}, Vehicle: {vehicle_type}")
        self._check_with_server()

    # ------------------- Check With Server -------------------
    def _check_with_server(self):
        print("=== Checking with server ===")
        # Tạo thread mới
        thread = QThread()
        worker = CallApiWorker(
            self.api.check_in_out,
            self.processing['uid'],
            self.processing['plate'],
            self.processing['image']
        )

        worker.moveToThread(thread)
        
        # Generate unique ID
        thread_id = id(thread)
        self._api_threads[thread_id] = (thread, worker)
        print(f"Created API thread {thread_id}")

        # Connect signals
        thread.started.connect(worker.run)
        
        # Wrapper để tránh emit nhiều lần
        finished_emitted = [False]
        def on_finished(result):
            if not finished_emitted[0]:
                finished_emitted[0] = True
                print(f"API call finished, thread {thread_id}")
                self._on_api_result(result)
                # Cleanup sau khi xử lý xong
                QTimer.singleShot(100, lambda: self._remove_thread(self._api_threads, thread_id))
        
        worker.finished.connect(on_finished)
        
        # Handle failed signal if exists
        if hasattr(worker, 'failed'):
            failed_emitted = [False]
            def on_failed(error):
                if not failed_emitted[0]:
                    failed_emitted[0] = True
                    print(f"API call failed: {error}")
                    self.on_ui_event(EventType.STATUS_CHANGED, f"Lỗi API: {error}")
                    QTimer.singleShot(100, lambda: self._remove_thread(self._api_threads, thread_id))
            
            worker.failed.connect(on_failed)
        
        thread.start()

    # ------------------- API Result -------------------
    def _on_api_result(self, result):
        print(f"=== API Result received: {result} ===")
    
        cropped = self.processing['cropped_plate']
        print(cropped.shape, cropped.dtype)

        # BGR → RGB nếu cần
        img = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB) if cropped.ndim == 3 else cropped

        h, w = img.shape[:2]
        bytes_line = w * (3 if img.ndim == 3 else 1)
        fmt = QImage.Format_RGB888 if img.ndim == 3 else QImage.Format_Grayscale8

        qimg = QImage(img.data, w, h, bytes_line, fmt)
        pix = QPixmap.fromImage(qimg.copy())

        success, res = result
        self.on_ui_event(EventType.STATUS_CHANGED, res.get("message"))
        if success:
            self.on_ui_event(EventType.CHECKED_STATUS, (res.get("data", {}), pix))

    # ------------------- Camera Stream -------------------
    def _start_camera(self, stream_url):
        print("=== Starting camera stream ===")
        # Cleanup threads cũ
        self._cleanup_threads(self._cam_stream_threads)

        # Tạo thread mới
        thread = QThread()
        worker = CamStreamWorker(stream_url)
        worker.moveToThread(thread)
        
        # Generate unique ID
        thread_id = id(thread)
        self._cam_stream_threads[thread_id] = (thread, worker)
        print(f"Created camera stream thread {thread_id}")
        
        # Connect signals
        thread.started.connect(worker.run)
        worker.frame_received.connect(lambda f: self.on_ui_event(EventType.ESP32CAM_RECEIVED_FRAME, f))
        
        thread.start()

    def _stop_camera_stream(self):
        print('=== Stopping camera stream ===')
        self.on_ui_event(EventType.ESP32CAM_RECEIVED_FRAME, QPixmap())
        
        # Cleanup tất cả camera stream threads
        self._cleanup_threads(self._cam_stream_threads)