from typing import Dict, Any

DEFAULTS: Dict[str, Any] = {
    "sample_rate": 22050,
    "duration": 30,
    "offset": 0.0,
    "n_fft": 2048,
    "hop_length": 512,
    "n_mels": 128,
    "f_min": 20.0,
    "f_max": 8000.0,
    "power": 2.0,
    "top_db": 80.0,
    "img_size": (224, 224),
    "dpi": 100,
    "colormap": "magma",
}
