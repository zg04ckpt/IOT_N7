import cv2
import numpy as np


def bytes_to_ndarray(b: bytes):
    arr = np.frombuffer(b, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    return img

def ndarray_to_bytes(image: "np.ndarray", ext=".jpg") -> bytes:
    # image: np.ndarray, BGR
    success, encoded_image = cv2.imencode(ext, image)
    if not success:
        raise ValueError("Failed to encode image")
    return encoded_image.tobytes()
