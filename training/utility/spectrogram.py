from pathlib import Path
from typing import Tuple

import librosa
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np


def compute_mel_spectrogram(
    signal: np.ndarray,
    sample_rate: int,
    n_fft: int,
    hop_length: int,
    n_mels: int,
    f_min: float,
    f_max: float,
    power: float,
    top_db: float,
) -> np.ndarray:
    mel = librosa.feature.melspectrogram(
        y=signal,
        sr=sample_rate,
        n_fft=n_fft,
        hop_length=hop_length,
        n_mels=n_mels,
        fmin=f_min,
        fmax=f_max,
        power=power,
    )
    return librosa.power_to_db(mel, ref=np.max, top_db=top_db)


def save_spectrogram_image(
    spectrogram_db: np.ndarray,
    out_path: Path,
    img_size: Tuple[int, int],
    dpi: int,
    colormap: str,
) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)

    height, width = img_size
    fig = plt.figure(figsize=(width / dpi, height / dpi), dpi=dpi)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis("off")

    ax.imshow(
        _normalize_spectrogram(spectrogram_db),
        aspect="auto",
        origin="lower",
        cmap=colormap,
        interpolation="bilinear",
    )

    plt.savefig(str(out_path), dpi=dpi, bbox_inches=None, pad_inches=0)
    plt.close(fig)


def _normalize_spectrogram(spectrogram_db: np.ndarray) -> np.ndarray:
    minimum = spectrogram_db.min()
    maximum = spectrogram_db.max()

    if maximum - minimum < 1e-6:
        return np.zeros_like(spectrogram_db)

    return (spectrogram_db - minimum) / (maximum - minimum)
