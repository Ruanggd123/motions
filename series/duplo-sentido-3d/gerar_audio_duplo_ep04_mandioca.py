"""Gerador de Audio Master -- Duplo Sentido 3D (EP 04: A Mandioca Grossa da Feira)."""
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
GEN_DIR = AUDIO_DIR / "generated_ep04_mandioca"
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
        "id": "ep04_b1_isca",
        "beat_idx": 0,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "01_isca_mandioca.wav",
        "text": "A vizinha me chamou no canto hoje... falando que precisava de ajuda pra descascar uma MANDIOCA GROSSA demais!",
        "speech_text": "A vizinha me chamou no canto hoje... falando que precisava de ajuda pra descascar uma mandioca grossa demais!...",
        "pre_gap": 0.08,
        "post_gap": 0.16,
    },
    {
        "id": "ep04_b2_camila_feira",
        "beat_idx": 1,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+6%",
        "pitch": "+2Hz",
        "file": GEN_DIR / "02_camila_tamanho.wav",
        "text": "Olha o tamanho dessa mandioca que eu achei na feira! Não cabe nem na minha sacola!",
        "speech_text": "Olha o tamanho dessa mandioca que eu achei na feira! Não cabe nem na minha sacola!",
        "pre_gap": 0.12,
        "post_gap": 0.14,
    },
    {
        "id": "ep04_b3_voce_dura",
        "beat_idx": 2,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "03_voce_dura.wav",
        "text": "Caramba, Camila! Tô pegando firme com as duas mãos aqui... mas tá muito dura e pesada!",
        "speech_text": "Caramba, Camila! Tô pegando firme com as duas mãos aqui... mas tá muito dura e pesada!...",
        "pre_gap": 0.10,
        "post_gap": 0.14,
    },
    {
        "id": "ep04_b4_camila_derrete",
        "beat_idx": 3,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+5%",
        "pitch": "+2Hz",
        "file": GEN_DIR / "04_camila_derrete.wav",
        "text": "Calma! É só colocar na água quente e deixar cozinhar bem... que ela derrete na boca!",
        "speech_text": "Calma! É só colocar na água quente e deixar cozinhar bem... que ela derrete na boca!",
        "pre_gap": 0.12,
        "post_gap": 0.14,
    },
    {
        "id": "ep04_b5_voce_balanca",
        "beat_idx": 4,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "05_voce_balanca.wav",
        "text": "Beleza, deixa eu pesar ela aqui antes de levar... Eita! Tá pesada demais, quebrou a balança da feira!",
        "speech_text": "Beleza, deixa eu pesar ela aqui antes de levar... Eita! Tá pesada demais, quebrou a balança da feira!...",
        "pre_gap": 0.10,
        "post_gap": 0.14,
    },
    {
        "id": "ep04_b6_cta",
        "beat_idx": 5,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "06_voce_cta.wav",
        "text": "Cinco quilos de mandioca no chão! Comenta aí: você prefere mandioca cozida ou frita com manteiga?",
        "speech_text": "Cinco quilos de mandioca no chão! Agora comenta aí: você prefere mandioca cozida ou frita com manteiga?...",
        "pre_gap": 0.12,
        "post_gap": 2.20,
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
                    comm = edge_tts.Communicate(dlg["speech_text"], edge_v, rate=dlg.get("rate", "+5%"), pitch=dlg.get("pitch", "+1Hz"))
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
                "speed": 1.04,
                "preprocess_prompt": True,
                "denoise": True,
                "num_step": 12,
                "guidance_scale": 2.0,
                "seed": 1410 + idx * 37 + attempt * 103,
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
            if ratio < best_tail:
                best_tail = ratio
                best_bytes = raw
            if ok:
                break
        if best_bytes is not None:
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

    env = np.abs(arr)
    win = int(0.025 * SR)
    sm = np.convolve(env, np.ones(win) / win, mode="same")
    nz = np.where(sm > 0.0014)[0]
    if len(nz) > 0:
        s0 = max(0, int(nz[0]) - int(0.040 * SR))
        s1 = min(len(arr), int(nz[-1]) + int(0.240 * SR))
        arr = arr[s0:s1]

    tmp_in = GEN_DIR / f"_in_{wav_path.stem}.wav"
    tmp_fast = GEN_DIR / f"_fast_{wav_path.stem}.wav"
    wavfile.write(str(tmp_in), SR, (np.clip(arr, -1.0, 1.0) * 32767.0).astype(np.int16))
    run_ff(["-y", "-i", str(tmp_in), "-filter:a", "atempo=1.06", str(tmp_fast)], f"Tempo {wav_path.name}")
    _, f_data = wavfile.read(str(tmp_fast))
    tmp_in.unlink(missing_ok=True)
    tmp_fast.unlink(missing_ok=True)
    arr = f_data.astype(np.float64) / 32768.0

    arr = apply_fade(arr, 0.012, 0.055)
    arr = np.pad(arr, (int(0.02 * SR), int(0.08 * SR)), mode="constant")
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


def synth_feira_bgm(total_sec):
    """Trilha comica alegre de feira brasileira (baixo saltitante + cavaquinho/marimba)."""
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 134.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)

    bass = [220.0, 261.63, 293.66, 329.63, 293.66, 261.63, 220.0, 164.81]
    pluck = [880.0, 987.77, 1174.66, 1318.51, 1174.66, 987.77]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass[step % len(bass)]
        lt = np.arange(int(beat * 0.42 * SR)) / SR
        tone = (np.sin(2 * np.pi * freq * lt) * 0.50 + np.sin(4 * np.pi * freq * lt) * 0.15) * np.exp(-lt * 7.0) * 0.12
        mix_at(bgm, apply_fade(tone, 0.005, 0.02), cur, 1.0)
        if step % 2 == 1:
            mf = pluck[step % len(pluck)]
            mt = np.arange(int(0.11 * SR)) / SR
            pl = (np.sin(2 * np.pi * mf * mt) * 0.56 + np.sin(2 * np.pi * mf * 2 * mt) * 0.18) * np.exp(-mt * 17) * 0.06
            mix_at(bgm, apply_fade(pl, 0.003, 0.015), cur, 1.0)
        cur += beat
        step += 1

    bgm += np.sin(2 * np.pi * 73.4 * t) * 0.010
    return bgm


def synth_sfx(kind):
    if kind == "boing":
        lt = np.arange(int(0.32 * SR)) / SR
        f = 220 + 230 * np.sin(lt * 28.0) * np.exp(-lt * 5.0)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 7.2) * 0.28, 0.004, 0.02)
    if kind == "thud_scale":
        lt = np.arange(int(0.45 * SR)) / SR
        thud = np.sin(2 * np.pi * (120 * np.exp(-lt * 10) + 45) * lt) * np.exp(-lt * 11) * 0.45
        clank = (np.sin(2 * np.pi * 880 * lt) + 0.5 * np.sin(2 * np.pi * 1340 * lt)) * np.exp(-lt * 9.5) * 0.24
        return apply_fade(thud + clank, 0.002, 0.04)
    if kind == "sizzle":
        lt = np.arange(int(0.55 * SR)) / SR
        rng = np.random.default_rng(42)
        nz = signal.lfilter([0.3, -0.3], [1.0, -0.6], rng.normal(0, 1, len(lt)))
        env = np.sin(np.linspace(0, math.pi, len(lt))) ** 0.7
        return apply_fade(nz * env * 0.16, 0.02, 0.08)
    if kind == "pop":
        lt = np.arange(int(0.16 * SR)) / SR
        f = 420 + 520 * np.exp(-lt * 22)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 18) * 0.30, 0.002, 0.02)
    return np.zeros(100)


def main():
    print("[1/4] Sintetizando vozes Duplo Sentido 3D EP 04 (A Mandioca Grossa da Feira)...")
    asyncio.run(synthesize_voices())

    print("[2/4] Montando timeline e batidas continuas...")
    loaded = []
    beat_starts = [0.0, None, None, None, None, None]
    cursor = 0.0
    for dlg in DIALOGUES_DEF:
        arr, dur, lip = load_voice(dlg["file"])
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
    print(f"  Batidas EP04: {beat_starts} | TOTAL={total_dur}s")

    n = int(math.ceil(total_dur * SR))
    bgm = synth_feira_bgm(total_dur + 0.3)[:n]
    tail_fade = min(n, int(1.85 * SR))
    bgm[-tail_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, tail_fade)) ** 1.4

    voice_bus = np.zeros(n)
    sfx_bus = np.zeros(n)
    duck_env = np.ones(n)

    for d in loaded:
        mix_at(voice_bus, d["arr"], d["start"], 1.0)
        s_i = max(0, int((d["start"] - 0.06) * SR))
        e_i = min(n, int((d["end"] + 0.08) * SR))
        duck_env[s_i:e_i] = 0.44

    duck_win = int(0.14 * SR)
    duck_env = np.convolve(duck_env, np.ones(duck_win) / duck_win, mode="same")

    mix_at(sfx_bus, synth_sfx("pop"), 0.14, 0.80)
    mix_at(sfx_bus, synth_sfx("boing"), max(0.2, beat_starts[1] - 0.05), 0.90)
    mix_at(sfx_bus, synth_sfx("pop"), beat_starts[2] + 0.30, 0.72)
    mix_at(sfx_bus, synth_sfx("sizzle"), beat_starts[3] + 0.45, 0.82)
    mix_at(sfx_bus, synth_sfx("thud_scale"), beat_starts[4] + 1.35, 0.96)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[4] + 2.15, 0.72)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[5] + 0.08, 0.78)

    master = bgm * duck_env + sfx_bus * 0.74 + voice_bus * 0.95
    pk = np.max(np.abs(master))
    if pk > 0:
        master = np.tanh((master / pk) * 1.12) * 0.86

    end_fade = min(len(master), int(0.25 * SR))
    master[-end_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, end_fade)) ** 2

    out_wav = AUDIO_DIR / "ep04_mandioca_mix.wav"
    wavfile.write(str(out_wav), SR, np.clip(master * 32767.0, -32767, 32767).astype(np.int16))

    tl_obj = {
        "episode": 4,
        "slug": "ep04-mandioca-feira",
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
    tl_js = AUDIO_DIR / "ep04_mandioca_timeline.js"
    with open(tl_js, "w", encoding="utf-8") as f:
        f.write("window.EP04_MANDIOCA_TIMELINE = " + json.dumps(tl_obj, ensure_ascii=False) + ";\n")

    print(f"Master pronto: {out_wav.name} ({total_dur}s) e {tl_js.name}")


if __name__ == "__main__":
    main()
