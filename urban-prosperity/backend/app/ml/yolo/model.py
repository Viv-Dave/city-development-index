from typing import Optional, List, Dict, Any

try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False
    YOLO = None

class YOLOv8RoadDetector:
    """
    Wrapper for Ultralytics YOLOv8 road damage detection network.
    Designed to load YOLOv8n or custom weights trained on RDD2020 / RDD-India.
    """
    def __init__(self, weights_path: Optional[str] = None):
        self.weights_path = weights_path
        self.model = None
        self.is_loaded = False

        if ULTRALYTICS_AVAILABLE and weights_path:
            try:
                self.model = YOLO(weights_path)
                self.is_loaded = True
            except Exception:
                self.is_loaded = False
