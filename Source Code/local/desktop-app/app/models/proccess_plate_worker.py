from PySide6.QtCore import QObject, QThread, Signal
import numpy as np

class ProccessPlateWorker(QObject):
    finished = Signal(tuple)

    def __init__(self, proccessor, image: np.ndarray):
        super().__init__()
        self.proccessor = proccessor
        self.image = image

    def run(self):
        try:
            result = self.proccessor.proccess_image(self.image)
            
            if result and result[0]:
                plate_number, vehicle_type, cropped_plate = result
                self.finished.emit(result)
            else:
                self.finished.emit(None)
                    
        except Exception as e:
            print(f"License plate processing error: {e}")
            self.finished.emit(None)