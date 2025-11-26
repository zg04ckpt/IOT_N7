"""
Module chuyên dụng để detect và cắt vùng biển số xe từ ảnh đầy đủ
Sử dụng YOLO model để detect biển số và trả về ảnh đã cắt
Interface đơn giản: chỉ một hàm public duy nhất
"""

import cv2
import numpy as np
from ultralytics import YOLO
from typing import Dict, Any, Optional
import logging
import os

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PlateDetector:
    def __init__(self, model_path: str = 'ai/model.pt', conf_threshold: float = 0.3):
        """
        Khởi tạo PlateDetector
        
        Args:
            model_path (str): Đường dẫn đến model YOLO
            conf_threshold (float): Ngưỡng confidence để detect
        """
        self._model_path = model_path
        self._conf_threshold = conf_threshold
        
        # Kiểm tra file model
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Không tìm thấy model file: {model_path}")
        
        # Khởi tạo YOLO model
        try:
            self._model = YOLO(model_path)
            logger.info(f"YOLO model đã được load từ: {model_path}")
        except Exception as e:
            logger.error(f"Lỗi load YOLO model: {e}")
            raise
        
    def detect_plate_with_frame(self, frame) -> Dict[str, Any]:
        """ Cắt biển số từ ảnh """
        try:
            if frame is None:
                return {
                    'success': False,
                    'cropped_plate': None,
                    'confidence': 0.0,
                    'bbox': None,
                    'error': f"Không thể đọc ảnh"
                }
            
            # Detect và cắt biển số
            result = self._detect_and_crop_best_plate(frame)
            result['success'] = result['cropped_plate'] is not None
            
            return result
            
        except Exception as e:
            logger.error(f"Lỗi detect biển số: {e}")
            return {
                'success': False,
                'cropped_plate': None,
                'confidence': 0.0,
                'bbox': None,
                'error': str(e)
            }
    
    def _detect_and_crop_best_plate(self, image_array: np.ndarray) -> Dict[str, Any]:
        """
            Detect và cắt biển số tốt nhất từ mảng ảnh
        """
        try:
            # Detect biển số
            results = self._model(image_array, conf=self._conf_threshold, verbose=False)
            
            # Lọc chỉ lấy License_Plate
            plates = []
            for box in results[0].boxes:
                cls_id = int(box.cls[0])
                cls_name = results[0].names[cls_id]
                if cls_name == "License_Plate":
                    bbox = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    plates.append((bbox, conf))
            
            logger.info(f"Tìm thấy {len(plates)} biển số")
            
            if not plates:
                return {
                    'cropped_plate': None,
                    'confidence': 0.0,
                    'bbox': None,
                    'error': 'Không tìm thấy biển số nào'
                }
            
            # Chọn biển số có confidence cao nhất
            best_bbox, best_conf = max(plates, key=lambda x: x[1])
            x1, y1, x2, y2 = map(int, best_bbox)
            
            # Kiểm tra bbox hợp lệ
            h, w = image_array.shape[:2]
            x1 = max(0, min(x1, w-1))
            y1 = max(0, min(y1, h-1))
            x2 = max(x1+1, min(x2, w))
            y2 = max(y1+1, min(y2, h))
            
            # Cắt vùng biển số
            # Thêm padding vào bbox
            pad = 20
            x1_pad = max(0, x1 - pad)
            y1_pad = max(0, y1 - pad)
            x2_pad = min(w, x2 + pad)
            y2_pad = min(h, y2 + pad)

            # Cắt vùng biển số với padding
            cropped_plate = image_array[y1_pad:y2_pad, x1_pad:x2_pad]

            # Cải thiện chất lượng ảnh
            enhanced_plate = self._enhance_plate(cropped_plate)

            logger.info(f"Biển số tốt nhất: bbox=({x1},{y1},{x2},{y2}), pad=({x1_pad},{y1_pad},{x2_pad},{y2_pad}), conf={best_conf:.2f}")

            return {
                'cropped_plate': enhanced_plate,
                'confidence': best_conf,
                'bbox': [x1_pad, y1_pad, x2_pad, y2_pad],
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Lỗi detect biển số: {e}")
            return {
                'cropped_plate': None,
                'confidence': 0.0,
                'bbox': None,
                'error': str(e)
            }
    
    def _enhance_plate(self, cropped_plate: np.ndarray) -> np.ndarray:
        """
        PRIVATE: Cải thiện chất lượng ảnh biển số đã cắt
        
        Args:
            cropped_plate (np.ndarray): Ảnh biển số đã cắt
            
        Returns:
            np.ndarray: Ảnh đã được cải thiện
        """
        return self._enhance_advanced(cropped_plate)
    
    def _enhance_basic(self, image: np.ndarray) -> np.ndarray:
        """
        Cải thiện ảnh cơ bản: resize + denoise + sharpen
        
        Args:
            image (np.ndarray): Ảnh gốc
            
        Returns:
            np.ndarray: Ảnh đã cải thiện
        """
        h, w = image.shape[:2]
        
        # Tăng kích thước nếu quá nhỏ
        if w < 200 or h < 50:
            scale_factor = max(200/w, 50/h, 2.0)
            image = cv2.resize(image, None, fx=scale_factor, fy=scale_factor, 
                             interpolation=cv2.INTER_CUBIC)
        
        # Denoise
        if len(image.shape) == 3:
            denoised = cv2.fastNlMeansDenoisingColored(image, None, h=3, hColor=3, 
                                                     templateWindowSize=7, searchWindowSize=21)
        else:
            denoised = cv2.fastNlMeansDenoising(image, None, h=3, 
                                              templateWindowSize=7, searchWindowSize=21)
        
        # Sharpen
        if len(denoised.shape) == 3:
            gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
        else:
            gray = denoised
        
        kernel = np.array([[-1, -1, -1],
                          [-1,  9, -1],
                          [-1, -1, -1]])
        sharpened = cv2.filter2D(gray, -1, kernel)
        
        # Convert back to BGR if needed
        if len(image.shape) == 3:
            result = cv2.cvtColor(sharpened, cv2.COLOR_GRAY2BGR)
        else:
            result = sharpened
        
        return result
    
    def _enhance_advanced(self, image: np.ndarray) -> np.ndarray:
        """
        Cải thiện ảnh nâng cao: CLAHE + bilateral filter + unsharp mask
        
        Args:
            image (np.ndarray): Ảnh gốc
            
        Returns:
            np.ndarray: Ảnh đã cải thiện nâng cao
        """
        h, w = image.shape[:2]
        
        # Tăng kích thước
        if w < 300 or h < 80:
            scale_factor = max(300/w, 80/h, 3.0)
            image = cv2.resize(image, None, fx=scale_factor, fy=scale_factor, 
                             interpolation=cv2.INTER_CUBIC)
        
        # Chuyển sang LAB color space
        if len(image.shape) == 3:
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
        else:
            l = image.copy()
        
        # CLAHE trên L channel
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l)
        
        # Merge back nếu cần
        if len(image.shape) == 3:
            enhanced_lab = cv2.merge([l_enhanced, a, b])
            enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            gray = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
        else:
            gray = l_enhanced
        
        # Bilateral filter
        bilateral = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # Unsharp mask
        gaussian_blur = cv2.GaussianBlur(bilateral, (0, 0), 2.0)
        unsharp = cv2.addWeighted(bilateral, 1.5, gaussian_blur, -0.5, 0)
        unsharp = np.clip(unsharp, 0, 255).astype(np.uint8)
        
        # Convert back to BGR nếu cần
        if len(image.shape) == 3:
            result = cv2.cvtColor(unsharp, cv2.COLOR_GRAY2BGR)
        else:
            result = unsharp
        
        return result
    
# Hàm demo sử dụng PlateDetector
def demo_plate_detector():
    """
    Demo cách sử dụng PlateDetector với interface đơn giản
    """
    print("=== Demo PlateDetector (Simplified Interface) ===")
    
    try:
        # Khởi tạo detector
        detector = PlateDetector(model_path='ai/model.pt', conf_threshold=0.3)
        
        # Test với ảnh mẫu
        test_image = "captured_images/photo_20251005_162125.jpg"
        
        if not os.path.exists(test_image):
            print(f"Không tìm thấy ảnh test: {test_image}")
            return
        
        print(f"\nDetect biển số từ: {test_image}")
        
        # Sử dụng hàm PUBLIC duy nhất
        result = detector.detect_plate(test_image)
        
        # Hiển thị kết quả
        if result['success']:
            print(f"✅ Thành công!")
            print(f"   Confidence: {result['confidence']:.2f}")
            print(f"   Bbox: {result['bbox']}")
            print(f"   Kích thước biển: {result['cropped_plate'].shape if result['cropped_plate'] is not None else 'None'}")
            
            # Lưu ảnh biển số đã cắt
            if result['cropped_plate'] is not None:
                cv2.imwrite("ai/detected_plate.jpg", result['cropped_plate'])
                print(f"   Đã lưu ảnh biển số: ai/detected_plate.jpg")
        else:
            print(f"❌ Thất bại: {result['error']}")
        
    except Exception as e:
        print(f"Lỗi demo: {e}")


if __name__ == "__main__":
    demo_plate_detector()