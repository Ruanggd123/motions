#!/usr/bin/env python3
"""
DUPLO SENTIDO 3D — EPISÓDIO 01: "O QUE EU FAÇO COM MEU PINTO GIGANTE"
Gerador Master de Áudio (VoiceStudio Neural ep06_voce_alloy + Blindagem Anti-Corte +
Trilha Cômica Diurna 118 BPM + Foley Pintinho/Scratch/Boing/Paçoca + ep01_timeline.js)
"""

import json
import math
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
NYQ = SR * 0.5


def resolve_ffmpeg():
    candidates = [
        shutil.which("ffmpeg"),
        str(Path(__file__).resolve().parent.parent.parent / "node_modules" / "ffmpeg-static" / "ffmpeg.exe"),
        r"C:\Users\Ruan Gomes\Desktop\New folder\node_modules\ffmpeg-static\ffmpeg.exe",
    ]
    for c in candidates:
        if c and Path(c).exists():
            return str(c)
    return "ffmpeg"


FFMPEG_BIN = resolve_ffmpeg()
BASE_DIR = Path(__file__).resolve().parent
AUDIO_DIR = BASE_DIR / "audio"
GEN_DIR = AUDIO_DIR / "generated_ep01"
SFX_BLOCO_C = BASE_DIR.parent / "condominio-bloco-c" / "audio" / "sfx"
OUT_WAV = AUDIO_DIR / "ep01_mix.wav"
OUT_TIMELINE_JS = AUDIO_DIR / "ep01_timeline.js"

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
GEN_DIR.mkdir(parents=True, exist_ok=True)


DIALOGUES_DEF = [
    {
        "id": "duplo01_b1",
        "file": GEN_DIR / "01_isca.wav",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "text": "Você já viu o que eu faço de manhã com meu pinto gigante?!",
        "speech_text": "Você já viu o que eu faço de manhã com meu pinto gigante?!...",
    },
    {
        "id": "duplo01_b2",
        "file": GEN_DIR / "02_revelacao.wav",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "text": "Olha só esse pintinho amarelo gigante que nasceu aqui no quintal!",
        "speech_text": "Olha só esse pintinho amarelo gigante que nasceu aqui no quintal!...",
    },
    {
        "id": "duplo01_b3",
        "file": GEN_DIR / "03_duas_maos.wav",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "text": "Pra dar banho nele, tem que segurar firme com as duas mãos pra não escapar!",
        "speech_text": "Pra dar banho nele, tem que segurar firme com as duas mãos pra não escapar!...",
    },
    {
        "id": "duplo01_b4",
        "file": GEN_DIR / "04_bicando.wav",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "text": "E às seis da manhã ele já acorda em pé bicando tudo pela frente!",
        "speech_text": "E às seis da manhã ele já acorda em pé bicando tudo pela frente!...",
    },
    {
        "id": "duplo01_b5",
        "file": GEN_DIR / "05_vizinha.wav",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "text": "Até a vizinha gritou na cerca assustada, e o Paçoca começou a latir!",
        "speech_text": "Até a vizinha gritou na cerca assustada, e o Paçoca começou a latir!...",
    },
    {
        "id": "duplo01_b6",
        "file": GEN_DIR / "06_cta.wav",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "text": "E aí, você teria coragem de fazer carinho no meu pinto gigante? Comenta!",
        "speech_text": "E aí, você teria coragem de fazer carinho no meu pinto gigante? Comenta!...",
    },
]


def run_ff(args, label):
    res = subprocess.run([FFMPEG_BIN, *args], capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg falhou em {label}: {res.stderr[-300:]}")


def apply_fade(arr, fade_in_s=0.012, fade_out_s=0.018):
    out = arr.copy()
    n_in = min(len(out), int(fade_in_s * SR))
    n_out = min(len(out), int(fade_out_s * SR))
    if n_in > 0:
        out[:n_in] *= np.linspace(0.0, 1.0, n_in)
    if n_out > 0:
        out[-n_out:] *= np.linspace(1.0, 0.0, n_out)
    return out


def inspect_wav_tail(wav_path):
    tmp = wav_path.with_name(f"_chk_{wav_path.stem}.wav")
    run_ff(["-y", "-i", str(wav_path), "-ar", str(SR), "-ac", "1", str(tmp)], wav_path.name)
    _, data = wavfile.read(str(tmp))
    tmp.unlink(missing_ok=True)
    if data.ndim > 1:
        data = data[:, 0]
    arr = data.astype(np.float64) / 32768.0
    if len(arr) < int(0.8 * SR):
        return False, 1.0
    pk = float(np.max(np.abs(arr))) + 1e-6
    last_50 = float(np.sqrt(np.mean(arr[-int(0.05 * SR) :] ** 2))) / pk
    return last_50 < 0.04, last_50


def synthesize_voices():
    force = "--force" in sys.argv
    with urllib.request.urlopen("http://127.0.0.1:3900/health", timeout=4) as res:
        if res.status != 200:
            raise RuntimeError("VoiceStudio offline")

    for idx, dlg in enumerate(DIALOGUES_DEF):
        out_file = dlg["file"]
        if not force and out_file.exists() and out_file.stat().st_size > 15000:
            print(f"  ✓ Cache [{dlg['id']}]: {out_file.name}")
            continue

        best_bytes = None
        best_tail = 999.0
        for attempt in range(4):
            txt = dlg["speech_text"] if attempt == 0 else (dlg["text"].rstrip(".!?") + "... ")
            print(f"  🎙️ VoiceStudio [{dlg['id']}] tentativa {attempt + 1}...")
            payload = json.dumps({
                "model": "tts-1",
                "input": txt,
                "voice": dlg["vs_voice"],
                "language": "pt",
                "response_format": "wav",
                "speed": 1.05,
                "preprocess_prompt": True,
                "denoise": True,
                "num_step": 24,
                "guidance_scale": 2.0,
                "seed": 720 + idx * 31 + attempt * 113,
            }).encode("utf-8")
            req = urllib.request.Request(
                "http://127.0.0.1:3900/v1/audio/speech",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=360) as res:
                audio_bytes = res.read()
            if len(audio_bytes) < 15000:
                continue
            with open(out_file, "wb") as f:
                f.write(audio_bytes)
            ok, tail = inspect_wav_tail(out_file)
            print(f"    ↳ {out_file.name}: {len(audio_bytes)} bytes (tail_ratio={tail:.4f})")
            if tail < best_tail:
                best_tail = tail
                best_bytes = audio_bytes
            if ok:
                break
        if best_bytes is None:
            raise RuntimeError(f"VoiceStudio falhou para {out_file.name}")
        with open(out_file, "wb") as f:
            f.write(best_bytes)


def load_voice(wav_path):
    tmp = GEN_DIR / f"_tmp_{wav_path.stem}.wav"
    run_ff(["-y", "-i", str(wav_path), "-ar", str(SR), "-ac", "1", str(tmp)], wav_path.name)
    _, data = wavfile.read(str(tmp))
    tmp.unlink(missing_ok=True)
    if data.ndim > 1:
        data = data[:, 0]
    arr = data.astype(np.float64) / 32768.0

    # Anti-corte +420ms de cauda natural (não corta última sílaba!)
    env = np.abs(arr)
    win = int(0.025 * SR)
    sm = np.convolve(env, np.ones(win) / win, mode="same")
    nz = np.where(sm > 0.0008)[0]
    if len(nz) > 0:
        s0 = max(0, int(nz[0]) - int(0.050 * SR))
        s1 = min(len(arr), int(nz[-1]) + int(0.420 * SR))
        arr = arr[s0:s1]

    arr = apply_fade(arr, 0.012, 0.060)
    arr = np.pad(arr, (int(0.03 * SR), int(0.22 * SR)), mode="constant")

    b, a = signal.butter(2, [80.0 / NYQ, 8600.0 / NYQ], btype="band")
    arr = signal.filtfilt(b, a, arr)
    pk = np.max(np.abs(arr))
    if pk > 0:
        arr = (arr / pk) * 0.90

    spf = int(SR / 60)
    lip = []
    for i in range(0, len(arr), spf):
        ch = arr[i : i + spf]
        if len(ch) == 0:
            break
        rms = math.sqrt(np.mean(ch * ch))
        lip.append(round(min(1.0, max(0.0, (rms - 0.012) / 0.19)), 3))
    return arr, len(arr) / SR, lip


def mix_at(master, clip, t_sec, gain=1.0):
    s = int(round(t_sec * SR))
    if s >= len(master):
        return
    e = min(len(master), s + len(clip))
    if e > s:
        master[s:e] += clip[: e - s] * gain


def synth_comedy_bgm(total_len):
    """Loop instrumental cômico estilo pizzicato/marimba 118 BPM diurno."""
    t = np.arange(total_len) / SR
    beat_dur = 60.0 / 118.0
    bgm = np.zeros(total_len, dtype=np.float64)

    # Progressão divertida C - G - Am - F (marimba pizzicato + baixo saltitante)
    chords = [
        (261.63, 329.63, 392.00, 130.81),  # C
        (392.00, 493.88, 587.33, 196.00),  # G
        (220.00, 261.63, 329.63, 110.00),  # Am
        (349.23, 440.00, 523.25, 174.61),  # F
    ]
    step = 0
    cur = 0.0
    while cur < t[-1]:
        c = chords[(step // 4) % len(chords)]
        note_f = c[step % 3]
        bass_f = c[3]
        dur = beat_dur * 0.5
        s = int(cur * SR)
        n = min(int(dur * SR), total_len - s)
        if n > 0:
            lt = np.arange(n) / SR
            pluck = np.sin(2 * np.pi * note_f * lt) * np.exp(-lt * 11.0) * 0.25
            if step % 2 == 0:
                pluck += np.sin(2 * np.pi * bass_f * lt) * np.exp(-lt * 7.5) * 0.30
            bgm[s : s + n] += pluck
        cur += dur
        step += 1
    return bgm * 0.26


def sfx_hook_boom():
    dur = 0.35
    lt = np.arange(int(dur * SR)) / SR
    f = 135 * np.exp(-lt * 5.0) + 42
    phase = 2 * np.pi * np.cumsum(f) / SR
    return apply_fade(np.sin(phase) * np.exp(-lt * 7.5) * 0.65, 0.004, 0.08)


def sfx_record_scratch():
    dur = 0.28
    lt = np.arange(int(dur * SR)) / SR
    f = np.where(lt < 0.14, 720 - lt * 3500, 240 + (lt - 0.14) * 4200)
    phase = 2 * np.pi * np.cumsum(f) / SR
    wave = np.tanh(np.sin(phase) * 2.2) * np.exp(-lt * 4.5)
    return apply_fade(wave * 0.35, 0.005, 0.04)


def sfx_chick_piu(count=2):
    parts = []
    for _ in range(count):
        dur = 0.17
        lt = np.arange(int(dur * SR)) / SR
        f = 1850 + 850 * np.sin(np.pi * lt / dur)
        phase = 2 * np.pi * np.cumsum(f) / SR
        piu = (np.sin(phase) + 0.25 * np.sin(2 * phase)) * np.sin(np.pi * lt / dur)
        parts.append(apply_fade(piu * 0.45, 0.005, 0.02))
        parts.append(np.zeros(int(0.05 * SR)))
    return np.concatenate(parts)


def sfx_boing():
    dur = 0.42
    lt = np.arange(int(dur * SR)) / SR
    f = 210 + 340 * (1 - np.exp(-lt * 7.0)) + 28 * np.sin(2 * np.pi * 22 * lt)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return apply_fade(np.sin(phase) * np.exp(-lt * 4.5) * 0.5, 0.005, 0.06)


def sfx_peck():
    dur = 0.08
    lt = np.arange(int(dur * SR)) / SR
    f = 420 * np.exp(-lt * 35.0) + 120
    phase = 2 * np.pi * np.cumsum(f) / SR
    return apply_fade(np.sin(phase) * np.exp(-lt * 28.0) * 0.5, 0.002, 0.02)


def sfx_pop_ding():
    dur = 0.22
    lt = np.arange(int(dur * SR)) / SR
    wave = (np.sin(2 * np.pi * 987.77 * lt) + 0.5 * np.sin(2 * np.pi * 1318.51 * lt)) * np.exp(-lt * 10.0)
    return apply_fade(wave * 0.38, 0.003, 0.04)


def load_real_bark(max_sec=1.6):
    src = SFX_BLOCO_C / "real_Barking_of_a_dog.wav"
    if not src.exists():
        return np.zeros(int(0.2 * SR))
    tmp = GEN_DIR / "_tmp_bark.wav"
    run_ff(["-y", "-i", str(src), "-ar", str(SR), "-ac", "1", str(tmp)], "bark")
    _, data = wavfile.read(str(tmp))
    tmp.unlink(missing_ok=True)
    if data.ndim > 1:
        data = data[:, 0]
    arr = data.astype(np.float64) / 32768.0
    arr = arr[: int(max_sec * SR)]
    pk = np.max(np.abs(arr))
    if pk > 0:
        arr = (arr / pk) * 0.72
    return apply_fade(arr, 0.01, 0.08)


def main():
    print("🎙️ [1/4] Sintetizando falas cômicas com VoiceStudio (ep06_voce_alloy + anti-corte)...")
    synthesize_voices()

    print("🎛️ [2/4] Calculando timeline dinâmica por batida...")
    voices = []
    for dlg in DIALOGUES_DEF:
        arr, dur, lip = load_voice(dlg["file"])
        voices.append({"def": dlg, "audio": arr, "duration": dur, "lip": lip})

    # Espaçamento natural com respiração entre cortes
    b1_start = 0.0
    d1_start = 0.12
    d1_end = d1_start + voices[0]["duration"]

    b2_start = round(d1_end + 0.35, 3)  # Pausa cômica + scratch + piu!
    d2_start = round(b2_start + 0.55, 3)
    d2_end = d2_start + voices[1]["duration"]

    b3_start = round(d2_end + 0.22, 3)
    d3_start = round(b3_start + 0.15, 3)
    d3_end = d3_start + voices[2]["duration"]

    b4_start = round(d3_end + 0.30, 3)
    d4_start = round(b4_start + 0.18, 3)
    d4_end = d4_start + voices[3]["duration"]

    b5_start = round(d4_end + 0.25, 3)
    d5_start = round(b5_start + 0.22, 3)
    d5_end = d5_start + voices[4]["duration"]

    b6_start = round(d5_end + 0.35, 3)
    d6_start = round(b6_start + 0.25, 3)
    d6_end = d6_start + voices[5]["duration"]

    total_dur = round(d6_end + 2.15, 2)  # +2.15s após última sílaba para BGM decair sem tocar na voz
    beat_starts = [b1_start, b2_start, b3_start, b4_start, b5_start, b6_start]
    dlg_starts = [d1_start, d2_start, d3_start, d4_start, d5_start, d6_start]

    print(f"  ⏱️ Batidas: {beat_starts} | TOTAL={total_dur:.2f}s")

    total_samples = int(math.ceil(total_dur * SR))
    voice_bus = np.zeros(total_samples, dtype=np.float64)
    sfx_bus = np.zeros(total_samples, dtype=np.float64)

    for v, t0 in zip(voices, dlg_starts):
        mix_at(voice_bus, v["audio"], t0, 1.0)

    print("🎵 [3/4] Gerando trilha diurna 118 BPM com ducking + foley cômico...")
    bgm_bus = synth_comedy_bgm(total_samples)

    # Foley sincronizado em cada batida
    mix_at(sfx_bus, sfx_hook_boom(), 0.04, 0.72)
    mix_at(sfx_bus, sfx_record_scratch(), b2_start - 0.10, 0.85)
    mix_at(sfx_bus, sfx_chick_piu(2), b2_start + 0.12, 0.90)
    mix_at(sfx_bus, sfx_boing(), b3_start + 2.2, 0.82)
    mix_at(sfx_bus, sfx_peck(), b4_start + 0.45, 0.75)
    mix_at(sfx_bus, sfx_peck(), b4_start + 0.78, 0.75)
    mix_at(sfx_bus, sfx_chick_piu(1), b4_start + 1.05, 0.75)
    mix_at(sfx_bus, load_real_bark(1.4), b5_start + 2.1, 0.55)
    mix_at(sfx_bus, sfx_chick_piu(2), b6_start + 0.02, 0.95)
    mix_at(sfx_bus, sfx_pop_ding(), d6_end - 0.15, 0.85)

    # Ducking automático na trilha quando há voz; fade-out musical APENAS na trilha (nunca diminui a voz!)
    v_abs = np.abs(voice_bus)
    win = int(0.08 * SR)
    v_env = np.convolve(v_abs, np.ones(win) / win, mode="same")
    duck = np.clip(1.0 - v_env * 4.5, 0.28, 1.0)

    bgm_tail = apply_fade(bgm_bus * duck, 0.03, 1.95)
    sfx_tail = apply_fade(sfx_bus * 0.78, 0.01, 0.50)
    master = voice_bus * 1.0 + sfx_tail + bgm_tail
    master = apply_fade(master, 0.008, 0.03)
    pk = np.max(np.abs(master))
    if pk > 0:
        master = (master / pk) * 0.79  # ~ -2.0 dBFS headroom seguro

    pcm = np.clip(master * 32767.0, -32768, 32767).astype(np.int16)
    wavfile.write(str(OUT_WAV), SR, pcm)

    timeline = {
        "episode": 1,
        "slug": "ep01-pinto-gigante",
        "duration": total_dur,
        "beat_starts": beat_starts,
        "audio_src": "./audio/ep01_mix.wav?v=1.1",
        "dialogues": [],
    }
    for v, t0 in zip(voices, dlg_starts):
        timeline["dialogues"].append({
            "id": v["def"]["id"],
            "speaker": v["def"]["speaker"],
            "text": v["def"]["text"],
            "start": round(t0, 3),
            "duration": round(v["duration"], 3),
            "end": round(t0 + v["duration"], 3),
            "lip_sync": v["lip"],
        })

    OUT_TIMELINE_JS.write_text(
        "/** EP01_TIMELINE — Gerado automaticamente por gerar_audio_duplo_ep01.py */\n"
        f"window.EP01_DUPLO_TIMELINE = {json.dumps(timeline, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"💾 [4/4] Mix gravado em {OUT_WAV} ({total_dur:.2f}s) + {OUT_TIMELINE_JS.name}")


if __name__ == "__main__":
    main()
