"""Gerador de Áudio Master — Duplo Sentido 3D (EP 02: Cacetinho Quentinho)."""
import json
import math
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent
AUDIO_DIR = ROOT / "audio"
GEN_DIR = AUDIO_DIR / "generated_ep02"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
GEN_DIR.mkdir(parents=True, exist_ok=True)

SR = 44100
NYQ = SR * 0.5

FFMPEG_EXE = next(
    (p for p in [
        r"C:\ProgramData\chocolatey\bin\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
        "ffmpeg",
    ] if p == "ffmpeg" or os.path.exists(p)),
    "ffmpeg",
)

DIALOGUES_DEF = [
    {
        "id": "duplo02_b1",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "01_isca.wav",
        "text": "Você já pegou num cacetinho quentinho e bem duro logo cedo?!",
        "speech_text": "Você já pegou num cacetinho quentinho, e bem duro, logo cedo?",
        "pre_gap": 0.04,
        "post_gap": 0.14,
    },
    {
        "id": "duplo02_b2",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "02_revelacao.wav",
        "text": "Olha só esse pão francês gigante que acabou de sair do forno aqui em casa!",
        "speech_text": "Olha só esse pão francês gigante, que acabou de sair do forno aqui em casa!",
        "pre_gap": 0.12,
        "post_gap": 0.12,
    },
    {
        "id": "duplo02_b3",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "03_crocante.wav",
        "text": "Quando você aperta com as duas mãos, ele faz até barulho de crocante na hora!",
        "speech_text": "Quando você aperta com as duas mãos, ele faz até barulho de crocante na hora!",
        "pre_gap": 0.10,
        "post_gap": 0.12,
    },
    {
        "id": "duplo02_b4",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "04_manteiga.wav",
        "text": "E pra ficar bom mesmo, tem que passar manteiga derretida até escorrer!",
        "speech_text": "E pra ficar bom mesmo, tem que passar manteiga derretida até escorrer!",
        "pre_gap": 0.10,
        "post_gap": 0.12,
    },
    {
        "id": "duplo02_b5",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "05_vizinha.wav",
        "text": "Até a vizinha parou na janela pra olhar e o Paçoca já quer abocanhar um pedaço!",
        "speech_text": "Até a vizinha parou na janela pra olhar, e o Paçoca já quer abocanhar um pedaço!",
        "pre_gap": 0.10,
        "post_gap": 0.14,
    },
    {
        "id": "duplo02_b6",
        "speaker": "voce",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "06_cta.wav",
        "text": "E aí, você prefere o cacetinho quentinho ou bem torradinho? Comenta aqui!",
        "speech_text": "E aí, você prefere o cacetinho quentinho, ou bem torradinho? Comenta aqui!",
        "pre_gap": 0.10,
        "post_gap": 2.00,
    },
]


def run_ff(args, label):
    res = subprocess.run([FFMPEG_EXE] + args, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg [{label}]: {res.stderr[-400:]}")


def apply_fade(arr, fade_in=0.015, fade_out=0.025):
    out = arr.copy()
    ni = min(len(out), int(fade_in * SR))
    no = min(len(out), int(fade_out * SR))
    if ni > 0:
        out[:ni] *= np.linspace(0.0, 1.0, ni)
    if no > 0:
        out[-no:] *= np.linspace(1.0, 0.0, no)
    return out


def inspect_wav_tail(wav_path):
    _, data = wavfile.read(str(wav_path))
    if data.ndim > 1:
        data = data[:, 0]
    arr = data.astype(np.float64)
    if len(arr) < int(0.15 * SR):
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
                "seed": 820 + idx * 31 + attempt * 113,
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
    sr_in, data = wavfile.read(str(wav_path))
    if data.ndim > 1:
        data = data[:, 0]
    arr = data.astype(np.float64)
    if np.issubdtype(data.dtype, np.integer):
        arr = arr / float(np.iinfo(data.dtype).max)
    if sr_in != SR:
        g = math.gcd(int(sr_in), int(SR))
        arr = signal.resample_poly(arr, int(SR) // g, int(sr_in) // g)

    # Corte justo de silêncio morto entre frases (zero vácuo, preservando 180ms naturais no fim da palavra)
    env = np.abs(arr)
    win = int(0.025 * SR)
    sm = np.convolve(env, np.ones(win) / win, mode="same")
    nz = np.where(sm > 0.0014)[0]
    if len(nz) > 0:
        s0 = max(0, int(nz[0]) - int(0.030 * SR))
        s1 = min(len(arr), int(nz[-1]) + int(0.180 * SR))
        arr = arr[s0:s1]

    arr = apply_fade(arr, 0.010, 0.045)
    arr = np.pad(arr, (int(0.02 * SR), int(0.05 * SR)), mode="constant")

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
    master[s:e] += clip[: e - s] * gain


def synth_comedy_bgm(total_sec):
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 122.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)

    bass_notes = [146.83, 185.00, 220.00, 196.00]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass_notes[step % len(bass_notes)]
        dur = beat * 0.45
        lt = np.arange(int(dur * SR)) / SR
        tone = np.sin(2 * np.pi * freq * lt) * 0.55 + np.sin(4 * np.pi * freq * lt) * 0.16
        tone *= np.exp(-lt * 6.5) * 0.13
        mix_at(bgm, apply_fade(tone, 0.005, 0.02), cur, 1.0)

        if step % 2 == 1:
            pt = np.arange(int(0.10 * SR)) / SR
            pl = (np.sin(2 * np.pi * freq * 2.0 * pt) * 0.6 + np.sin(2 * np.pi * freq * 3.0 * pt) * 0.2) * np.exp(-pt * 20) * 0.07
            mix_at(bgm, apply_fade(pl, 0.003, 0.01), cur, 1.0)

        cur += beat
        step += 1

    bgm += np.sin(2 * np.pi * 55.0 * t) * 0.015
    return bgm


def synth_sfx(kind):
    if kind == "scratch":
        lt = np.arange(int(0.24 * SR)) / SR
        f = np.linspace(620, 200, len(lt))
        return apply_fade(signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 6) * 0.16, 0.005, 0.02)
    if kind == "crunch":
        lt = np.arange(int(0.22 * SR)) / SR
        rng = np.random.default_rng(77)
        noise = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [1200.0 / NYQ, 5500.0 / NYQ], btype="band")
        cr = signal.filtfilt(b, a, noise) * np.exp(-lt * 16) * 0.32
        return apply_fade(cr, 0.003, 0.02)
    if kind == "pop":
        lt = np.arange(int(0.16 * SR)) / SR
        f = np.linspace(460, 920, len(lt))
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 14) * 0.25, 0.003, 0.015)
    if kind == "ding":
        lt = np.arange(int(0.25 * SR)) / SR
        return apply_fade(np.sin(2 * np.pi * 1180 * lt) * np.exp(-lt * 9) * 0.22, 0.003, 0.02)
    return np.zeros(100)


def main():
    print("🎙️ [1/4] Sintetizando falas cômicas EP 02 com VoiceStudio (ep06_voce_alloy)...")
    synthesize_voices()

    print("🎛️ [2/4] Calculando timeline dinâmica por batida...")
    loaded = []
    beat_starts = []
    cursor = 0.0
    for dlg in DIALOGUES_DEF:
        arr, dur, lip = load_voice(dlg["file"])
        beat_starts.append(round(cursor, 3))
        v_start = cursor + dlg["pre_gap"]
        v_end = v_start + dur
        loaded.append({
            "id": dlg["id"],
            "speaker": dlg["speaker"],
            "text": dlg["text"],
            "start": round(v_start, 3),
            "duration": round(dur, 3),
            "end": round(v_end, 3),
            "lip_sync": lip,
            "arr": arr,
        })
        cursor = v_end + dlg["post_gap"]

    total_dur = round(cursor, 2)
    print(f"  ⏱️ Batidas: {beat_starts} | TOTAL={total_dur}s")

    print("🎵 [3/4] Gerando trilha 122 BPM com ducking + foley crocante...")
    n = int(math.ceil(total_dur * SR))
    bgm = synth_comedy_bgm(total_dur + 0.2)[:n]

    voice_mask = np.zeros(n)
    for d in loaded:
        s = int(d["start"] * SR)
        e = min(n, int((d["end"] + 0.10) * SR))
        voice_mask[max(0, s - int(0.08 * SR)):e] = 1.0
    win = int(0.14 * SR)
    smooth_mask = np.convolve(voice_mask, np.ones(win) / win, mode="same")
    bgm *= (1.0 - 0.62 * np.clip(smooth_mask, 0.0, 1.0))

    master = bgm.copy()
    bgm_ducked = apply_fade(master, 0.03, 2.00)
    sfx_bus = np.zeros(n)
    mix_at(sfx_bus, synth_sfx("scratch"), beat_starts[1], 0.9)
    mix_at(sfx_bus, synth_sfx("pop"), beat_starts[1] + 0.22, 0.85)
    mix_at(sfx_bus, synth_sfx("crunch"), beat_starts[2] + 0.85, 0.95)
    mix_at(sfx_bus, synth_sfx("crunch"), beat_starts[2] + 1.35, 0.85)
    mix_at(sfx_bus, synth_sfx("ding"), beat_starts[5] + 0.12, 0.85)

    # Fade apenas na trilha musical; voz permanece 100% íntegra até a última sílaba!
    master = bgm_ducked + sfx_bus
    for d in loaded:
        mix_at(master, d["arr"], d["start"], 0.96)

    pk = np.max(np.abs(master))
    if pk > 0.94:
        master = (master / pk) * 0.94
    master = apply_fade(master, 0.008, 0.03)

    out_wav = AUDIO_DIR / "ep02_mix.wav"
    wavfile.write(str(out_wav), SR, (np.clip(master, -1.0, 1.0) * 32767).astype(np.int16))

    tl = {
        "episode": 2,
        "slug": "ep02-cacetinho-quentinho",
        "duration": total_dur,
        "beat_starts": beat_starts,
        "audio_src": "./audio/ep02_mix.wav?v=1.0",
        "dialogues": [
            {k: v for k, v in d.items() if k != "arr"}
            for d in loaded
        ],
    }
    out_js = AUDIO_DIR / "ep02_timeline.js"
    out_js.write_text(
        "/** EP02_TIMELINE — Gerado automaticamente por gerar_audio_duplo_ep02.py */\n"
        f"window.EP02_DUPLO_TIMELINE = {json.dumps(tl, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"💾 [4/4] Mix gravado em {out_wav} ({total_dur}s) + {out_js.name}")


if __name__ == "__main__":
    main()
