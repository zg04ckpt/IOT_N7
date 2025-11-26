from PySide6.QtCore import QObject, QThread, Signal
from PySide6.QtGui import QImage, QPixmap
import cv2


class CamStreamWorker(QObject):
    frame_received = Signal(QPixmap)

    def __init__(self, camera_url):
        super().__init__()
        self.camera_url = camera_url
        self.running = True

    def stop(self):
        self.running = False

    def run(self):
        cap = cv2.VideoCapture(self.camera_url)
        if not cap.isOpened():
            print("Failed to open camera stream")
            return

        while self.running:
            ret, frame = cap.read()
            if not ret:
                continue

            # Convert BGR -> RGB để Qt hiển thị đúng màu
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            h, w, ch = frame_rgb.shape
            bytes_per_line = ch * w
            qt_image = QImage(frame_rgb.data, w, h, bytes_per_line, QImage.Format_RGB888)
            pixmap = QPixmap.fromImage(qt_image)

            self.frame_received.emit(pixmap)

        cap.release()