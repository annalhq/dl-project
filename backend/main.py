from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import asyncio

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

    Returns:
    {
      "results": [
        {
          "filename": "song.mp3",
          "genre": "rock",
          "confidence": 0.87,
          "probabilities": { "rock": 0.87, "pop": 0.05, ... }
        },
        ...
      ]
    }
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
            # Don't fail the whole batch — report the error per file
            results.append({
                "filename": upload.filename,
                "error": str(e),
                "genre": None,
                "confidence": None,
                "probabilities": None,
            })

    return {"results": results}
