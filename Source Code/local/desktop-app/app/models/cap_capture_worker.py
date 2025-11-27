import asyncio
import httpx
from PySide6.QtCore import QObject, Signal, QThread
from PySide6.QtGui import QPixmap
import cv2
import numpy as np
from PySide6.QtGui import QImage

def jpeg_bytes_to_pixmap(data: bytes) -> QPixmap:
    """Chuyển bytes JPEG thành QPixmap"""
    nparr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        return QPixmap()
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    h, w, ch = frame_rgb.shape
    bytes_per_line = ch * w
    qt_image = QImage(frame_rgb.data, w, h, bytes_per_line, QImage.Format_RGB888)
    return QPixmap.fromImage(qt_image)

class CameraCaptureWorker(QObject):
    captured = Signal(bytes)

    def __init__(self, url: str):
        super().__init__()
        self.url = url
        self.running = False

    def start(self):
        self.running = True
        self._run()

    def stop(self):
        self.running = False

    def _run(self):
        import asyncio
        asyncio.run(self._fetch_once())

    async def _fetch_once(self):
        async with httpx.AsyncClient() as client:
            try:
                r = await client.get(self.url)
                if r.status_code == 200:
                    self.captured.emit(r.content)  # emit bytes
            except Exception as e:
                print("Error fetching camera capture:", e)