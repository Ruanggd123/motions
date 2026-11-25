"""Gerador de Audio Master -- Duplo Sentido 3D (EP 08: O Coco Duro da Praia!)."""
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
GEN_DIR = AUDIO_DIR / "generated_ep08_coco"
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
        "id": "ep08_b1a_camila_hook",
        "beat_idx": 0,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+8%",
        "pitch": "+3Hz",
        "atempo": 1.07,
        "file": GEN_DIR / "01a_camila_hook.wav",
        "text": "BATE COM FORÇA E NÃO PARA! Esse negócio é duro demais, tem que abrir logo!",
        "speech_text": "Bate com força e não para! Esse negócio é duro demais, tem que abrir logo!",
        "pre_gap": 0.04,
        "post_gap": 0.06,
    },
    {
        "id": "ep08_b1b_voce_panico",
        "beat_idx": 0,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.08,
        "atempo": 1.10,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "01b_voce_panico.wav",
        "text": "Calma, Camila! Eu tô suando inteiro aqui e esse troço não abre!",
        "speech_text": "Calma, Camila! Eu tô suando inteiro aqui e esse troço não abre!...",
        "pre_gap": 0.04,
        "post_gap": 0.12,
    },
    {
        "id": "ep08_b2_camila_reveal",
        "beat_idx": 1,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+8%",
        "pitch": "+3Hz",
        "atempo": 1.07,
        "file": GEN_DIR / "02_camila_reveal.wav",
        "text": "Cê tá tentando furar um coco verde gigante com canudinho de plástico?!",
        "speech_text": "Cê tá tentando furar um coco verde gigante com canudinho de plástico?!",
        "pre_gap": 0.08,
        "post_gap": 0.10,
    },
    {
        "id": "ep08_b3_voce_ego",
        "beat_idx": 2,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.06,
        "atempo": 1.09,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "03_voce_ego.wav",
        "text": "Respeita o caiçara! Um toque de mestre e eu racho essa casca no meio!",
        "speech_text": "Respeita o caiçara! Um toque de mestre e eu racho essa casca no meio!...",
        "pre_gap": 0.08,
        "post_gap": 0.10,
    },
    {
        "id": "ep08_b4_camila_alerta",
        "beat_idx": 3,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+8%",
        "pitch": "+3Hz",
        "atempo": 1.06,
        "file": GEN_DIR / "04_camila_alerta.wav",
        "text": "EITA, PARA! O coco tá escorregando do banco! NÃO BATE!",
        "speech_text": "Eita, para tudo! Esse côco tá escorregando do banco! Não bate!",
        "pre_gap": 0.06,
        "post_gap": 0.10,
    },
    {
        "id": "ep08_b5_voce_splash",
        "beat_idx": 4,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.05,
        "atempo": 1.08,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "05_voce_splash.wav",
        "text": "Olha só... pelo menos refrescou o calor da praia!",
        "speech_text": "Olha só... pelo menos refrescou o calor da praia!...",
        "pre_gap": 0.42,
        "post_gap": 0.14,
    },
    {
        "id": "ep08_b6a_camila_rei",
        "beat_idx": 5,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+8%",
        "pitch": "+3Hz",
        "atempo": 1.06,
        "file": GEN_DIR / "06a_camila_rei.wav",
        "text": "Rei da praia!",
        "speech_text": "Rei da praia!",
        "pre_gap": 0.08,
        "post_gap": 0.08,
    },
    {
        "id": "ep08_b6b_voce_roast",
        "beat_idx": 5,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.07,
        "atempo": 1.09,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "06b_voce_roast.wav",
        "text": "Se você pensou besteira nos dois primeiros segundos, comenta COCO DURO ou dá nota pro meu chapéu!",
        "speech_text": "Se você pensou besteira nos dois primeiros segundos, comenta coco duro ou dá nota pro meu chapéu!...",
        "pre_gap": 0.06,
        "post_gap": 1.9,
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


async def synth_edge(text, voice, out_file, rate="+8%", pitch="+3Hz"):
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
            ok = await synth_edge(dlg["speech_text"], dlg["edge_voice"], out_file, dlg.get("rate", "+8%"), dlg.get("pitch", "+3Hz"))
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
                    "seed": 1805 + idx * 47 + attempt * 113,
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
            ok = await synth_edge(dlg["speech_text"], fb, out_file, "+8%", "+0Hz")
            if not ok:
                raise RuntimeError(f"Fallback Edge-TTS falhou para {out_file.name}")


def load_voice(wav_path, atempo=1.08):
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


def synth_praia_bgm(total_sec):
    """Trilha tropical animada (marimba/ukulele cartoon de praia ensolarada)."""
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 134.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)
    bass = [130.81, 164.81, 196.0, 164.81, 146.83, 174.61, 220.0, 196.0]
    marimba = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass[step % len(bass)]
        lt = np.arange(int(beat * 0.42 * SR)) / SR
        tone = (np.sin(2 * np.pi * freq * lt) * 0.56 + np.sin(3 * np.pi * freq * lt) * 0.14) * np.exp(-lt * 6.8) * 0.11
        mix_at(bgm, apply_fade(tone, 0.004, 0.02), cur, 1.0)
        if step % 2 == 1:
            mf = marimba[step % len(marimba)]
            mt = np.arange(int(0.11 * SR)) / SR
            pl = (np.sin(2 * np.pi * mf * mt) * 0.55 + np.sin(4 * np.pi * mf * mt) * 0.14) * np.exp(-mt * 19.0) * 0.055
            mix_at(bgm, apply_fade(pl, 0.003, 0.015), cur, 1.0)
        cur += beat
        step += 1

    # Brisa suave do mar ao fundo
    rng = np.random.default_rng(88)
    b, a = signal.butter(2, [180.0 / NYQ, 1200.0 / NYQ], btype="band")
    surf = signal.filtfilt(b, a, rng.normal(0, 1, n)) * (0.012 + 0.008 * np.sin(2 * np.pi * 0.22 * t))
    return bgm + surf


def synth_sfx(kind):
    """SFX cartoon + praia/coco (record_scratch, boing, wood_bonk, crab_snap, whoosh_flyby, coconut_crack, water_splash — ZERO latido!)."""
    if kind == "pop":
        lt = np.arange(int(0.16 * SR)) / SR
        f = 380 + 680 * np.exp(-lt * 20)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 16) * 0.36, 0.002, 0.02)

    if kind == "record_scratch":
        lt = np.arange(int(0.30 * SR)) / SR
        rng = np.random.default_rng(71)
        f = 520 + 1350 * np.sin(lt * 34.0) * np.exp(-lt * 3.0)
        sc = np.sin(2 * np.pi * np.cumsum(np.maximum(120.0, f)) / SR) * 0.38
        b, a = signal.butter(2, [900.0 / NYQ, 4800.0 / NYQ], btype="band")
        grit = signal.filtfilt(b, a, rng.normal(0, 1, len(lt))) * 0.20
        env = np.sin(np.linspace(0.0, math.pi, len(lt))) ** 0.7
        return apply_fade((sc + grit) * env, 0.004, 0.025)

    if kind == "boing":
        lt = np.arange(int(0.36 * SR)) / SR
        f = 195 + 260 * np.sin(lt * 30.0) * np.exp(-lt * 4.6)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 6.5) * 0.36, 0.004, 0.02)

    if kind == "wood_bonk":
        lt = np.arange(int(0.28 * SR)) / SR
        f = 280 + 180 * np.exp(-lt * 35.0)
        bonk = (
            np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.62
            + np.sin(2 * np.pi * 620.0 * lt) * 0.28
        ) * np.exp(-lt * 14.0)
        return apply_fade(bonk * 0.72, 0.002, 0.03)

    if kind == "crab_snap":
        lt = np.arange(int(0.45 * SR)) / SR
        out = np.zeros_like(lt)
        for off in (0.0, 0.14, 0.28):
            idx0 = int(off * SR)
            sub_len = min(len(lt) - idx0, int(0.08 * SR))
            st = np.arange(sub_len) / SR
            clack = (np.sin(2 * np.pi * 1680 * st) * 0.45 + np.sin(2 * np.pi * 2950 * st) * 0.32) * np.exp(-st * 45.0)
            out[idx0 : idx0 + sub_len] += clack
        return apply_fade(out * 0.65, 0.002, 0.02)

    if kind == "whoosh_flyby":
        lt = np.arange(int(0.42 * SR)) / SR
        rng = np.random.default_rng(81)
        b, a = signal.butter(2, [300.0 / NYQ, 3800.0 / NYQ], btype="band")
        sw = signal.filtfilt(b, a, rng.normal(0, 1, len(lt)))
        env = np.sin(np.linspace(0.0, math.pi, len(lt))) ** 1.4
        doppler = np.sin(2 * np.pi * np.cumsum(720 - 440 * np.linspace(0, 1, len(lt))) / SR) * 0.18
        return apply_fade((sw * 0.32 + doppler) * env, 0.008, 0.04)

    if kind == "coconut_crack":
        lt = np.arange(int(0.35 * SR)) / SR
        rng = np.random.default_rng(82)
        b, a = signal.butter(2, [600.0 / NYQ, 5500.0 / NYQ], btype="band")
        snap = signal.filtfilt(b, a, rng.normal(0, 1, len(lt))) * np.exp(-lt * 26.0) * 0.55
        hollow = np.sin(2 * np.pi * 420.0 * lt) * np.exp(-lt * 18.0) * 0.48
        return apply_fade((snap + hollow) * 0.85, 0.001, 0.04)

    if kind == "water_splash":
        lt = np.arange(int(0.95 * SR)) / SR
        rng = np.random.default_rng(83)
        raw_n = rng.normal(0, 1, len(lt))
        b_lo, a_lo = signal.butter(2, [220.0 / NYQ, 2200.0 / NYQ], btype="band")
        b_hi, a_hi = signal.butter(2, [1800.0 / NYQ, 6800.0 / NYQ], btype="band")
        body = signal.filtfilt(b_lo, a_lo, raw_n) * (1.0 - np.exp(-lt * 40.0)) * np.exp(-lt * 4.2)
        spray = signal.filtfilt(b_hi, a_hi, raw_n) * (1.0 - np.exp(-lt * 60.0)) * np.exp(-lt * 5.8)
        return apply_fade((body * 0.65 + spray * 0.50) * 0.88, 0.003, 0.12)

    return np.zeros(100)


def main():
    print("[1/4] Sintetizando vozes Duplo Sentido 3D EP 08 (O Coco Duro da Praia!)...")
    asyncio.run(synthesize_voices())

    print("[2/4] Montando timeline e batidas continuas...")
    loaded = []
    beat_starts = [0.0, None, None, None, None, None]
    cursor = 0.0
    for dlg in DIALOGUES_DEF:
        arr, dur, lip = load_voice(dlg["file"], atempo=dlg.get("atempo", 1.08))
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
    print(f"  Batidas EP08: {beat_starts} | TOTAL={total_dur}s")

    n = int(math.ceil(total_dur * SR))
    bgm = synth_praia_bgm(total_dur + 0.3)[:n]
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

    # B1: Pop fisheye na Camila + pop no Voce
    mix_at(sfx_bus, synth_sfx("pop"), 0.04, 0.80)
    b1b_start = loaded[1]["start"] if len(loaded) > 1 else 3.2
    mix_at(sfx_bus, synth_sfx("pop"), max(0.4, b1b_start - 0.05), 0.90)

    # B2: Record scratch + boing revelando canudinho no coco gigante
    mix_at(sfx_bus, synth_sfx("record_scratch"), max(0.3, beat_starts[1] - 0.14), 0.86)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[1] + 0.06, 0.84)

    # B3: Estufou peito + caranguejo batendo pincas no balde!
    mix_at(sfx_bus, synth_sfx("pop"), beat_starts[2] + 0.12, 0.78)
    mix_at(sfx_bus, synth_sfx("crab_snap"), beat_starts[2] + 1.15, 0.85)

    # B4: Alerta do coco escorregando do banco
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[3] + 0.06, 0.78)

    # B5: Marreta erra (wood_bonk) -> coco flyby (whoosh_flyby) -> racha (coconut_crack) -> splash (water_splash)!
    mix_at(sfx_bus, synth_sfx("wood_bonk"), beat_starts[4] + 0.12, 0.92)
    mix_at(sfx_bus, synth_sfx("whoosh_flyby"), beat_starts[4] + 0.24, 0.90)
    mix_at(sfx_bus, synth_sfx("coconut_crack"), beat_starts[4] + 0.46, 0.95)
    mix_at(sfx_bus, synth_sfx("water_splash"), beat_starts[4] + 0.50, 0.98)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[4] + 0.88, 0.76)

    # B6: Fisheye roast final
    mix_at(sfx_bus, synth_sfx("pop"), beat_starts[5] + 0.06, 0.82)

    master = bgm * duck_env + sfx_bus * 0.80 + voice_bus * 0.96
    pk = np.max(np.abs(master))
    if pk > 0:
        master = np.tanh((master / pk) * 1.12) * 0.86

    end_fade = min(len(master), int(0.25 * SR))
    master[-end_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, end_fade)) ** 2

    out_wav = AUDIO_DIR / "ep08_coco_mix.wav"
    wavfile.write(str(out_wav), SR, np.clip(master * 32767.0, -32767, 32767).astype(np.int16))

    tl_obj = {
        "episode": 8,
        "slug": "ep08-coco-praia",
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
    tl_js = AUDIO_DIR / "ep08_coco_timeline.js"
    with open(tl_js, "w", encoding="utf-8") as f:
        f.write("window.EP08_COCO_TIMELINE = " + json.dumps(tl_obj, ensure_ascii=False) + ";\n")

    print(f"Master pronto: {out_wav.name} ({total_dur}s) e {tl_js.name}")


if __name__ == "__main__":
    main()
