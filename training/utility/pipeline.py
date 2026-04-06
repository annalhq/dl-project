from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import traceback
import tempfile

import pandas as pd
from tqdm import tqdm

from audio import load_wav, mp3_to_wav
from config import DEFAULTS
from log_utils import setup_logger
from metadata import filter_by_subset, get_mp3_path, load_fma_metadata
from spectrogram import compute_mel_spectrogram, save_spectrogram_image


def process_track(
    track_id: int,
    genre: str,
    split: str,
    fma_dir: Path,
    output_dir: Path,
    wav_dir: Optional[Path],
    keep_wav: bool,
    cfg: dict,
) -> Dict[str, str]:
    result = {
        "track_id": track_id,
        "genre": genre,
        "split": split,
        "status": "ok",
        "error": "",
    }

    try:
        tid_str = f"{track_id:06d}"
        safe_genre = _safe_genre_name(genre)

        mp3_path = get_mp3_path(fma_dir, track_id)
        wav_path = _build_wav_path(wav_dir, split, safe_genre, tid_str)

        mp3_to_wav(
            mp3_path=mp3_path,
            wav_path=wav_path,
            sample_rate=cfg["sample_rate"],
            duration=cfg["duration"],
            offset=cfg["offset"],
        )

        signal, sample_rate = load_wav(wav_path, sample_rate=cfg["sample_rate"])

        spectrogram_db = compute_mel_spectrogram(
            signal=signal,
            sample_rate=sample_rate,
            n_fft=cfg["n_fft"],
            hop_length=cfg["hop_length"],
            n_mels=cfg["n_mels"],
            f_min=cfg["f_min"],
            f_max=cfg["f_max"],
            power=cfg["power"],
            top_db=cfg["top_db"],
        )

        image_path = output_dir / split / safe_genre / f"{tid_str}.png"
        save_spectrogram_image(
            spectrogram_db=spectrogram_db,
            out_path=image_path,
            img_size=tuple(cfg["img_size"]),
            dpi=cfg["dpi"],
            colormap=cfg["colormap"],
        )
        result["img_path"] = str(image_path)

        _cleanup_wav(wav_path, keep_wav)
    except FileNotFoundError as exc:
        result["status"] = "missing"
        result["error"] = str(exc)
    except Exception:
        result["status"] = "error"
        result["error"] = traceback.format_exc()

    return result


def build_dataset(
    fma_dir: Path,
    output_dir: Path,
    wav_dir: Optional[Path] = None,
    keep_wav: bool = False,
    splits: Optional[List[str]] = None,
    subset: str = "small",
    workers: int = 4,
    cfg: Optional[dict] = None,
    log_file: Optional[str] = None,
) -> pd.DataFrame:
    logger = setup_logger(log_file)
    config = {**DEFAULTS, **(cfg or {})}

    fma_dir = Path(fma_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    metadata = load_fma_metadata(fma_dir, logger)
    metadata = filter_by_subset(metadata, subset, logger)
    metadata = _filter_splits(metadata, splits, logger)

    genres = sorted(metadata["genre_top"].unique())
    logger.info(f"Genres ({len(genres)}): {genres}")

    tasks = _build_tasks(metadata, fma_dir, output_dir, wav_dir, keep_wav, config)
    logger.info(f"Processing {len(tasks)} tracks with {workers} workers ...")

    results, ok_count, missing_count, error_count = _run_tasks(tasks, workers)

    report_path = output_dir / "preprocessing_report.csv"
    pd.DataFrame(results).to_csv(report_path, index=False)

    logger.info("-" * 60)
    logger.info(f"Done. OK: {ok_count} Missing: {missing_count} Error: {error_count}")
    logger.info(f"Report saved -> {report_path}")

    class_map_path = output_dir / "class_map.csv"
    class_map = {genre: idx for idx, genre in enumerate(genres)}
    pd.DataFrame(list(class_map.items()), columns=["genre", "label"]).to_csv(class_map_path, index=False)
    logger.info(f"Class map saved -> {class_map_path}")

    return pd.DataFrame(results)


def _run_tasks(tasks: List[Tuple], workers: int):
    results = []
    ok_count = 0
    missing_count = 0
    error_count = 0

    if workers == 1:
        for task in tqdm(tasks, desc="Tracks", unit="track"):
            result = process_track(*task)
            results.append(result)
            ok_count, missing_count, error_count = _update_counters(result, ok_count, missing_count, error_count)
        return results, ok_count, missing_count, error_count

    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(process_track, *task): task for task in tasks}
        with tqdm(total=len(tasks), desc="Tracks", unit="track") as progress:
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                ok_count, missing_count, error_count = _update_counters(result, ok_count, missing_count, error_count)
                progress.update(1)
                progress.set_postfix(ok=ok_count, miss=missing_count, err=error_count)

    return results, ok_count, missing_count, error_count


def _update_counters(result: Dict[str, str], ok_count: int, missing_count: int, error_count: int):
    status = result["status"]
    if status == "ok":
        ok_count += 1
    elif status == "missing":
        missing_count += 1
    else:
        error_count += 1
    return ok_count, missing_count, error_count


def _safe_genre_name(genre: str) -> str:
    return genre.replace("/", "-").replace(" ", "_")


def _build_wav_path(wav_dir: Optional[Path], split: str, safe_genre: str, track_id: str) -> Path:
    if wav_dir is not None:
        return wav_dir / split / safe_genre / f"{track_id}.wav"
    return Path(tempfile.gettempdir()) / "fma_wav" / f"{track_id}.wav"


def _cleanup_wav(wav_path: Path, keep_wav: bool) -> None:
    if keep_wav or not wav_path.exists():
        return

    wav_path.unlink()
    try:
        wav_path.parent.rmdir()
        wav_path.parent.parent.rmdir()
    except OSError:
        pass


def _filter_splits(df: pd.DataFrame, splits: Optional[List[str]], logger) -> pd.DataFrame:
    if not splits:
        return df

    filtered = df[df["split"].isin(splits)]
    logger.info(f"Filtered to splits {splits}: {len(filtered)} tracks")
    return filtered


def _build_tasks(
    metadata: pd.DataFrame,
    fma_dir: Path,
    output_dir: Path,
    wav_dir: Optional[Path],
    keep_wav: bool,
    cfg: dict,
) -> List[Tuple]:
    return [
        (
            row.track_id,
            row.genre_top,
            row.split,
            fma_dir,
            output_dir,
            wav_dir,
            keep_wav,
            cfg,
        )
        for row in metadata.itertuples(index=False)
    ]
