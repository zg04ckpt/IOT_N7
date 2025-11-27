import re
from app.ai.plate_detector import PlateDetector
from app.ai.plate_reader import PlateReader


class Proccessor:
    def __init__(self):
        self.detector = PlateDetector()
        self.reader = PlateReader()
    
    def proccess_image(self, image_frame) -> tuple[str, str, str]:
        detect_result = self.detector.detect_plate_with_frame(image_frame)
        if not detect_result['success']:
            raise Exception(f"Detect biển số thất bại: {detect_result['error']}")

        read_result = self.reader.read_plate_with_frame(detect_result['cropped_plate'])
        if not read_result['success']:
            raise Exception(f"Đọc số biển thất bại: {read_result['error']}")
        
        print(f"Đọc biển thành công!")
        print(f"Số biển: {read_result['text']}")

        valid, type, plate = self.validate_plate(read_result['text'])
        if valid:
            return plate, type, detect_result['cropped_plate']
        else:
            raise Exception("Validate plate failed")

    def validate_plate(self, plate: str) -> tuple[bool, str, str]:
        plate = plate.strip().upper().replace(" ", "").replace(".", "").replace(",", "").replace("-", "")

        pattern_xemay = re.compile(r"^[0-9]{2}[A-Z]{2}[0-9]{4,5}$") # 2 số + 2 chữ + 4-5 số
        pattern_oto = re.compile(r"^[0-9]{2}[A-Z]{1}[0-9]{4,5}$") # 2 số + 1 chữ + 4-5 số

        if len(plate) < 7:
            print(f"The length of plate is not valid: {len(plate)}")
            return False, None, None

        if pattern_xemay.match(plate):
            plate = plate[:4] + "-" + plate[4:]
            print(f"Validate successful: {plate} - Xe máy")
            return True, "Xe máy", plate
        
        if pattern_oto.match(plate):
            plate = plate[:3] + "-" + plate[3:]
            print(f"Validate successful: {plate} - Ô tô")
            return True, "Ô tô", plate
        
        print(f"Invalid plate: {plate}")
        return False, None, None