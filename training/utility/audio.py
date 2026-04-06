import warnings
from pathlib import Path
from typing import Tuple

import librosa
import numpy as np
import soundfile as sf


def mp3_to_wav(
    mp3_path: Path,
    wav_path: Path,
    sample_rate: int,
    duration: float,
    offset: float,
) -> Path:
    wav_path.parent.mkdir(parents=True, exist_ok=True)

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        try:
            signal, _ = librosa.load(
                str(mp3_path),
                sr=sample_rate,
                mono=True,
                offset=offset,
                duration=duration,
                res_type="kaiser_best",
            )
        except Exception as exc:
            raise RuntimeError(f"librosa.load failed for {mp3_path}: {exc}") from exc

    expected_samples = int(sample_rate * duration)
    signal = _fit_signal_length(signal, expected_samples)
    signal = np.clip(signal, -1.0, 1.0)

    sf.write(str(wav_path), signal, sample_rate, subtype="PCM_16")
    return wav_path


def load_wav(wav_path: Path, sample_rate: int) -> Tuple[np.ndarray, int]:
    signal, sr = sf.read(str(wav_path), dtype="float32", always_2d=False)

    if signal.ndim > 1:
        signal = signal.mean(axis=1)

    if sr != sample_rate:
        signal = librosa.resample(signal, orig_sr=sr, target_sr=sample_rate)
        sr = sample_rate

    return signal, sr


def _fit_signal_length(signal: np.ndarray, expected_samples: int) -> np.ndarray:
    if len(signal) > expected_samples:
        return signal[:expected_samples]

    if len(signal) < expected_samples:
        pad = expected_samples - len(signal)
        return np.pad(signal, (0, pad), mode="constant")

    return signal
