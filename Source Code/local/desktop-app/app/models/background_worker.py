from PySide6.QtCore import QObject, QThread, Signal

from app.controllers.main_controller import MainController

class InitMainControllerWorkers(QObject):
    finished = Signal(object)

    def __init__(self, callback=None):
        super().__init__()
        self.callback = callback
       
    def run(self):
        controller = MainController(on_ui_event=self.callback)
        self.finished.emit(controller)

def run_in_bg_async(worker_class, on_finished, *args, **kwargs):
    """
    Khởi tạo worker + QThread + kết nối signal + start thread
    - worker_class: class Worker(QObject)
    - on_finished: hàm callback nhận kết quả
    - *args, **kwargs: truyền vào constructor Worker
    """
    thread = QThread()
    worker = worker_class(*args, **kwargs)
    worker.moveToThread(thread)

    thread.started.connect(worker.run)
    worker.finished.connect(on_finished)
    worker.finished.connect(thread.quit)
    worker.finished.connect(worker.deleteLater)
    thread.finished.connect(thread.deleteLater)

    thread.start()
    return worker, thread