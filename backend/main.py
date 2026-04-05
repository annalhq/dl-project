from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List
import asyncio
import json

from model import predict_genre, get_model

app = FastAPI(title="Music Genre Classifier API")

# Allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Pre-load the model on startup so the first request is fast."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, get_model)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(files: List[UploadFile] = File(...)):
    """
    Accept multiple MP3 files and return genre predictions for each.
    """
    results = []

    for upload in files:
        if not upload.filename.lower().endswith('.mp3'):
            raise HTTPException(
                status_code=400,
                detail=f"File '{upload.filename}' is not an MP3. Only MP3 files are supported."
            )

        try:
            mp3_bytes = await upload.read()
            prediction = predict_genre(mp3_bytes)
            results.append({
                "filename": upload.filename,
                **prediction,
            })
        except Exception as e:
            results.append({
                "filename": upload.filename,
                "error": str(e),
                "genre": None,
                "confidence": None,
                "probabilities": None,
            })

    return {"results": results}


@app.post("/predict-stream")
async def predict_stream(files: List[UploadFile] = File(...)):
    """
    Accept multiple MP3 files and stream per-file, per-step progress via SSE.
    Each event is a JSON line: {"file", "step", "progress", "result"?, "error"?}
    """

    # Read all file bytes upfront (before streaming begins)
    file_data: list[tuple[str, bytes]] = []
    for upload in files:
        if not upload.filename.lower().endswith('.mp3'):
            file_data.append((upload.filename, b""))  # will be skipped with error
        else:
            raw = await upload.read()
            file_data.append((upload.filename, raw))

    async def event_generator():
        total = len(file_data)
        for idx, (filename, mp3_bytes) in enumerate(file_data):
            # Check for non-MP3
            if not filename.lower().endswith('.mp3'):
                event = {
                    "file": filename,
                    "index": idx,
                    "total": total,
                    "step": "error",
                    "progress": 100,
                    "error": f"File '{filename}' is not an MP3.",
                }
                yield f"data: {json.dumps(event)}\n\n"
                continue

            # Emit uploading step
            yield f"data: {json.dumps({'file': filename, 'index': idx, 'total': total, 'step': 'uploading', 'progress': 0})}\n\n"

            try:
                loop = asyncio.get_event_loop()

                # We use a list to collect progress steps from the sync callback
                progress_events: list[str] = []

                def on_progress(step_name: str):
                    progress_map = {
                        'converting_wav': 20,
                        'extracting_segment': 40,
                        'generating_spectrogram': 60,
                        'analyzing': 80,
                    }
                    progress_events.append(json.dumps({
                        'file': filename,
                        'index': idx,
                        'total': total,
                        'step': step_name,
                        'progress': progress_map.get(step_name, 50),
                    }))

                # Run prediction in executor (blocking)
                result = await loop.run_in_executor(
                    None, lambda: predict_genre(mp3_bytes, on_progress=on_progress)
                )

                # Yield all intermediate progress events
                for evt in progress_events:
                    yield f"data: {evt}\n\n"

                # Yield completion
                event = {
                    "file": filename,
                    "index": idx,
                    "total": total,
                    "step": "complete",
                    "progress": 100,
                    "result": {
                        "filename": filename,
                        **result,
                    },
                }
                yield f"data: {json.dumps(event)}\n\n"

            except Exception as e:
                # Yield any collected progress
                for evt in progress_events:
                    yield f"data: {evt}\n\n"

                event = {
                    "file": filename,
                    "index": idx,
                    "total": total,
                    "step": "error",
                    "progress": 100,
                    "error": str(e),
                    "result": {
                        "filename": filename,
                        "genre": None,
                        "confidence": None,
                        "probabilities": None,
                        "error": str(e),
                    },
                }
                yield f"data: {json.dumps(event)}\n\n"

        # Signal stream end
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
