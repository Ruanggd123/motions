"""Gerador de Audio Master -- Duplo Sentido 3D (EP 02 Renovado: A Lampada Magica Literal)."""
import asyncio
import json
import math
import os
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

import edge_tts
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent
AUDIO_DIR = ROOT / "audio"
GEN_DIR = AUDIO_DIR / "generated_ep02_genio"
SFX_BLOCO_C = ROOT.parent / "condominio-bloco-c" / "audio" / "sfx"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
GEN_DIR.mkdir(parents=True, exist_ok=True)

SR = 44100
NYQ = SR * 0.5


def resolve_ffmpeg():
    candidates = [
        shutil.which("ffmpeg"),
        str(ROOT.parent.parent / "voicestudio" / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"),
        str(ROOT.parent.parent / "node_modules" / "ffmpeg-static" / "ffmpeg.exe"),
        r"C:\ProgramData\chocolatey\bin\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
    ]
    for c in candidates:
        if c and Path(c).exists():
            return str(c)
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


FFMPEG_EXE = resolve_ffmpeg()

# 6 Batidas de Retencao + 7 falas rapidas e naturais (~31-33s sem tempo morto)
DIALOGUES_DEF = [
    {
        "id": "genio_b1_hook",
        "beat_idx": 0,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "01_pedido1_vara.wav",
        "text": "Achei uma lâmpada mágica e pedi: Gênio, quero a maior VARA da rua que ninguém aguente segurar!",
        "speech_text": "Achei uma lâmpada mágica e já pedi: Gênio, quero a maior vara da rua, que ninguém aguente segurar!...",
        "pre_gap": 0.08,
        "post_gap": 0.16,
    },
    {
        "id": "genio_b2_vara",
        "beat_idx": 1,
        "speaker": "genio",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_valdir_echo",
        "file": GEN_DIR / "02_genio_vara.wav",
        "text": "Tá na mão! Quatro metros de bambu com sardinha, boa pescaria!",
        "speech_text": "Tá na mão! Quatro metros de bambu com sardinha na ponta, boa pescaria!...",
        "pre_gap": 0.16,
        "post_gap": 0.14,
    },
    {
        "id": "genio_b3_tanque",
        "beat_idx": 2,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "03_pedido2_tanque.wav",
        "text": "Não, Gênio! Segundo pedido: me deixa com um TANQUE TRINCADO aqui na frente!",
        "speech_text": "Não, Gênio! Segundo pedido, presta atenção: me deixa com um tanque trincado aqui na frente!...",
        "pre_gap": 0.10,
        "post_gap": 0.16,
    },
    {
        "id": "genio_b4_camila",
        "beat_idx": 3,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+6%",
        "pitch": "+2Hz",
        "file": GEN_DIR / "04_camila_choque.wav",
        "text": "Gente... por que apareceu um tanque de lavar roupa rachado no terraço?!",
        "speech_text": "Gente, por que apareceu um tanque de lavar roupa rachado bem aqui no terraço?!",
        "pre_gap": 0.14,
        "post_gap": 0.10,
    },
    {
        "id": "genio_b4_genio",
        "beat_idx": 3,
        "speaker": "genio",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_valdir_echo",
        "file": GEN_DIR / "05_genio_ironia.wav",
        "text": "Ele pediu tanque trincado, olha a rachadura bem no meio, perfeita!",
        "speech_text": "Ele pediu tanque trincado, moça! Olha a rachadura bem no meio, perfeita!...",
        "pre_gap": 0.08,
        "post_gap": 0.14,
    },
    {
        "id": "genio_b5_milhoes",
        "beat_idx": 4,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "06_pedido3_milhoes.wav",
        "text": "Último pedido, impossível errar: bota DEZ MILHÕES aqui na minha frente agora!",
        "speech_text": "Último pedido, impossível errar: bota dez milhões aqui na minha frente agora!...",
        "pre_gap": 0.10,
        "post_gap": 0.18,
    },
    {
        "id": "genio_b6_cta",
        "beat_idx": 5,
        "speaker": "genio",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_valdir_echo",
        "file": GEN_DIR / "07_genio_final.wav",
        "text": "Dez milhos bem grandes: são DEZ MILHÕES! Comenta aí um pedido que eu não consiga estragar!",
        "speech_text": "Dez milhos bem grandes: são dez milhões! Agora comenta aí um pedido que nem eu consiga estragar!...",
        "pre_gap": 0.14,
        "post_gap": 2.10,
    },
]


def run_ff(args, label):
    res = subprocess.run([FFMPEG_EXE, "-hide_banner", "-loglevel", "error", *args], capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg [{label}]: {res.stderr[-400:]}")


def apply_fade(arr, fade_in=0.014, fade_out=0.032):
    out = arr.copy()
    ni = min(len(out), int(fade_in * SR))
    no = min(len(out), int(fade_out * SR))
    if ni > 1:
        out[:ni] *= 0.5 * (1.0 - np.cos(np.linspace(0.0, math.pi, ni)))
    if no > 1:
        out[-no:] *= 0.5 * (1.0 + np.cos(np.linspace(0.0, math.pi, no)))
    return out


def inspect_wav_tail(wav_path):
    _, data = wavfile.read(str(wav_path))
    if data.ndim > 1:
        data = data[:, 0]
    arr = data.astype(np.float64)
    if len(arr) < int(0.15 * SR):
        return False, 1.0
    pk = float(np.max(np.abs(arr))) + 1e-6
    last_50 = float(np.sqrt(np.mean(arr[-int(0.06 * SR) :] ** 2))) / pk
    return last_50 < 0.15, last_50


async def synthesize_voices():
    force = "--force" in sys.argv
    for idx, dlg in enumerate(DIALOGUES_DEF):
        out_file = dlg["file"]
        if not force and out_file.exists() and out_file.stat().st_size > 12000:
            print(f"  [Cache] {out_file.name}", flush=True)
            continue

        if dlg["voice_type"] == "edge":
            edge_v = dlg["edge_voice"]
            print(f"  [Edge-TTS] {out_file.name} ({edge_v})...", flush=True)
            tmp_mp3 = GEN_DIR / f"_tmp_{out_file.stem}.mp3"
            ok = False
            for att in range(3):
                try:
                    comm = edge_tts.Communicate(dlg["speech_text"], edge_v, rate=dlg.get("rate", "+4%"), pitch=dlg.get("pitch", "+0Hz"))
                    await comm.save(str(tmp_mp3))
                    if tmp_mp3.exists() and tmp_mp3.stat().st_size > 1000:
                        run_ff(["-y", "-i", str(tmp_mp3), "-ar", str(SR), "-ac", "1", str(out_file)], f"Convert {out_file.name}")
                        tmp_mp3.unlink(missing_ok=True)
                        ok = True
                        break
                except Exception as exc:
                    print(f"    [Retry {att+1}] {exc}", flush=True)
                    await asyncio.sleep(1.0)
            if not ok:
                raise RuntimeError(f"Edge-TTS falhou para {out_file.name}")
            continue

        best_bytes = None
        best_tail = 999.0
        for attempt in range(2):
            txt = dlg["speech_text"] if attempt == 0 else (dlg["speech_text"].rstrip(".!?") + "... ")
            payload = json.dumps({
                "model": "tts-1",
                "input": txt,
                "voice": dlg["vs_voice"],
                "language": "pt",
                "response_format": "wav",
                "speed": 1.03 if dlg["speaker"] == "genio" else 1.02,
                "preprocess_prompt": True,
                "denoise": True,
                "num_step": 18,
                "guidance_scale": 2.0,
                "seed": 820 + idx * 31 + attempt * 101,
            }).encode("utf-8")
            req = urllib.request.Request(
                "http://127.0.0.1:3900/v1/audio/speech",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=360) as res:
                raw = res.read()
            with open(out_file, "wb") as f:
                f.write(raw)
            ok, ratio = inspect_wav_tail(out_file)
            print(f"  [VoiceStudio] {out_file.name} ({dlg['vs_voice']}) try={attempt+1} tail={ratio:.4f}", flush=True)
            if ratio < best_tail:
                best_tail = ratio
                best_bytes = raw
            if ok:
                break
        if best_bytes is not None:
            with open(out_file, "wb") as f:
                f.write(best_bytes)


def apply_genie_dsp(arr):
    # Toque teatral encantado sutil sem deformar clareza da fala (slapback + calor vocal)
    d1 = int(0.032 * SR)
    d2 = int(0.068 * SR)
    out = arr.copy()
    if d1 < len(arr):
        out[d1:] += arr[:-d1] * 0.14
    if d2 < len(arr):
        out[d2:] += arr[:-d2] * 0.08
    return out


def load_voice(wav_path, speaker):
    sr_in, data = wavfile.read(str(wav_path))
    if data.ndim > 1:
        data = data[:, 0]
    arr = data.astype(np.float64)
    if np.issubdtype(data.dtype, np.integer):
        arr = arr / float(np.iinfo(data.dtype).max)
    if sr_in != SR:
        g = math.gcd(int(sr_in), int(SR))
        arr = signal.resample_poly(arr, int(SR) // g, int(sr_in) // g)

    # Corte rigoroso apenas de silencio morto extremo; preserva cauda natural de fim de silaba!
    env = np.abs(arr)
    win = int(0.025 * SR)
    sm = np.convolve(env, np.ones(win) / win, mode="same")
    nz = np.where(sm > 0.0012)[0]
    if len(nz) > 0:
        s0 = max(0, int(nz[0]) - int(0.045 * SR))
        s1 = min(len(arr), int(nz[-1]) + int(0.280 * SR))
        arr = arr[s0:s1]

    arr = apply_fade(arr, 0.012, 0.055)
    arr = np.pad(arr, (int(0.03 * SR), int(0.08 * SR)), mode="constant")

    b, a = signal.butter(2, [85.0 / NYQ, 8600.0 / NYQ], btype="band")
    arr = signal.filtfilt(b, a, arr)
    if speaker == "genio":
        arr = apply_genie_dsp(arr)

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
    if s >= len(master) or s + len(clip) <= 0:
        return
    src0 = max(0, -s)
    dst0 = max(0, s)
    cnt = min(len(master) - dst0, len(clip) - src0)
    if cnt > 0:
        master[dst0 : dst0 + cnt] += clip[src0 : src0 + cnt] * gain


def synth_magic_comedy_bgm(total_sec):
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 124.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)

    # Groove divertido arabe/comico leve (marimba + baixo pizzicato)
    bass_notes = [146.83, 174.61, 220.00, 196.00, 146.83, 207.65, 220.00, 164.81]
    marimba = [587.33, 698.46, 880.00, 783.99, 659.25, 698.46]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass_notes[step % len(bass_notes)]
        lt = np.arange(int(beat * 0.42 * SR)) / SR
        tone = (np.sin(2 * np.pi * freq * lt) * 0.55 + np.sin(4 * np.pi * freq * lt) * 0.16) * np.exp(-lt * 6.8) * 0.12
        mix_at(bgm, apply_fade(tone, 0.005, 0.02), cur, 1.0)

        if step % 2 == 1:
            mf = marimba[step % len(marimba)]
            mt = np.arange(int(0.11 * SR)) / SR
            pl = (np.sin(2 * np.pi * mf * mt) * 0.6 + np.sin(2 * np.pi * mf * 2 * mt) * 0.18) * np.exp(-mt * 18) * 0.065
            mix_at(bgm, apply_fade(pl, 0.003, 0.015), cur, 1.0)

        cur += beat
        step += 1

    bgm += np.sin(2 * np.pi * 55.0 * t) * 0.012
    return bgm


def synth_sfx(kind):
    if kind == "poof":
        lt = np.arange(int(0.32 * SR)) / SR
        rng = np.random.default_rng(101)
        whoosh = signal.lfilter([0.2], [1.0, -0.8], rng.normal(0, 1, len(lt)))
        env = np.exp(-lt * 9.0) * (1.0 - np.exp(-lt * 45.0))
        chime = (np.sin(2 * np.pi * 880 * lt) + 0.6 * np.sin(2 * np.pi * 1320 * lt)) * np.exp(-lt * 8.5) * 0.22
        return apply_fade(whoosh * env * 0.35 + chime, 0.005, 0.03)
    if kind == "boing":
        lt = np.arange(int(0.30 * SR)) / SR
        f = 220 + 180 * np.sin(lt * 26.0) * np.exp(-lt * 5.0)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 7.5) * 0.25, 0.004, 0.02)
    if kind == "thud":
        lt = np.arange(int(0.28 * SR)) / SR
        f = np.linspace(145, 42, len(lt))
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 11.0) * 0.38
        crack = np.random.default_rng(7).normal(0, 1, len(lt)) * np.exp(-lt * 28.0) * 0.18
        return apply_fade(body + crack, 0.002, 0.03)
    if kind == "sparkle":
        lt = np.arange(int(0.42 * SR)) / SR
        notes = [1046.5, 1318.5, 1567.98, 2093.0]
        sig = np.zeros_like(lt)
        for i, nf in enumerate(notes):
            delay = int(i * 0.06 * SR)
            if delay < len(lt):
                sub = lt[: len(lt) - delay]
                sig[delay:] += np.sin(2 * np.pi * nf * sub) * np.exp(-sub * 10.0) * 0.14
        return apply_fade(sig, 0.004, 0.04)
    if kind == "snap":
        lt = np.arange(int(0.08 * SR)) / SR
        rng = np.random.default_rng(19)
        b, a = signal.butter(2, [1400.0 / NYQ, 6500.0 / NYQ], btype="band")
        c = signal.filtfilt(b, a, rng.normal(0, 1, len(lt))) * np.exp(-lt * 65.0) * 0.45
        return apply_fade(c, 0.001, 0.015)
    return np.zeros(100)


def main():
    print("[1/4] Sintetizando vozes Duplo Sentido 3D EP 02 (Lampada Magica)...")
    asyncio.run(synthesize_voices())

    print("[2/4] Montando timeline justa e fluidez continua...")
    loaded = []
    beat_starts = [0.0, None, None, None, None, None]
    cursor = 0.0
    for dlg in DIALOGUES_DEF:
        arr, dur, lip = load_voice(dlg["file"], dlg["speaker"])
        bi = dlg["beat_idx"]
        if beat_starts[bi] is None:
            beat_starts[bi] = round(cursor, 3)
        v_start = cursor + dlg["pre_gap"]
        v_end = v_start + dur
        loaded.append({
            "id": dlg["id"],
            "beat_idx": bi,
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
    print(f"  Batidas: {beat_starts} | TOTAL={total_dur}s")

    n = int(math.ceil(total_dur * SR))
    bgm = synth_magic_comedy_bgm(total_dur + 0.3)[:n]

    # Suaviza trilha nos ultimos 2.1s para terminacao organica sem corte abrupto!
    tail_fade = min(n, int(1.8 * SR))
    bgm[-tail_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, tail_fade)) ** 1.4

    voice_bus = np.zeros(n)
    sfx_bus = np.zeros(n)
    duck_env = np.ones(n)

    for d in loaded:
        mix_at(voice_bus, d["arr"], d["start"], 1.0)
        s_i = max(0, int((d["start"] - 0.06) * SR))
        e_i = min(n, int((d["end"] + 0.08) * SR))
        duck_env[s_i:e_i] = 0.44

    # Suaviza envelope de ducking pra trilha respirar organicamente
    duck_win = int(0.14 * SR)
    duck_env = np.convolve(duck_env, np.ones(duck_win) / duck_win, mode="same")

    # Foley estrategicos em cada revelacao
    mix_at(sfx_bus, synth_sfx("sparkle"), 0.25, 0.85)
    mix_at(sfx_bus, synth_sfx("poof"), max(0.2, beat_starts[1] - 0.05), 0.90)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[1] + 0.12, 0.80)
    mix_at(sfx_bus, synth_sfx("snap"), max(0.2, beat_starts[3] - 0.18), 0.85)
    mix_at(sfx_bus, synth_sfx("thud"), beat_starts[3] - 0.02, 0.95)
    mix_at(sfx_bus, synth_sfx("poof"), beat_starts[5] - 0.05, 0.90)
    mix_at(sfx_bus, synth_sfx("sparkle"), beat_starts[5] + 0.06, 0.95)

    # Latido real do Pacoca na reacao do tanque (B4)
    bark_wav = SFX_BLOCO_C / "real_Barking_of_a_dog.wav"
    if bark_wav.exists():
        try:
            sr_b, b_data = wavfile.read(str(bark_wav))
            if b_data.ndim > 1:
                b_data = b_data[:, 0]
            b_arr = b_data.astype(np.float64) / float(np.iinfo(b_data.dtype).max)
            if sr_b != SR:
                g = math.gcd(sr_b, SR)
                b_arr = signal.resample_poly(b_arr, SR // g, sr_b // g)
            b_clip = apply_fade(b_arr[: int(0.85 * SR)], 0.01, 0.05)
            mix_at(sfx_bus, b_clip, beat_starts[3] + 0.30, 0.26)
        except Exception:
            pass

    master = bgm * duck_env + sfx_bus * 0.72 + voice_bus * 0.95
    pk = np.max(np.abs(master))
    if pk > 0:
        master = np.tanh((master / pk) * 1.12) * 0.86

    # Fade final limpo nos ultimos 250ms
    end_fade = min(len(master), int(0.25 * SR))
    master[-end_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, end_fade)) ** 2

    out_wav = AUDIO_DIR / "ep02_genio_mix.wav"
    wavfile.write(str(out_wav), SR, np.clip(master * 32767.0, -32767, 32767).astype(np.int16))

    tl_obj = {
        "episode": 2,
        "slug": "ep02-lampada-genio",
        "duration": total_dur,
        "beat_starts": beat_starts,
        "dialogues": [
            {
                "id": d["id"],
                "beat_idx": d["beat_idx"],
                "speaker": d["speaker"],
                "text": d["text"],
                "start": d["start"],
                "duration": d["duration"],
                "end": d["end"],
                "lip_sync": d["lip_sync"],
            }
            for d in loaded
        ],
    }
    tl_js = AUDIO_DIR / "ep02_genio_timeline.js"
    with open(tl_js, "w", encoding="utf-8") as f:
        f.write("window.EP02_GENIO_TIMELINE = " + json.dumps(tl_obj, ensure_ascii=False) + ";\n")

    print(f"Master pronto: {out_wav.name} ({total_dur}s) e {tl_js.name}")


if __name__ == "__main__":
    main()
