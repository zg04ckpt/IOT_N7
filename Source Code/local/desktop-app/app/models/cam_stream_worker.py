from PySide6.QtCore import QObject, QThread, Signal
from PySide6.QtGui import QImage, QPixmap
import cv2
import time


class CamStreamWorker(QObject):
    frame_received = Signal(QPixmap)

    def __init__(self, camera_url):
        super().__init__()
        self.camera_url = camera_url
        self.running = True

    def stop(self):
        self.running = False

    def run(self):
        cap = None
        consecutive_failures = 0
        max_consecutive_failures = 10  # Giảm xuống 10 để dừng nhanh hơn
        
        try:
            cap = cv2.VideoCapture(self.camera_url)
            if not cap.isOpened():
                print("Failed to open camera stream")
                return

            print("Camera stream opened successfully")
            
            while self.running:
                try:
                    ret, frame = cap.read()
                    if not ret:
                        consecutive_failures += 1
                        if consecutive_failures >= max_consecutive_failures:
                            print(f"Too many consecutive failures ({consecutive_failures}), stopping stream")
                            break
                        time.sleep(0.05)  # Giảm sleep time
                        continue
                    
                    # Check frame validity
                    if frame is None or frame.size == 0:
                        consecutive_failures += 1
                        continue
                    
                    # Reset failure counter on success
                    consecutive_failures = 0

                    # Convert BGR -> RGB để Qt hiển thị đúng màu
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    h, w, ch = frame_rgb.shape
                    bytes_per_line = ch * w
                    qt_image = QImage(frame_rgb.data, w, h, bytes_per_line, QImage.Format_RGB888)
                    pixmap = QPixmap.fromImage(qt_image)

                    self.frame_received.emit(pixmap)
                    
                except Exception as e:
                    print(f"Error processing frame: {e}")
                    consecutive_failures += 1
                    if consecutive_failures >= max_consecutive_failures:
                        break
                    time.sleep(0.1)

        except Exception as e:
            print(f"Camera stream error: {e}")
        finally:
            if cap is not None:
                cap.release()
            print("Camera stream stopped and released")