import argparse
from pathlib import Path

from config import DEFAULTS
from pipeline import build_dataset


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="FMA to Mel spectrogram preprocessing",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    parser.add_argument("--fma_dir", required=True, help="Root FMA dataset directory")
    parser.add_argument("--output_dir", required=True, help="Output directory for PNG images")
    parser.add_argument("--wav_dir", default=None, help="Directory for intermediate WAV files")
    parser.add_argument("--keep_wav", action="store_true", help="Keep WAV files after processing")
    parser.add_argument(
        "--subset",
        default="small",
        choices=["small", "medium", "large", "full", "all"],
        help="FMA subset to process",
    )
    parser.add_argument(
        "--split",
        nargs="+",
        default=["training", "validation", "test"],
        help="Dataset splits to include",
    )
    parser.add_argument("--workers", type=int, default=4, help="Parallel worker processes")
    parser.add_argument("--log_file", default=None, help="Optional file log path")

    parser.add_argument("--sample_rate", type=int, default=DEFAULTS["sample_rate"])
    parser.add_argument("--duration", type=float, default=DEFAULTS["duration"])
    parser.add_argument("--offset", type=float, default=DEFAULTS["offset"])

    parser.add_argument("--n_fft", type=int, default=DEFAULTS["n_fft"])
    parser.add_argument("--hop_length", type=int, default=DEFAULTS["hop_length"])
    parser.add_argument("--n_mels", type=int, default=DEFAULTS["n_mels"])
    parser.add_argument("--f_min", type=float, default=DEFAULTS["f_min"])
    parser.add_argument("--f_max", type=float, default=DEFAULTS["f_max"])
    parser.add_argument("--top_db", type=float, default=DEFAULTS["top_db"])
    parser.add_argument("--colormap", default=DEFAULTS["colormap"])
    parser.add_argument("--img_height", type=int, default=DEFAULTS["img_size"][0])
    parser.add_argument("--img_width", type=int, default=DEFAULTS["img_size"][1])

    return parser.parse_args()


def build_runtime_config(args: argparse.Namespace) -> dict:
    return {
        "sample_rate": args.sample_rate,
        "duration": args.duration,
        "offset": args.offset,
        "n_fft": args.n_fft,
        "hop_length": args.hop_length,
        "n_mels": args.n_mels,
        "f_min": args.f_min,
        "f_max": args.f_max,
        "power": DEFAULTS["power"],
        "top_db": args.top_db,
        "img_size": (args.img_height, args.img_width),
        "dpi": DEFAULTS["dpi"],
        "colormap": args.colormap,
    }


def main() -> None:
    args = parse_args()
    cfg = build_runtime_config(args)

    build_dataset(
        fma_dir=Path(args.fma_dir),
        output_dir=Path(args.output_dir),
        wav_dir=Path(args.wav_dir) if args.wav_dir else None,
        keep_wav=args.keep_wav,
        splits=args.split,
        subset=args.subset,
        workers=args.workers,
        cfg=cfg,
        log_file=args.log_file,
    )


if __name__ == "__main__":
    main()
