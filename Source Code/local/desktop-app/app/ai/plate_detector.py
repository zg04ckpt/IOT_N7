import cv2
import numpy as np
from ultralytics import YOLO
from typing import Dict, Any, Optional, List, Tuple
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
import os

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PlateDetector:
    def __init__(self, model_path: str = r'app/ai/model.pt', conf_threshold: float = 0.3, num_threads: int = 3):
        self._model_path = model_path
        self._conf_threshold = conf_threshold
        self.num_threads = num_threads
        
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
        try:
            if frame is None:
                return {
                    'success': False,
                    'cropped_plate': None,
                    'confidence': 0.0,
                    'bbox': None,
                    'error': f"Không thể đọc ảnh"
                }
            
            # Detect và cắt biển số với đa luồng + voting
            result = self._detect_with_voting(frame)
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
    
    def _detect_with_voting(self, image_array: np.ndarray) -> Dict[str, Any]:
        def single_detection(img_copy: np.ndarray, thread_id: int) -> Dict[str, Any]:
            """Single detection operation cho parallel execution."""
            try:
                result = self._detect_and_crop_best_plate(img_copy)
                
                # Create a hashable key for voting (using bbox as identifier)
                bbox_key = None
                if result['bbox'] is not None:
                    bbox_key = tuple(result['bbox'])
                
                logger.info(f"Thread {thread_id}: bbox={bbox_key}, conf={result['confidence']:.2f}")
                
                return {
                    'result': result,
                    'bbox_key': bbox_key,
                    'thread_id': thread_id
                }
            except Exception as e:
                logger.error(f"Thread {thread_id} error: {e}")
                return {
                    'result': {'cropped_plate': None, 'confidence': 0.0, 'bbox': None, 'error': str(e)},
                    'bbox_key': None,
                    'thread_id': thread_id
                }
        
        # Run detection in parallel
        detection_results: List[Dict[str, Any]] = []
        
        with ThreadPoolExecutor(max_workers=self.num_threads) as executor:
            futures = {
                executor.submit(single_detection, image_array.copy(), i): i 
                for i in range(self.num_threads)
            }
            
            for future in as_completed(futures):
                try:
                    result = future.result()
                    detection_results.append(result)
                except Exception as e:
                    logger.error(f"Thread execution error: {e}")
        
        # Filter valid detections
        valid_detections = [
            d for d in detection_results 
            if d['result']['cropped_plate'] is not None and d['bbox_key'] is not None
        ]
        
        if not valid_detections:
            return {
                'cropped_plate': None,
                'confidence': 0.0,
                'bbox': None,
                'error': 'Không tìm thấy biển số nào sau khi thử đa luồng'
            }
        
        # Voting mechanism: Find most common bbox region (with tolerance for slight variations)
        # Group similar bboxes together
        bbox_groups = self._group_similar_bboxes(valid_detections)
        
        # Select the group with highest total confidence
        best_group = max(bbox_groups, key=lambda g: sum(d['result']['confidence'] for d in g))
        
        # From best group, select detection with highest individual confidence
        best_detection = max(best_group, key=lambda d: d['result']['confidence'])
        
        logger.info(f"Voting result: Selected bbox from thread {best_detection['thread_id']}, "
                   f"group_size={len(best_group)}/{len(valid_detections)}, "
                   f"conf={best_detection['result']['confidence']:.2f}")
        
        return best_detection['result']
    
    def _group_similar_bboxes(self, detections: List[Dict[str, Any]], tolerance: float = 20.0) -> List[List[Dict[str, Any]]]:
        if not detections:
            return []
        
        groups: List[List[Dict[str, Any]]] = []
        
        for detection in detections:
            bbox = detection['bbox_key']
            if bbox is None:
                continue
            
            # Calculate bbox center
            center_x = (bbox[0] + bbox[2]) / 2.0
            center_y = (bbox[1] + bbox[3]) / 2.0
            
            # Try to find existing group
            added_to_group = False
            for group in groups:
                # Compare with first detection in group
                ref_bbox = group[0]['bbox_key']
                ref_center_x = (ref_bbox[0] + ref_bbox[2]) / 2.0
                ref_center_y = (ref_bbox[1] + ref_bbox[3]) / 2.0
                
                # Calculate distance between centers
                distance = np.sqrt((center_x - ref_center_x)**2 + (center_y - ref_center_y)**2)
                
                if distance <= tolerance:
                    group.append(detection)
                    added_to_group = True
                    break
            
            # Create new group if not added
            if not added_to_group:
                groups.append([detection])
        
        return groups
    
    def _detect_and_crop_best_plate(self, image_array: np.ndarray) -> Dict[str, Any]:
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
        return self._enhance_advanced(cropped_plate)
    
    def _enhance_basic(self, image: np.ndarray) -> np.ndarray:
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
