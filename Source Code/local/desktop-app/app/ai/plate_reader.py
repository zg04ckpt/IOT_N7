import os
from typing import Dict, Any, Optional, Tuple, List
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

import cv2
import numpy as np
from easyocr import Reader
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PlateReader:
    def __init__(self, lang_list=('en',), gpu=False, num_threads=3):
        try:
            logger.info("Initializing EasyOCR...")
            self.ocr = Reader(list(lang_list), gpu=gpu)
            logger.info("EasyOCR initialized successfully")
        except Exception as e:
            logger.exception("Error initializing EasyOCR: %s", e)
            raise

        # debug directory 
        base = os.path.dirname(os.path.dirname(__file__))
        self.debug_dir = os.path.join(base, 'temps', 'proccessing_images')
        os.makedirs(self.debug_dir, exist_ok=True)
        
        # Multi-threading configuration
        self.num_threads = num_threads

    def _save_step(self, img: np.ndarray, step: str) -> str:
        try:
            filename = f"{step}.png"
            path = os.path.join(self.debug_dir, filename)
            if img is None:
                return path

            if img.dtype != np.uint8:
                to_write = cv2.convertScaleAbs(img)
            else:
                to_write = img
            cv2.imwrite(path, to_write)
            return path
        except Exception:
            logger.exception("Failed to save debug image for step %s", step)
            return ""

    def _preprocess_plate_image(self, image: np.ndarray, save_steps: bool = True) -> Tuple[Optional[np.ndarray], Dict[str, str]]:
        saved = {}
        if image is None:
            return None, saved

        # Save original cropped plate for debugging
        if save_steps:
            saved['cropped'] = self._save_step(image, 'cropped_plate')

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        if save_steps:
            saved['gray'] = self._save_step(gray, 'gray')

        # Upscale small images to improve OCR accuracy (but don't overly enlarge)
        h, w = gray.shape[:2]
        target_w = 600
        if w < target_w:
            scale = target_w / float(w)
            new_h = int(h * scale)
            gray = cv2.resize(gray, (target_w, new_h), interpolation=cv2.INTER_CUBIC)
            if save_steps:
                saved['resized'] = self._save_step(gray, 'resized')

        return gray, saved

    def read_plate_with_frame(self, image_frame: np.ndarray, save_steps: bool = True) -> Dict[str, Any]:
        try:
            if image_frame is None:
                return {
                    'success': False,
                    'text': 'N/A',
                    'confidence': 0.0,
                    'error': 'Input image_frame is None',
                    'debug_paths': {}
                }

            processed, saved = self._preprocess_plate_image(image_frame, save_steps=save_steps)
            if processed is None:
                return {'success': False, 'text': 'N/A', 'confidence': 0.0, 'error': 'Preprocessing failed', 'debug_paths': saved}

            # Multi-threaded OCR with voting mechanism
            text, confidence = self._read_with_voting(processed)
            
            success = (text != 'N/A' and confidence > 0)
            error_msg = None
            if not success:
                error_msg = 'Không phát hiện ký tự trên ảnh (OCR không trả về kết quả rõ ràng)'

            return {
                'success': success,
                'text': text,
                'confidence': confidence,
                'error': error_msg,
                'debug_paths': saved
            }

        except Exception as e:
            logger.exception("Error reading plate: %s", e)
            return {
                'success': False,
                'text': 'N/A',
                'confidence': 0.0,
                'error': str(e),
                'debug_paths': {}
            }
    
    def _read_with_voting(self, processed_image: np.ndarray) -> Tuple[str, float]:
        def single_ocr_read(img_copy: np.ndarray, thread_id: int) -> Tuple[str, float]:
            """Single OCR read operation for parallel execution."""
            try:
                results = self.ocr.readtext(img_copy, detail=1, paragraph=False)
                text, conf = self._process_results(results)
                logger.info(f"Thread {thread_id}: text='{text}', conf={conf:.2f}")
                return text, conf
            except Exception as e:
                logger.error(f"Thread {thread_id} error: {e}")
                return "N/A", 0.0
        
        # Run OCR in parallel threads
        results_list: List[Tuple[str, float]] = []
        
        with ThreadPoolExecutor(max_workers=self.num_threads) as executor:
            # Submit all tasks
            futures = {
                executor.submit(single_ocr_read, processed_image.copy(), i): i 
                for i in range(self.num_threads)
            }
            
            # Collect results as they complete
            for future in as_completed(futures):
                try:
                    result = future.result()
                    results_list.append(result)
                except Exception as e:
                    logger.error(f"Thread execution error: {e}")
        
        # Filter out N/A results
        valid_results = [(text, conf) for text, conf in results_list if text != 'N/A']
        
        if not valid_results:
            return "N/A", 0.0
        
        # Voting mechanism: select the most common text
        texts = [text for text, _ in valid_results]
        text_counter = Counter(texts)
        most_common_text, count = text_counter.most_common(1)[0]
        
        # Calculate average confidence for the most common text
        confidences = [conf for text, conf in valid_results if text == most_common_text]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        logger.info(f"Voting result: '{most_common_text}' (appeared {count}/{len(texts)} times, avg_conf={avg_confidence:.2f})")
        
        return most_common_text, avg_confidence

    def _process_results(self, results) -> Tuple[str, float]:
        """Process EasyOCR results and return combined text and average confidence."""
        if not results:
            return "N/A", 0.0

        all_texts = []
        all_confidences = []
        try:
            for item in results:
                # results can be (bbox, text, prob) depending on easyocr version
                if len(item) == 3:
                    bbox, text, prob = item
                else:
                    # fallback if different format
                    text = item[1]
                    prob = item[-1] if len(item) > 2 else 0.0

                if prob >= 0.3 and text and text.strip():
                    all_texts.append(text.strip())
                    all_confidences.append(float(prob))
        except Exception as e:
            logger.exception("Error processing OCR results: %s", e)
            return "N/A", 0.0

        if not all_texts:
            return "N/A", 0.0

        combined_text = ' '.join(all_texts)
        avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0.0
        return combined_text, avg_confidence
