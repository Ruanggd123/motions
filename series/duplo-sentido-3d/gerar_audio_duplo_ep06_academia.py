"""Gerador de Audio Master -- Duplo Sentido 3D (EP 06 v3: Comedia In Media Res + Distorcao Cartoon 3D!)."""
import asyncio
import json
import math
import shutil
import subprocess
import sys
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
GEN_DIR = AUDIO_DIR / "generated_ep06_academia"
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

DIALOGUES_DEF = [
    {
        "id": "ep06_b1a_camila_hook",
        "beat_idx": 0,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+10%",
        "pitch": "+4Hz",
        "atempo": 1.08,
        "file": GEN_DIR / "01a_camila_hook.wav",
        "text": "PARA DE TREMER E ENCAIXA DIREITO! Se você tirar antes da hora vai doer nos dois!",
        "speech_text": "Para de tremer e encaixa direito! Se você tirar antes da hora vai doer nos dois!",
        "pre_gap": 0.04,
        "post_gap": 0.06,
    },
    {
        "id": "ep06_b1b_voce_panico",
        "beat_idx": 0,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.08,
        "atempo": 1.12,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "01b_voce_panico.wav",
        "text": "Pera aí, Camila! A gente mal começou e eu já tô sem ar!",
        "speech_text": "Pera aí, Camila! A gente mal começou e eu já tô sem ar!...",
        "pre_gap": 0.04,
        "post_gap": 0.12,
    },
    {
        "id": "ep06_b2_camila_reveal",
        "beat_idx": 1,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+9%",
        "pitch": "+3Hz",
        "atempo": 1.08,
        "file": GEN_DIR / "02_camila_reveal.wav",
        "text": "Cê jurou que aguentava 60 QUILOS no primeiro dia, agora desce até o talo!",
        "speech_text": "Cê jurou que aguentava sessenta quilos no primeiro dia, agora desce até o talo!",
        "pre_gap": 0.08,
        "post_gap": 0.10,
    },
    {
        "id": "ep06_b3_voce_ego",
        "beat_idx": 2,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.06,
        "atempo": 1.10,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "03_voce_ego.wav",
        "text": "Moleza! Olha minha postura... só ignora minha perna tremendo que é tática de atleta!",
        "speech_text": "Moleza! Olha minha postura... só ignora minha perna tremendo que é tática de atleta!...",
        "pre_gap": 0.08,
        "post_gap": 0.10,
    },
    {
        "id": "ep06_b4_camila_trava",
        "beat_idx": 3,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+7%",
        "pitch": "+2Hz",
        "atempo": 1.05,
        "file": GEN_DIR / "04_camila_trava.wav",
        "text": "EITA! A trava vermelha já soltou! NÃO SE MEXE!",
        "speech_text": "Eita, cuidado! A trava vermelha já soltou! Não se mexe!",
        "pre_gap": 0.06,
        "post_gap": 0.10,
    },
    {
        "id": "ep06_b5_voce_desastre",
        "beat_idx": 4,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.06,
        "atempo": 1.08,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "05_voce_desastre.wav",
        "text": "Calma que eu salvei o espelho... ops, o pote de giz não!",
        "speech_text": "Calma que eu salvei o espelho... ops, o pote de giz não!...",
        "pre_gap": 0.34,
        "post_gap": 0.14,
    },
    {
        "id": "ep06_b6_voce_roast",
        "beat_idx": 5,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.07,
        "atempo": 1.10,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "06_voce_roast.wav",
        "text": "E você que pensou besteira nos dois primeiros segundos... comenta MENTE POLUÍDA ou dá nota pra minha cara!",
        "speech_text": "E você que pensou besteira nos dois primeiros segundos... comenta mente poluída ou dá nota pra minha cara!...",
        "pre_gap": 0.08,
        "post_gap": 1.85,
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
    last_60 = float(np.sqrt(np.mean(arr[-int(0.06 * SR) :] ** 2))) / pk
    return last_60 < 0.15, last_60


async def synth_edge(text, voice, out_file, rate="+9%", pitch="+3Hz"):
    tmp_mp3 = GEN_DIR / f"_tmp_{out_file.stem}.mp3"
    for att in range(3):
        try:
            comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await comm.save(str(tmp_mp3))
            if tmp_mp3.exists() and tmp_mp3.stat().st_size > 1000:
                run_ff(["-y", "-i", str(tmp_mp3), "-ar", str(SR), "-ac", "1", str(out_file)], f"Convert {out_file.name}")
                tmp_mp3.unlink(missing_ok=True)
                return True
        except Exception as exc:
            print(f"    [Retry Edge {att+1}] {exc}", flush=True)
            await asyncio.sleep(1.0)
    return False


async def synthesize_voices():
    force = "--force" in sys.argv
    for idx, dlg in enumerate(DIALOGUES_DEF):
        out_file = dlg["file"]
        if not force and out_file.exists() and out_file.stat().st_size > 12000:
            print(f"  [Cache] {out_file.name}", flush=True)
            continue

        if dlg["voice_type"] == "edge":
            print(f"  [Edge-TTS] {out_file.name} ({dlg['edge_voice']})...", flush=True)
            ok = await synth_edge(dlg["speech_text"], dlg["edge_voice"], out_file, dlg.get("rate", "+9%"), dlg.get("pitch", "+3Hz"))
            if not ok:
                raise RuntimeError(f"Edge-TTS falhou para {out_file.name}")
            continue

        best_bytes = None
        best_tail = 999.0
        vs_ok = False
        for attempt in range(2):
            try:
                txt = dlg["speech_text"] if attempt == 0 else (dlg["speech_text"].rstrip(".!?") + "... ")
                payload = json.dumps({
                    "model": "tts-1",
                    "input": txt,
                    "voice": dlg["vs_voice"],
                    "language": "pt",
                    "response_format": "wav",
                    "speed": float(dlg.get("vs_speed", 1.06)),
                    "preprocess_prompt": True,
                    "denoise": True,
                    "num_step": 12,
                    "guidance_scale": 2.0,
                    "seed": 1705 + idx * 47 + attempt * 113,
                }).encode("utf-8")
                req = urllib.request.Request(
                    "http://127.0.0.1:3900/v1/audio/speech",
                    data=payload,
                    headers={"Content-Type": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=900) as res:
                    raw = res.read()
                with open(out_file, "wb") as f:
                    f.write(raw)
                ok, ratio = inspect_wav_tail(out_file)
                print(f"  [VoiceStudio] {out_file.name} ({dlg['vs_voice']}) try={attempt+1} tail={ratio:.4f}", flush=True)
                vs_ok = True
                if ratio < best_tail:
                    best_tail = ratio
                    best_bytes = raw
                if ok:
                    break
            except Exception as exc:
                print(f"  [VoiceStudio fallback] {exc}", flush=True)
                break
        if vs_ok and best_bytes is not None:
            with open(out_file, "wb") as f:
                f.write(best_bytes)
        elif not vs_ok:
            fb = dlg.get("edge_fallback", "pt-BR-AntonioNeural")
            print(f"  [Edge-Fallback] {out_file.name} ({fb})...", flush=True)
            ok = await synth_edge(dlg["speech_text"], fb, out_file, "+9%", "+0Hz")
            if not ok:
                raise RuntimeError(f"Fallback Edge-TTS falhou para {out_file.name}")


def load_voice(wav_path, atempo=1.10):
    sr_in, data = wavfile.read(str(wav_path))
    if data.ndim > 1:
        data = data[:, 0]
    arr = data.astype(np.float64)
    if np.issubdtype(data.dtype, np.integer):
        arr = arr / float(np.iinfo(data.dtype).max)
    if sr_in != SR:
        g = math.gcd(int(sr_in), int(SR))
        arr = signal.resample_poly(arr, int(SR) // g, int(sr_in) // g)

    env = np.abs(arr)
    win = int(0.025 * SR)
    sm = np.convolve(env, np.ones(win) / win, mode="same")
    nz = np.where(sm > 0.0014)[0]
    if len(nz) > 0:
        s0 = max(0, int(nz[0]) - int(0.032 * SR))
        s1 = min(len(arr), int(nz[-1]) + int(0.210 * SR))
        arr = arr[s0:s1]

    tmp_in = GEN_DIR / f"_in_{wav_path.stem}.wav"
    tmp_fast = GEN_DIR / f"_fast_{wav_path.stem}.wav"
    wavfile.write(str(tmp_in), SR, (np.clip(arr, -1.0, 1.0) * 32767.0).astype(np.int16))
    tempo_str = f"atempo={float(atempo):.2f}"
    run_ff(["-y", "-i", str(tmp_in), "-filter:a", tempo_str, str(tmp_fast)], f"Tempo {wav_path.name}")
    _, f_data = wavfile.read(str(tmp_fast))
    tmp_in.unlink(missing_ok=True)
    tmp_fast.unlink(missing_ok=True)
    arr = f_data.astype(np.float64) / 32768.0

    arr = apply_fade(arr, 0.010, 0.048)
    arr = np.pad(arr, (int(0.016 * SR), int(0.060 * SR)), mode="constant")
    b, a = signal.butter(2, [85.0 / NYQ, 8600.0 / NYQ], btype="band")
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
    if s >= len(master) or s + len(clip) <= 0:
        return
    src0 = max(0, -s)
    dst0 = max(0, s)
    cnt = min(len(master) - dst0, len(clip) - src0)
    if cnt > 0:
        master[dst0 : dst0 + cnt] += clip[src0 : src0 + cnt] * gain


def synth_academia_bgm(total_sec):
    """Trilha fitness comica animada (groove synth-bass + estalo ritmico de treino de manha)."""
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 142.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)
    bass = [146.83, 174.61, 220.0, 174.61, 164.81, 196.0, 246.94, 220.0]
    lead = [587.33, 659.25, 783.99, 659.25, 880.0, 783.99]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass[step % len(bass)]
        lt = np.arange(int(beat * 0.40 * SR)) / SR
        tone = (np.sin(2 * np.pi * freq * lt) * 0.56 + np.sin(4 * np.pi * freq * lt) * 0.16) * np.exp(-lt * 7.4) * 0.12
        mix_at(bgm, apply_fade(tone, 0.004, 0.02), cur, 1.0)
        if step % 2 == 1:
            mf = lead[step % len(lead)]
            mt = np.arange(int(0.10 * SR)) / SR
            pl = (np.sin(2 * np.pi * mf * mt) * 0.52 + np.sin(6 * np.pi * mf * mt) * 0.12) * np.exp(-mt * 18.0) * 0.055
            mix_at(bgm, apply_fade(pl, 0.003, 0.015), cur, 1.0)
        cur += beat
        step += 1

    bgm += np.sin(2 * np.pi * 73.42 * t) * 0.008
    return bgm


def synth_sfx(kind):
    """SFX cartoon + academia/anilhas/giz (ZERO latido!)."""
    if kind == "pop":
        lt = np.arange(int(0.16 * SR)) / SR
        f = 380 + 680 * np.exp(-lt * 20)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 16) * 0.36, 0.002, 0.02)

    if kind == "record_scratch":
        # Vinyl record-scratch comico na revelacao B1->B2!
        lt = np.arange(int(0.30 * SR)) / SR
        rng = np.random.default_rng(71)
        f = 520 + 1350 * np.sin(lt * 34.0) * np.exp(-lt * 3.0)
        sc = np.sin(2 * np.pi * np.cumsum(np.maximum(120.0, f)) / SR) * 0.38
        b, a = signal.butter(2, [900.0 / NYQ, 4800.0 / NYQ], btype="band")
        grit = signal.filtfilt(b, a, rng.normal(0, 1, len(lt))) * 0.20
        env = np.sin(np.linspace(0.0, math.pi, len(lt))) ** 0.7
        return apply_fade((sc + grit) * env, 0.004, 0.025)

    if kind == "whoosh_reveal":
        lt = np.arange(int(0.38 * SR)) / SR
        rng = np.random.default_rng(61)
        noise = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [260.0 / NYQ, 3000.0 / NYQ], btype="band")
        sw = signal.filtfilt(b, a, noise)
        env = np.sin(np.linspace(0.0, math.pi, len(lt))) ** 1.3
        tone = np.sin(2 * np.pi * np.cumsum(260 + 520 * np.linspace(0, 1, len(lt))) / SR) * 0.14
        return apply_fade((sw * 0.26 + tone) * env, 0.008, 0.035)

    if kind == "rubber_stretch":
        # Som elastico cartoon de esticar borracha/joelho gelatina!
        lt = np.arange(int(0.55 * SR)) / SR
        f = 240 + 310 * np.linspace(0, 1, len(lt)) + 110 * np.sin(lt * 34.0)
        tone = (
            np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.55
            + np.sin(4 * np.pi * np.cumsum(f) / SR) * 0.18
        ) * np.sin(np.linspace(0, math.pi, len(lt)))
        return apply_fade(tone * 0.34, 0.01, 0.04)

    if kind == "boing":
        lt = np.arange(int(0.36 * SR)) / SR
        f = 195 + 260 * np.sin(lt * 30.0) * np.exp(-lt * 4.6)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 6.5) * 0.34, 0.004, 0.02)

    if kind == "metal_clink":
        lt = np.arange(int(0.34 * SR)) / SR
        tone = (
            np.sin(2 * np.pi * 1240 * lt) * 0.38
            + np.sin(2 * np.pi * 1980 * lt) * 0.28
            + np.sin(2 * np.pi * 2890 * lt) * 0.16
        ) * np.exp(-lt * 11.5)
        return apply_fade(tone * 0.42, 0.002, 0.04)

    if kind == "collar_rattle":
        # Suspense metalico acelerando em B4 quando a trava vermelha escorrega!
        total = 2.25
        lt = np.arange(int(total * SR)) / SR
        rng = np.random.default_rng(64)
        out = np.zeros_like(lt)
        t_cur = 0.0
        while t_cur < total - 0.08:
            prog = t_cur / total
            idx0 = int(t_cur * SR)
            sub_len = min(len(lt) - idx0, int(0.10 * SR))
            st = np.arange(sub_len) / SR
            pitch_lift = 1.0 + prog * 0.32
            ping = (
                np.sin(2 * np.pi * (1540 * pitch_lift) * st) * 0.44
                + np.sin(2 * np.pi * (2460 * pitch_lift) * st) * 0.32
                + np.sin(2 * np.pi * (3740 * pitch_lift) * st) * 0.20
            ) * np.exp(-st * 34.0)
            b, a = signal.butter(2, [900.0 / NYQ, 5400.0 / NYQ], btype="band")
            scrape = signal.filtfilt(b, a, rng.normal(0, 1, sub_len)) * np.exp(-st * 28.0) * 0.24
            amp = 0.32 + 0.66 * prog
            out[idx0 : idx0 + sub_len] += (ping + scrape) * amp
            t_cur += max(0.055, 0.21 - prog * 0.15)
        return apply_fade(out * 0.60, 0.03, 0.06)

    if kind == "collar_ping":
        # PING-ZING metalico explosivo quando a trava dispara em B5!
        lt = np.arange(int(0.52 * SR)) / SR
        f_zip = 1920.0 + 920.0 * (1.0 - np.exp(-lt * 19.0))
        ping = (
            np.sin(2 * np.pi * np.cumsum(f_zip) / SR) * 0.48
            + np.sin(2 * np.pi * 3200.0 * lt) * 0.34
            + np.sin(2 * np.pi * 4760.0 * lt) * 0.22
            + np.sin(2 * np.pi * 960.0 * lt) * 0.20
        ) * np.exp(-lt * 7.6)
        snap = np.sin(2 * np.pi * 540.0 * lt) * np.exp(-lt * 55.0) * 0.48
        return apply_fade((ping + snap) * 0.78, 0.001, 0.05)

    if kind == "plate_crash":
        # 3 anilhas quicando feito bola de borracha cartoon no tatame!
        lt = np.arange(int(1.75 * SR)) / SR
        rng = np.random.default_rng(66)
        out = np.zeros_like(lt)
        impacts = [
            (0.00, 122, 0.92, 1.00),
            (0.16, 104, 0.98, 0.95),
            (0.28, 148, 0.56, 0.72),
            (0.34, 84, 1.08, 1.08),
            (0.48, 118, 0.62, 0.75),
            (0.62, 98, 0.68, 0.78),
            (0.84, 134, 0.42, 0.58),
            (1.06, 152, 0.28, 0.42),
        ]
        for off, pitch, g, clang_g in impacts:
            idx0 = int(off * SR)
            sub_len = min(len(lt) - idx0, int(0.42 * SR))
            if sub_len <= 16:
                continue
            st = np.arange(sub_len) / SR
            thud = np.sin(2 * np.pi * (pitch + 110.0 * np.exp(-st * 24.0)) * st) * np.exp(-st * 9.8)
            sub_boom = np.sin(2 * np.pi * (pitch * 0.55) * st) * np.exp(-st * 11.5) * 0.40
            clang = (
                np.sin(2 * np.pi * 1160.0 * st) * 0.25
                + np.sin(2 * np.pi * 1890.0 * st) * 0.18
                + np.sin(2 * np.pi * 2740.0 * st) * 0.11
            ) * np.exp(-st * 14.5) * clang_g
            b, a = signal.butter(2, [260.0 / NYQ, 3600.0 / NYQ], btype="band")
            rattle = signal.filtfilt(b, a, rng.normal(0, 1, sub_len)) * np.exp(-st * 12.0) * 0.16
            out[idx0 : idx0 + sub_len] += (thud * 0.60 + sub_boom + clang + rattle) * g
        return apply_fade(out * 0.78, 0.003, 0.14)

    if kind == "chalk_poof":
        # Impacto da anilha de 20kg no suporte + MEGA EXPLOSAO DE GIZ CARTOON!
        lt = np.arange(int(1.05 * SR)) / SR
        rng = np.random.default_rng(68)
        knock = (
            np.sin(2 * np.pi * (165.0 + 150.0 * np.exp(-lt * 32.0)) * lt) * np.exp(-lt * 14.0) * 0.58
            + np.sin(2 * np.pi * 860.0 * lt) * np.exp(-lt * 20.0) * 0.30
        )
        raw_n = rng.normal(0, 1, len(lt))
        b_lo, a_lo = signal.butter(2, [180.0 / NYQ, 1900.0 / NYQ], btype="band")
        b_hi, a_hi = signal.butter(2, [1400.0 / NYQ, 6000.0 / NYQ], btype="band")
        poof_body = signal.filtfilt(b_lo, a_lo, raw_n) * (1.0 - np.exp(-lt * 48.0)) * np.exp(-lt * 3.8)
        poof_air = signal.filtfilt(b_hi, a_hi, raw_n) * (1.0 - np.exp(-lt * 68.0)) * np.exp(-lt * 5.2)
        return apply_fade((knock + poof_body * 0.68 + poof_air * 0.46) * 0.88, 0.003, 0.14)

    return np.zeros(100)


def main():
    print("[1/4] Sintetizando vozes Duplo Sentido 3D EP 06 v3 (In Media Res + Distorcao Cartoon)...")
    asyncio.run(synthesize_voices())

    print("[2/4] Montando timeline e batidas continuas...")
    loaded = []
    beat_starts = [0.0, None, None, None, None, None]
    cursor = 0.0
    for dlg in DIALOGUES_DEF:
        arr, dur, lip = load_voice(dlg["file"], atempo=dlg.get("atempo", 1.10))
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
    print(f"  Batidas EP06: {beat_starts} | TOTAL={total_dur}s")

    n = int(math.ceil(total_dur * SR))
    bgm = synth_academia_bgm(total_dur + 0.3)[:n]
    tail_fade = min(n, int(1.65 * SR))
    bgm[-tail_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, tail_fade)) ** 1.4

    voice_bus = np.zeros(n)
    sfx_bus = np.zeros(n)
    duck_env = np.ones(n)

    for d in loaded:
        mix_at(voice_bus, d["arr"], d["start"], 1.0)
        s_i = max(0, int((d["start"] - 0.05) * SR))
        e_i = min(n, int((d["end"] + 0.07) * SR))
        duck_env[s_i:e_i] = 0.40

    duck_win = int(0.14 * SR)
    duck_env = np.convolve(duck_env, np.ones(duck_win) / duck_win, mode="same")

    # B1: Fisheye pop em Camila + pop gigante quando Voce entra em panico!
    mix_at(sfx_bus, synth_sfx("pop"), 0.04, 0.80)
    b1b_start = loaded[1]["start"] if len(loaded) > 1 else 3.2
    mix_at(sfx_bus, synth_sfx("pop"), max(0.4, b1b_start - 0.05), 0.90)

    # B2: Record-scratch + whip-dolly whoosh + boing sanfona revelando Voce esmagado sob a barra em U!
    mix_at(sfx_bus, synth_sfx("record_scratch"), max(0.3, beat_starts[1] - 0.14), 0.86)
    mix_at(sfx_bus, synth_sfx("whoosh_reveal"), max(0.3, beat_starts[1] - 0.08), 0.78)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[1] + 0.06, 0.85)
    mix_at(sfx_bus, synth_sfx("rubber_stretch"), beat_starts[1] + 0.55, 0.72)

    # B3: Estufou peito -> joelhos viram gelatina (rubber stretch + clink do haltere vibrando no rack!)
    mix_at(sfx_bus, synth_sfx("pop"), beat_starts[2] + 0.12, 0.75)
    mix_at(sfx_bus, synth_sfx("rubber_stretch"), beat_starts[2] + 1.05, 0.84)
    mix_at(sfx_bus, synth_sfx("metal_clink"), beat_starts[2] + 1.85, 0.68)

    # B4: Crash-zoom fisheye na trava vermelha soltando + head pop da Camila!
    mix_at(sfx_bus, synth_sfx("pop"), beat_starts[3] + 0.05, 0.88)
    mix_at(sfx_bus, synth_sfx("collar_rattle"), beat_starts[3] + 0.25, 0.92)

    # B5: Hitstop -> PING da trava -> boing catapulta + triplo quique das anilhas -> MEGA POOF DE GIZ!
    mix_at(sfx_bus, synth_sfx("collar_ping"), beat_starts[4] + 0.18, 0.98)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[4] + 0.34, 0.86)
    mix_at(sfx_bus, synth_sfx("plate_crash"), beat_starts[4] + 0.45, 0.98)
    mix_at(sfx_bus, synth_sfx("chalk_poof"), beat_starts[4] + 1.50, 1.00)

    # B6: Fisheye lens zoom-in pop + risada saltitante da Camila!
    mix_at(sfx_bus, synth_sfx("whoosh_reveal"), max(0.5, beat_starts[5] - 0.06), 0.70)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[5] + 0.08, 0.82)

    master = bgm * duck_env + sfx_bus * 0.80 + voice_bus * 0.96
    pk = np.max(np.abs(master))
    if pk > 0:
        master = np.tanh((master / pk) * 1.12) * 0.86

    end_fade = min(len(master), int(0.25 * SR))
    master[-end_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, end_fade)) ** 2

    out_wav = AUDIO_DIR / "ep06_academia_mix.wav"
    wavfile.write(str(out_wav), SR, np.clip(master * 32767.0, -32767, 32767).astype(np.int16))

    tl_obj = {
        "episode": 6,
        "slug": "ep06-barra-academia",
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
    tl_js = AUDIO_DIR / "ep06_academia_timeline.js"
    with open(tl_js, "w", encoding="utf-8") as f:
        f.write("window.EP06_ACADEMIA_TIMELINE = " + json.dumps(tl_obj, ensure_ascii=False) + ";\n")

    print(f"Master pronto: {out_wav.name} ({total_dur}s) e {tl_js.name}")


if __name__ == "__main__":
    main()
