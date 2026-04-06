"""
FMA Dataset Preprocessing & Mel Spectrogram Generator

Converts FMA audio (mp3) → WAV → Mel Spectrogram images for CNN-based
music genre classification.

Pipeline:
    FMA MP3  →  WAV (resampled)  →  Mel Spectrogram  →  PNG images

Usage:
    python preprocess.py --fma_dir /data/fma_small --output_dir /data/spectrograms
    python preprocess.py --fma_dir /data/fma_small --output_dir /data/spectrograms \\
        --split train val test --workers 8 --duration 30

Author: Generated utility for FMA genre classification
"""

import os
import sys
import csv
import logging
import argparse
import warnings
import traceback
from pathlib import Path
from typing import Optional, Tuple, List, Dict
from concurrent.futures import ProcessPoolExecutor, as_completed

import numpy as np
import pandas as pd
import librosa
import librosa.display
import soundfile as sf
import matplotlib
matplotlib.use("Agg")  
import matplotlib.pyplot as plt
from tqdm import tqdm

def setup_logger(log_file: Optional[str] = None) -> logging.Logger:
    logger = logging.getLogger("fma_preprocess")
    logger.setLevel(logging.DEBUG)
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s",
                            datefmt="%Y-%m-%d %H:%M:%S")

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    if log_file:
        fh = logging.FileHandler(log_file)
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(fmt)
        logger.addHandler(fh)

    return logger

logger = setup_logger()

# ──────────────────────────────────────────────────────────────────────────────
# Default hyper-parameters
# ──────────────────────────────────────────────────────────────────────────────

DEFAULTS = dict(
    sample_rate     = 22050,    # Hz – standard for music analysis
    duration        = 30,       # seconds to extract from each track
    offset          = 0.0,      # start offset in seconds
    n_fft           = 2048,     # FFT window size
    hop_length      = 512,      # frames between STFT columns
    n_mels          = 128,      # number of mel filter banks
    f_min           = 20.0,     # lowest frequency (Hz)
    f_max           = 8000.0,   # highest frequency (Hz)
    power           = 2.0,      # power spectrogram (2 = power, 1 = magnitude)
    top_db          = 80.0,     # dynamic range clipping for dB conversion
    img_size        = (224, 224),  # output image size (H, W)
    dpi             = 100,
    colormap        = "magma",
)

# ──────────────────────────────────────────────────────────────────────────────
# FMA metadata helpers
# ──────────────────────────────────────────────────────────────────────────────

def load_fma_metadata(fma_dir: Path) -> pd.DataFrame:
    """
    Load tracks.csv from the FMA metadata folder.
    Returns a DataFrame with track_id, genre_top, split columns.
    """
    meta_dir = fma_dir / "fma_metadata"
    tracks_path = meta_dir / "tracks.csv"

    if not tracks_path.exists():
        # Fallback: look one level up
        tracks_path = fma_dir / "tracks.csv"

    if not tracks_path.exists():
        raise FileNotFoundError(
            f"tracks.csv not found. Expected at {tracks_path}.\n"
            "Download FMA metadata from https://github.com/mdeff/fma"
        )

    logger.info(f"Loading metadata from {tracks_path}")
    tracks = pd.read_csv(tracks_path, index_col=0, header=[0, 1])

    # Keep only the columns we need, flatten multi-index
    df = pd.DataFrame({
        "track_id"  : tracks.index,
        "genre_top" : tracks["track"]["genre_top"].values,
        "split"     : tracks["set"]["split"].values,
        "subset"    : tracks["set"]["subset"].values,
    })
    df = df.dropna(subset=["genre_top", "split"])
    df["track_id"] = df["track_id"].astype(int)
    df["genre_top"] = df["genre_top"].str.strip()
    logger.info(f"Metadata loaded: {len(df)} tracks, "
                f"{df['genre_top'].nunique()} genres")
    return df


def filter_by_subset(df: pd.DataFrame, subset: str) -> pd.DataFrame:
    """Filter to fma_small / fma_medium / fma_large / fma_full."""
    if subset == "all":
        return df
    result = df[df["subset"] == subset]
    logger.info(f"Filtered to subset='{subset}': {len(result)} tracks")
    return result


def get_mp3_path(fma_dir: Path, track_id: int) -> Path:
    """
    FMA stores audio as: <fma_dir>/fma_small/000/000002.mp3
    The first three digits of the zero-padded 6-digit ID form the folder.
    """
    tid_str = f"{track_id:06d}"
    folder  = tid_str[:3]
    # Try multiple common layouts
    for audio_root in [fma_dir, fma_dir / "fma_small", fma_dir / "fma_medium",
                       fma_dir / "fma_large"]:
        p = audio_root / folder / f"{tid_str}.mp3"
        if p.exists():
            return p
    raise FileNotFoundError(f"MP3 not found for track_id={track_id}")

# ──────────────────────────────────────────────────────────────────────────────
# Audio I/O
# ──────────────────────────────────────────────────────────────────────────────

def mp3_to_wav(
    mp3_path: Path,
    wav_path: Path,
    sample_rate: int = DEFAULTS["sample_rate"],
    duration: float = DEFAULTS["duration"],
    offset: float   = DEFAULTS["offset"],
) -> Path:
    """
    Load an MP3, resample to `sample_rate`, trim/pad to `duration` seconds,
    and write a mono WAV file.

    Returns wav_path on success.
    Raises RuntimeError on failure.
    """
    wav_path.parent.mkdir(parents=True, exist_ok=True)

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        try:
            y, sr = librosa.load(
                str(mp3_path),
                sr=sample_rate,
                mono=True,
                offset=offset,
                duration=duration,
                res_type="kaiser_best",
            )
        except Exception as e:
            raise RuntimeError(f"librosa.load failed for {mp3_path}: {e}")

    expected_samples = int(sample_rate * duration)

    # Trim or zero-pad to exact length
    if len(y) > expected_samples:
        y = y[:expected_samples]
    elif len(y) < expected_samples:
        pad = expected_samples - len(y)
        y = np.pad(y, (0, pad), mode="constant")

    # Clip to [-1, 1] to avoid clipping artefacts on write
    y = np.clip(y, -1.0, 1.0)

    sf.write(str(wav_path), y, sample_rate, subtype="PCM_16")
    return wav_path


def load_wav(
    wav_path: Path,
    sample_rate: int = DEFAULTS["sample_rate"],
) -> Tuple[np.ndarray, int]:
    """Load a WAV file. Returns (signal, sample_rate)."""
    y, sr = sf.read(str(wav_path), dtype="float32", always_2d=False)
    if y.ndim > 1:          # convert stereo → mono
        y = y.mean(axis=1)
    if sr != sample_rate:   # resample if needed
        y = librosa.resample(y, orig_sr=sr, target_sr=sample_rate)
        sr = sample_rate
    return y, sr

# ──────────────────────────────────────────────────────────────────────────────
# Spectrogram computation
# ──────────────────────────────────────────────────────────────────────────────

def compute_mel_spectrogram(
    y: np.ndarray,
    sr: int,
    n_fft:      int   = DEFAULTS["n_fft"],
    hop_length: int   = DEFAULTS["hop_length"],
    n_mels:     int   = DEFAULTS["n_mels"],
    f_min:      float = DEFAULTS["f_min"],
    f_max:      float = DEFAULTS["f_max"],
    power:      float = DEFAULTS["power"],
    top_db:     float = DEFAULTS["top_db"],
) -> np.ndarray:
    """
    Compute a log-scaled mel spectrogram in dB.

    Returns:
        S_db (np.ndarray): shape (n_mels, T)
    """
    S = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_fft=n_fft,
        hop_length=hop_length,
        n_mels=n_mels,
        fmin=f_min,
        fmax=f_max,
        power=power,
    )
    S_db = librosa.power_to_db(S, ref=np.max, top_db=top_db)
    return S_db


def normalize_spectrogram(S_db: np.ndarray) -> np.ndarray:
    """
    Normalize spectrogram to [0, 1] using global min-max.
    Prevents division by zero when the spectrogram is silent.
    """
    s_min, s_max = S_db.min(), S_db.max()
    if s_max - s_min < 1e-6:
        return np.zeros_like(S_db)
    return (S_db - s_min) / (s_max - s_min)

# ──────────────────────────────────────────────────────────────────────────────
# Image saving
# ──────────────────────────────────────────────────────────────────────────────

def save_spectrogram_image(
    S_db:     np.ndarray,
    out_path: Path,
    img_size: Tuple[int, int] = DEFAULTS["img_size"],
    dpi:      int             = DEFAULTS["dpi"],
    colormap: str             = DEFAULTS["colormap"],
    axes:     bool            = False,
) -> None:
    """
    Save a mel spectrogram as a PNG image suitable for CNN input.

    Args:
        S_db:     Log-mel spectrogram (n_mels × T)
        out_path: Destination .png file
        img_size: (height, width) in pixels
        dpi:      Dots per inch
        colormap: Matplotlib colormap name
        axes:     Whether to include axis labels/ticks (False = clean image)
    """
    out_path.parent.mkdir(parents=True, exist_ok=True)

    h, w   = img_size
    fig_h  = h / dpi
    fig_w  = w / dpi

    fig = plt.figure(figsize=(fig_w, fig_h), dpi=dpi)

    if axes:
        ax = fig.add_subplot(111)
        librosa.display.specshow(
            S_db,
            cmap=colormap,
            ax=ax,
            x_axis="time",
            y_axis="mel",
        )
        plt.colorbar(ax.collections[0], ax=ax, format="%+2.0f dB")
    else:
        ax = fig.add_axes([0, 0, 1, 1])
        ax.axis("off")
        S_norm = normalize_spectrogram(S_db)
        ax.imshow(
            S_norm,
            aspect="auto",
            origin="lower",
            cmap=colormap,
            interpolation="bilinear",
        )

    plt.savefig(str(out_path), dpi=dpi, bbox_inches="tight" if axes else None,
                pad_inches=0)
    plt.close(fig)

# ──────────────────────────────────────────────────────────────────────────────
# Per-track worker (used in parallel processing)
# ──────────────────────────────────────────────────────────────────────────────

def process_track(
    track_id:   int,
    genre:      str,
    split:      str,
    fma_dir:    Path,
    output_dir: Path,
    wav_dir:    Optional[Path],
    keep_wav:   bool,
    cfg:        dict,
) -> Dict:
    """
    Full pipeline for a single track:
        MP3 → WAV → Mel Spectrogram → PNG

    Returns a result dict with status info.
    """
    result = {"track_id": track_id, "genre": genre, "split": split,
              "status": "ok", "error": ""}

    try:
        # ── 1. Locate MP3 ─────────────────────────────────────────────────────
        mp3_path = get_mp3_path(fma_dir, track_id)

        # ── 2. MP3 → WAV ──────────────────────────────────────────────────────
        tid_str  = f"{track_id:06d}"
        genre_safe = genre.replace("/", "-").replace(" ", "_")

        if wav_dir is not None:
            wav_path = wav_dir / split / genre_safe / f"{tid_str}.wav"
        else:
            wav_path = Path("/tmp") / "fma_wav" / f"{tid_str}.wav"

        mp3_to_wav(
            mp3_path, wav_path,
            sample_rate = cfg["sample_rate"],
            duration    = cfg["duration"],
            offset      = cfg["offset"],
        )

        # ── 3. Load WAV ────────────────────────────────────────────────────────
        y, sr = load_wav(wav_path, sample_rate=cfg["sample_rate"])

        # ── 4. Mel Spectrogram ────────────────────────────────────────────────
        S_db = compute_mel_spectrogram(
            y, sr,
            n_fft      = cfg["n_fft"],
            hop_length = cfg["hop_length"],
            n_mels     = cfg["n_mels"],
            f_min      = cfg["f_min"],
            f_max      = cfg["f_max"],
            power      = cfg["power"],
            top_db     = cfg["top_db"],
        )

        # ── 5. Save image ─────────────────────────────────────────────────────
        img_path = output_dir / split / genre_safe / f"{tid_str}.png"
        save_spectrogram_image(
            S_db, img_path,
            img_size = tuple(cfg["img_size"]),
            dpi      = cfg["dpi"],
            colormap = cfg["colormap"],
        )
        result["img_path"] = str(img_path)

        # ── 6. Optionally remove WAV ─────────────────────────────────────────
        if not keep_wav and wav_path.exists():
            wav_path.unlink()
            # Remove empty parent dirs
            try:
                wav_path.parent.rmdir()
                wav_path.parent.parent.rmdir()
            except OSError:
                pass

    except FileNotFoundError as e:
        result["status"] = "missing"
        result["error"]  = str(e)
    except Exception:
        result["status"] = "error"
        result["error"]  = traceback.format_exc()

    return result

# ──────────────────────────────────────────────────────────────────────────────
# Dataset builder
# ──────────────────────────────────────────────────────────────────────────────

def build_dataset(
    fma_dir:    Path,
    output_dir: Path,
    wav_dir:    Optional[Path]   = None,
    keep_wav:   bool             = False,
    splits:     Optional[List[str]] = None,
    subset:     str              = "small",
    workers:    int              = 4,
    cfg:        Optional[dict]   = None,
    log_file:   Optional[str]    = None,
) -> pd.DataFrame:
    """
    Orchestrates the full preprocessing pipeline for the FMA dataset.

    Args:
        fma_dir:    Root directory of the FMA dataset
        output_dir: Where to save spectrogram PNG images
        wav_dir:    If set, save intermediate WAVs here; else use /tmp
        keep_wav:   Whether to keep WAV files after conversion
        splits:     e.g. ["training", "validation", "test"] – None = all
        subset:     "small" | "medium" | "large" | "full" | "all"
        workers:    Parallel worker processes
        cfg:        Hyperparameter overrides (merged with DEFAULTS)
        log_file:   Path to write detailed log

    Returns:
        DataFrame with per-track processing results
    """
    if log_file:
        setup_logger(log_file)

    cfg = {**DEFAULTS, **(cfg or {})}

    output_dir = Path(output_dir)
    fma_dir    = Path(fma_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load & filter metadata
    df = load_fma_metadata(fma_dir)
    df = filter_by_subset(df, subset)

    if splits:
        # FMA uses "training" / "validation" / "test"
        df = df[df["split"].isin(splits)]
        logger.info(f"Filtered to splits {splits}: {len(df)} tracks")

    genres = sorted(df["genre_top"].unique())
    logger.info(f"Genres ({len(genres)}): {genres}")

    # Build task list
    tasks = [
        (row.track_id, row.genre_top, row.split,
         fma_dir, output_dir, wav_dir, keep_wav, cfg)
        for row in df.itertuples(index=False)
    ]

    results = []
    ok = missing = error = 0

    logger.info(f"Processing {len(tasks)} tracks with {workers} workers …")

    if workers == 1:
        # Single-process for easier debugging
        for t in tqdm(tasks, desc="Tracks", unit="track"):
            r = process_track(*t)
            results.append(r)
            if r["status"] == "ok":        ok      += 1
            elif r["status"] == "missing": missing += 1
            else:                          error   += 1
    else:
        with ProcessPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(process_track, *t): t for t in tasks}
            with tqdm(total=len(tasks), desc="Tracks", unit="track") as pbar:
                for fut in as_completed(futures):
                    r = fut.result()
                    results.append(r)
                    if r["status"] == "ok":        ok      += 1
                    elif r["status"] == "missing": missing += 1
                    else:                          error   += 1
                    pbar.update(1)
                    pbar.set_postfix(ok=ok, miss=missing, err=error)

    results_df = pd.DataFrame(results)
    report_path = output_dir / "preprocessing_report.csv"
    results_df.to_csv(report_path, index=False)

    logger.info("─" * 60)
    logger.info(f"Done.  ✓ OK: {ok}  ✗ Missing: {missing}  ✗ Error: {error}")
    logger.info(f"Report saved → {report_path}")

    # Write class mapping
    class_map = {g: i for i, g in enumerate(sorted(df["genre_top"].unique()))}
    class_map_path = output_dir / "class_map.csv"
    pd.DataFrame(list(class_map.items()), columns=["genre", "label"]).to_csv(
        class_map_path, index=False
    )
    logger.info(f"Class map saved → {class_map_path}")

    return results_df

# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="FMA → Mel Spectrogram preprocessing pipeline",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--fma_dir",    required=True, help="Root FMA dataset directory")
    p.add_argument("--output_dir", required=True, help="Output directory for PNG images")
    p.add_argument("--wav_dir",    default=None,  help="Directory to save intermediate WAVs")
    p.add_argument("--keep_wav",   action="store_true", help="Keep WAV files after processing")
    p.add_argument("--subset",     default="small",
                   choices=["small", "medium", "large", "full", "all"],
                   help="FMA subset to process")
    p.add_argument("--split",      nargs="+",
                   default=["training", "validation", "test"],
                   help="Dataset splits to include")
    p.add_argument("--workers",    type=int,   default=4,
                   help="Parallel worker processes")
    p.add_argument("--log_file",   default=None, help="Path for detailed log file")

    # Audio params
    p.add_argument("--sample_rate", type=int,   default=DEFAULTS["sample_rate"])
    p.add_argument("--duration",    type=float, default=DEFAULTS["duration"])
    p.add_argument("--offset",      type=float, default=DEFAULTS["offset"])

    # Spectrogram params
    p.add_argument("--n_fft",       type=int,   default=DEFAULTS["n_fft"])
    p.add_argument("--hop_length",  type=int,   default=DEFAULTS["hop_length"])
    p.add_argument("--n_mels",      type=int,   default=DEFAULTS["n_mels"])
    p.add_argument("--f_min",       type=float, default=DEFAULTS["f_min"])
    p.add_argument("--f_max",       type=float, default=DEFAULTS["f_max"])
    p.add_argument("--top_db",      type=float, default=DEFAULTS["top_db"])
    p.add_argument("--colormap",    default=DEFAULTS["colormap"])
    p.add_argument("--img_height",  type=int,   default=DEFAULTS["img_size"][0])
    p.add_argument("--img_width",   type=int,   default=DEFAULTS["img_size"][1])

    return p.parse_args()


def main() -> None:
    args = parse_args()

    cfg = dict(
        sample_rate = args.sample_rate,
        duration    = args.duration,
        offset      = args.offset,
        n_fft       = args.n_fft,
        hop_length  = args.hop_length,
        n_mels      = args.n_mels,
        f_min       = args.f_min,
        f_max       = args.f_max,
        power       = DEFAULTS["power"],
        top_db      = args.top_db,
        img_size    = (args.img_height, args.img_width),
        dpi         = DEFAULTS["dpi"],
        colormap    = args.colormap,
    )

    build_dataset(
        fma_dir    = Path(args.fma_dir),
        output_dir = Path(args.output_dir),
        wav_dir    = Path(args.wav_dir) if args.wav_dir else None,
        keep_wav   = args.keep_wav,
        splits     = args.split,
        subset     = args.subset,
        workers    = args.workers,
        cfg        = cfg,
        log_file   = args.log_file,
    )


if __name__ == "__main__":
    main()