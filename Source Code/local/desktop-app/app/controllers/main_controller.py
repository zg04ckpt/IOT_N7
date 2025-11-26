from enum import Enum
from PySide6.QtCore import QObject, QThread, Signal
from PySide6.QtGui import QPixmap
from app.models.cam_stream_worker import CamStreamWorker
from app.models.cap_capture_worker import CameraCaptureWorker
from app.models.enums import EventType
from app.mqtt.mqtt_client import MQTTClient
from PySide6.QtGui import QImage, QPixmap

class MainController:
    def __init__(self, on_ui_event):
        self.on_ui_event = on_ui_event
        self.mqtt_client = MQTTClient(self._dispatch_message)
        self.mqtt_client.run()

        self.cam_stream_worker = None
        self.cam_stream_thread = None

        self.capture_url = None
        self.cam_capture_worker = None
        self.cam_capture_thread = None

    def _dispatch_message(self, type, message):
        print(f'Received message type: {type}')
        match type:

            case EventType.ESP32C3_CONNECTED:
                self.on_ui_event(type, None)
            case EventType.ESP32C3_UID:
                self.on_ui_event(type, message)
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
    
    def _capture_image(self):
        if not self.capture_url:
            print('Đường dẫn chụp ảnh trống')
            return
        
        # Nếu còn thread cũ => dừng
        if self.cam_capture_worker:
            self.cam_capture_worker.stop()
            self.cam_capture_worker = None
        if self.cam_capture_thread:
            self.cam_capture_thread.quit()
            self.cam_capture_thread.wait()
            self.cam_capture_thread = None

        self.cam_capture_thread = QThread()
        self.cam_capture_worker = CameraCaptureWorker(self.capture_url)
        self.cam_capture_worker.moveToThread(self.cam_capture_thread)
        self.cam_capture_thread.started.connect(self.cam_capture_worker.start)
        self.cam_capture_worker.captured.connect(self._on_captured)
        self.cam_capture_thread.start()

    def _on_captured(self, b):
        self.on_ui_event(
            EventType.ESP32CAM_RECEIVED_CAPTURE,
            QPixmap.fromImage(QImage.fromData(b))
        )

    def _start_camera(self, stream_url):
        self.cam_stream_thread = QThread()
        self.cam_stream_worker = CamStreamWorker(stream_url)

        self.cam_stream_worker.moveToThread(self.cam_stream_thread)
        self.cam_stream_thread.started.connect(self.cam_stream_worker.run)
        self.cam_stream_worker.frame_received.connect(lambda f: self.on_ui_event(EventType.ESP32CAM_RECEIVED_FRAME, f))

        self.cam_stream_thread.start()
    
    def _stop_camera_stream(self):
        print('Đang dừng camera stream')
        self.on_ui_event(EventType.ESP32CAM_RECEIVED_FRAME, QPixmap())
        if self.cam_stream_worker:
            self.cam_stream_worker.stop()
            self.cam_stream_worker = None
        if self.cam_stream_thread:
            self.cam_stream_thread.quit()
            self.cam_stream_thread.wait()
            self.cam_stream_thread = None
    