import numpy as np
import os
import tempfile
import librosa
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg
from pydub import AudioSegment

from tensorflow.keras.layers import (
    Input, Dense, Activation, BatchNormalization,
    Flatten, Conv2D, MaxPooling2D
)
from tensorflow.keras.models import Model
from tensorflow.keras.initializers import glorot_uniform
from tensorflow.keras.utils import load_img, img_to_array

CLASS_LABELS = ['blues', 'classical', 'country', 'disco', 'hiphop', 'metal', 'pop', 'reggae', 'rock']

MODEL_WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), '..', 'training', 'Model.h5')

_model = None


def build_cnn(input_shape=(288, 432, 4), classes=9):
    def step(dim, X):
        X = Conv2D(dim, kernel_size=(3, 3), strides=(1, 1))(X)
        X = BatchNormalization(axis=3)(X)
        X = Activation('relu')(X)
        return MaxPooling2D((2, 2))(X)

    X_input = Input(input_shape)
    X = X_input
    for dim in [8, 16, 32, 64, 128, 256]:
        X = step(dim, X)

    X = Flatten()(X)
    X = Dense(classes, activation='softmax',
              name=f'fc{classes}', kernel_initializer=glorot_uniform(seed=9))(X)
    return Model(inputs=X_input, outputs=X, name='cnn')


def get_model():
    global _model
    if _model is None:
        weights_path = os.path.abspath(MODEL_WEIGHTS_PATH)
        print(f"[Model] Loading weights from: {weights_path}")
        _model = build_cnn(input_shape=(288, 432, 4), classes=9)
        _model.load_weights(weights_path)
        print("[Model] Loaded successfully.")
    return _model


def mp3_to_spectrogram(mp3_bytes: bytes, tmp_dir: str, on_progress=None) -> str:
    """Convert raw MP3 bytes → mel spectrogram PNG. Returns PNG path.
    
    on_progress: optional callback(step_name: str) called at each stage.
    """
    mp3_path = os.path.join(tmp_dir, 'input.mp3')
    wav_path = os.path.join(tmp_dir, 'music.wav')
    ext_path = os.path.join(tmp_dir, 'extracted.wav')
    spec_path = os.path.join(tmp_dir, 'spectrogram.png')

    with open(mp3_path, 'wb') as f:
        f.write(mp3_bytes)

    # MP3 → WAV
    if on_progress:
        on_progress('converting_wav')
    sound = AudioSegment.from_mp3(mp3_path)
    sound.export(wav_path, format='wav')

    # Extract segment: 40-50s if long enough, else first 10s, else full clip
    if on_progress:
        on_progress('extracting_segment')
    wav = AudioSegment.from_wav(wav_path)
    duration_ms = len(wav)
    if duration_ms >= 50000:
        segment = wav[40000:50000]
    elif duration_ms >= 10000:
        segment = wav[:10000]
    else:
        segment = wav

    segment.export(ext_path, format='wav')

    # Mel spectrogram (same as original app.py)
    if on_progress:
        on_progress('generating_spectrogram')
    y, sr = librosa.load(ext_path, duration=3)
    mels = librosa.feature.melspectrogram(y=y, sr=sr)
    fig = plt.Figure()
    FigureCanvasAgg(fig)
    plt.imshow(librosa.power_to_db(mels, ref=np.max))
    plt.savefig(spec_path)
    plt.close('all')

    return spec_path


def predict_genre(mp3_bytes: bytes, on_progress=None) -> dict:
    """Predict genre from raw MP3 bytes. Returns genre, confidence, probabilities.
    
    on_progress: optional callback(step_name: str) called at each stage.
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        spec_path = mp3_to_spectrogram(mp3_bytes, tmp_dir, on_progress=on_progress)
        
        if on_progress:
            on_progress('analyzing')
        image_data = load_img(spec_path, color_mode='rgba', target_size=(288, 432))
        image = img_to_array(image_data).reshape((1, 288, 432, 4))

        model = get_model()
        prediction = model.predict(image / 255, verbose=0).reshape((9,))

        class_idx = int(np.argmax(prediction))
        return {
            'genre': CLASS_LABELS[class_idx],
            'confidence': float(prediction[class_idx]),
            'probabilities': {CLASS_LABELS[i]: float(prediction[i]) for i in range(9)},
        }
