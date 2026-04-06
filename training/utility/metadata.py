from pathlib import Path

import pandas as pd


def load_fma_metadata(fma_dir: Path, logger) -> pd.DataFrame:
    tracks_path = _resolve_tracks_path(fma_dir)
    logger.info(f"Loading metadata from {tracks_path}")

    tracks = pd.read_csv(tracks_path, index_col=0, header=[0, 1])
    df = pd.DataFrame(
        {
            "track_id": tracks.index,
            "genre_top": tracks["track"]["genre_top"].values,
            "split": tracks["set"]["split"].values,
            "subset": tracks["set"]["subset"].values,
        }
    )

    df = df.dropna(subset=["genre_top", "split"])
    df["track_id"] = df["track_id"].astype(int)
    df["genre_top"] = df["genre_top"].str.strip()

    logger.info(f"Metadata loaded: {len(df)} tracks, {df['genre_top'].nunique()} genres")
    return df


def filter_by_subset(df: pd.DataFrame, subset: str, logger) -> pd.DataFrame:
    if subset == "all":
        return df

    result = df[df["subset"] == subset]
    logger.info(f"Filtered to subset='{subset}': {len(result)} tracks")
    return result


def get_mp3_path(fma_dir: Path, track_id: int) -> Path:
    tid_str = f"{track_id:06d}"
    folder = tid_str[:3]

    for audio_root in [fma_dir, fma_dir / "fma_small", fma_dir / "fma_medium", fma_dir / "fma_large"]:
        candidate = audio_root / folder / f"{tid_str}.mp3"
        if candidate.exists():
            return candidate

    raise FileNotFoundError(f"MP3 not found for track_id={track_id}")


def _resolve_tracks_path(fma_dir: Path) -> Path:
    candidates = [
        fma_dir / "fma_metadata" / "tracks.csv",
        fma_dir / "tracks.csv",
    ]

    for path in candidates:
        if path.exists():
            return path

    raise FileNotFoundError(
        "tracks.csv not found. Expected at fma_dir/fma_metadata/tracks.csv or fma_dir/tracks.csv. "
        "Download FMA metadata from https://github.com/mdeff/fma"
    )