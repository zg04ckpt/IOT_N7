"""PlateReader: EasyOCR-based plate reader with optional debug dumps.

This module saves intermediate preprocessing images (grayscale, blur,
enhanced, sharp, thresh, opening, closed, final) into
`<repo>/temps/proccessing_images` when `save_steps=True` is passed to
`preprocess_plate_image` or when `read_plate_with_frame` is called.

Note: directory name follows your request (`proccessing_images`).
"""

import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

import cv2
import numpy as np
from easyocr import Reader
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PlateReader:
    def __init__(self, lang_list=('en',), gpu=False):
        """Initialize EasyOCR reader and prepare debug directory."""
        try:
            logger.info("Initializing EasyOCR...")
            self.ocr = Reader(list(lang_list), gpu=gpu)
            logger.info("EasyOCR initialized successfully")
        except Exception as e:
            logger.exception("Error initializing EasyOCR: %s", e)
            raise

        # debug directory (exact path requested)
        base = os.path.dirname(os.path.dirname(__file__))
        self.debug_dir = os.path.join(base, 'temps', 'proccessing_images')
        os.makedirs(self.debug_dir, exist_ok=True)

    def _save_step(self, img: np.ndarray, step: str) -> str:
        """Save an intermediate image and return the filepath.

        Callers pass a single filename-like step (e.g. 'cropped_plate', 'gray',
        'resized'). Adjusted to accept (img, step) to match existing calls.
        """
        try:
            filename = f"{step}.png"
            path = os.path.join(self.debug_dir, filename)
            if img is None:
                return path
            # Ensure we write a uint8 image
            if img.dtype != np.uint8:
                to_write = cv2.convertScaleAbs(img)
            else:
                to_write = img
            cv2.imwrite(path, to_write)
            return path
        except Exception:
            logger.exception("Failed to save debug image for step %s", step)
            return ""

    def preprocess_plate_image(self, image: np.ndarray, save_steps: bool = True) -> Tuple[Optional[np.ndarray], Dict[str, str]]:
        """Minimal preprocessing: convert to grayscale and resize if needed.

        The user requested no heavy preprocessing (no sharpening, thresholding,
        or morphology). We only convert to grayscale and upscale small images to
        a target width to help OCR. Returns (processed_image, saved_paths).
        """
        saved = {}
        if image is None:
            return None, saved

        # Save original cropped plate for debugging
        if save_steps:
            saved['cropped'] = self._save_step(image, 'cropped_plate')

        # Convert to grayscale (EasyOCR accepts color or gray; grayscale is simpler)
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
        """Read text from a plate image frame. Saves preprocessing steps when requested.

        Returns a dict with keys: success, text, confidence, error, debug_paths
        """
        try:
            if image_frame is None:
                return {
                    'success': False,
                    'text': 'N/A',
                    'confidence': 0.0,
                    'error': 'Input image_frame is None',
                    'debug_paths': {}
                }

            processed, saved = self.preprocess_plate_image(image_frame, save_steps=save_steps)
            if processed is None:
                return {'success': False, 'text': 'N/A', 'confidence': 0.0, 'error': 'Preprocessing failed', 'debug_paths': saved}

            # EasyOCR expects either path or numpy image; we pass the image directly
            results = self.ocr.readtext(processed, detail=1, paragraph=False)

            text, confidence = self._process_results(results)
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
