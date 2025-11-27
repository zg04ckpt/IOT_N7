from PySide6.QtCore import QObject, Signal

class CallApiWorker(QObject):
    finished = Signal(object) 
    failed = Signal(str)

    def __init__(self, func, *args, **kwargs):
        super().__init__()
        self.func = func          # hàm API cần gọi
        self.args = args
        self.kwargs = kwargs

    def run(self):
        try:
            result = self.func(*self.args, **self.kwargs)
            self.finished.emit(result)
        except Exception as e:
            self.failed.emit(str(e))
