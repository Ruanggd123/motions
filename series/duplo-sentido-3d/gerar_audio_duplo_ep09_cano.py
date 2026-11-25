"""Gerador de Audio Master -- Duplo Sentido 3D (EP 09 Cartoon Meme: O Cano Estourado da Pia!)."""
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
GEN_DIR = AUDIO_DIR / "generated_ep09_cano"
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
        "id": "ep09_b1a_voce_socorro",
        "beat_idx": 0,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.08,
        "atempo": 1.1,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "01a_b1_voce_socorro.wav",
        "text": "SOCORRO, CAMILA! Tá vazando sem parar, eu tô apertando com tudo e tá espirrando na minha cara!",
        "speech_text": "Socorro, Camila! Tá vazando sem parar, eu tô apertando com tudo e tá espirrando na minha cara!...",
        "pre_gap": 0.05,
        "post_gap": 0.10,
    },
    {
        "id": "ep09_b1b_camila_nao_solta",
        "beat_idx": 0,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+8%",
        "pitch": "+3Hz",
        "atempo": 1.05,
        "file": GEN_DIR / "01b_b1_camila_nao_solta.wav",
        "text": "NÃO SOLTA AGORA! Se você tirar o dedo daí vai inundar a cozinha inteira!",
        "speech_text": "Não solta agora! Se você tirar o dedo daí, vai inundar a cozinha inteira!",
        "pre_gap": 0.05,
        "post_gap": 0.12,
    },
    {
        "id": "ep09_b2_camila_youtube",
        "beat_idx": 1,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+8%",
        "pitch": "+3Hz",
        "atempo": 1.06,
        "file": GEN_DIR / "02_b2_camila_youtube.wav",
        "text": "Cê jurou que aprendeu hidráulica no YouTube e agora tá tampando o cano com o dedo?!",
        "speech_text": "Você jurou que aprendeu hidráulica no YouTube e agora tá tampando o cano com o dedo?!",
        "pre_gap": 0.07,
        "post_gap": 0.12,
    },
    {
        "id": "ep09_b3_voce_confia",
        "beat_idx": 2,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.08,
        "atempo": 1.1,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "03_b3_voce_confia.wav",
        "text": "Confia no pai! É só dar meia volta na chave inglesa que eu domino essa pressão!",
        "speech_text": "Confia no pai! É só dar meia volta na chave inglesa que eu domino essa pressão!...",
        "pre_gap": 0.06,
        "post_gap": 0.12,
    },
    {
        "id": "ep09_b4_camila_solta",
        "beat_idx": 3,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-FranciscaNeural",
        "rate": "+8%",
        "pitch": "+4Hz",
        "atempo": 1.05,
        "file": GEN_DIR / "04_b4_camila_solta.wav",
        "text": "EITA, GÊNIO! Cê tá girando pro lado que SOLTA! PARA!",
        "speech_text": "Eita, gênio! Você tá girando pro lado que solta! Para!",
        "pre_gap": 0.06,
        "post_gap": 0.12,
    },
    {
        "id": "ep09_b5_voce_desentupiu",
        "beat_idx": 4,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.03,
        "atempo": 1.05,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "05_b5_voce_desentupiu.wav",
        "text": "Boa notícia, Camila... desentupiu a pia inteira!",
        "speech_text": "Boa notícia, Camila... desentupiu a pia inteira!...",
        "pre_gap": 1.35,
        "post_gap": 0.14,
    },
    {
        "id": "ep09_b6a_camila_centavos",
        "beat_idx": 5,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-FranciscaNeural",
        "rate": "+10%",
        "pitch": "+4Hz",
        "atempo": 1.06,
        "file": GEN_DIR / "06a_b6_camila_centavos.wav",
        "text": "Encanador de centavos!",
        "speech_text": "Encanador de centavos!",
        "pre_gap": 0.06,
        "post_gap": 0.08,
    },
    {
        "id": "ep09_b6b_voce_cta",
        "beat_idx": 5,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "vs_speed": 1.08,
        "atempo": 1.1,
        "edge_fallback": "pt-BR-AntonioNeural",
        "file": GEN_DIR / "06b_b6_voce_cta.wav",
        "text": "Se você riu ou pensou besteira no começo, comenta ENCANADOR RAIZ aí embaixo!",
        "speech_text": "Se você riu ou pensou besteira no começo, comenta encanador raiz aí embaixo!...",
        "pre_gap": 0.06,
        "post_gap": 1.90,
    },
]


def run_ff(args, label):
    res = subprocess.run([FFMPEG_EXE, "-hide_banner", "-loglevel", "error", *args], capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg [{label}]: {res.stderr[-400:]}")


def apply_fade(arr, fade_in=0.012, fade_out=0.032):
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
            print(f"  [Edge-TTS] {out_file.name} ({dlg['edge_voice']} rate={dlg.get('rate', '+8%')})...", flush=True)
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
                    "speed": float(dlg.get("vs_speed", 1.08)),
                    "preprocess_prompt": True,
                    "denoise": True,
                    "num_step": 12,
                    "guidance_scale": 2.0,
                    "seed": 1805 + attempt * 113,
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
        s1 = min(len(arr), int(nz[-1]) + int(0.220 * SR))
        arr = arr[s0:s1]

    tempo = max(0.85, min(1.30, float(atempo)))
    tmp_in = GEN_DIR / f"_in_{wav_path.stem}.wav"
    tmp_fast = GEN_DIR / f"_fast_{wav_path.stem}.wav"
    wavfile.write(str(tmp_in), SR, (np.clip(arr, -1.0, 1.0) * 32767.0).astype(np.int16))
    run_ff(["-y", "-i", str(tmp_in), "-filter:a", f"atempo={tempo:.2f}", str(tmp_fast)], f"Tempo {wav_path.name}")
    _, f_data = wavfile.read(str(tmp_fast))
    tmp_in.unlink(missing_ok=True)
    tmp_fast.unlink(missing_ok=True)
    arr = f_data.astype(np.float64) / 32768.0

    arr = apply_fade(arr, 0.010, 0.050)
    arr = np.pad(arr, (int(0.015 * SR), int(0.060 * SR)), mode="constant")
    b, a = signal.butter(2, [85.0 / NYQ, 8800.0 / NYQ], btype="band")
    arr = signal.filtfilt(b, a, arr)

    pk = np.max(np.abs(arr))
    if pk > 0:
        arr = (arr / pk) * 0.92

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


def synth_kitchen_bgm(total_sec):
    """Trilha brasileira leve e animada de comedia domestica."""
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 130.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)
    bass = [130.81, 164.81, 196.0, 164.81, 146.83, 174.61, 220.0, 196.0]
    marimba = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 659.25]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass[step % len(bass)]
        lt = np.arange(int(beat * 0.44 * SR)) / SR
        tone = (np.sin(2 * np.pi * freq * lt) * 0.56 + np.sin(3 * np.pi * freq * lt) * 0.12) * np.exp(-lt * 6.4) * 0.105
        mix_at(bgm, apply_fade(tone, 0.005, 0.025), cur, 1.0)
        if step % 2 == 1:
            mf = marimba[step % len(marimba)]
            mt = np.arange(int(0.11 * SR)) / SR
            pl = (np.sin(2 * np.pi * mf * mt) * 0.50 + np.sin(4 * np.pi * mf * mt) * 0.18) * np.exp(-mt * 16.0) * 0.055
            mix_at(bgm, apply_fade(pl, 0.003, 0.015), cur, 1.0)
        cur += beat
        step += 1

    bgm += np.sin(2 * np.pi * 65.41 * t) * 0.007
    return bgm


def synth_sfx(kind, seed_offset=0):
    """SFX hidraulicos & cartoon (ZERO latido!)."""
    if kind == "pipe_drip":
        # Pingos rapidos e esguicho de cano vazando
        lt = np.arange(int(0.55 * SR)) / SR
        out = np.zeros(len(lt))
        for dt0, f0 in [(0.02, 920.0), (0.18, 1080.0), (0.34, 980.0)]:
            mask = lt >= dt0
            dt = np.maximum(0.0, lt - dt0)
            freq = f0 + 480.0 * dt * 6.0
            out += np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-dt * 26.0) * mask * 0.30
        return apply_fade(out, 0.004, 0.03)
    if kind == "record_scratch":
        lt = np.arange(int(0.24 * SR)) / SR
        rng = np.random.default_rng(91 + seed_offset)
        f = 1650 - 1180 * (lt / 0.24) + 340 * np.sin(lt * 72.0)
        sc = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 8.5) * 0.30
        nz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [1800.0 / NYQ, 6500.0 / NYQ], btype="band")
        grit = signal.filtfilt(b, a, nz) * np.exp(-lt * 10.0) * 0.24
        return apply_fade(sc + grit, 0.003, 0.025)
    if kind == "boing":
        lt = np.arange(int(0.38 * SR)) / SR
        f = 210 + 290 * np.sin(lt * 34.0) * np.exp(-lt * 4.5) + 95 * lt
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 6.2) * 0.34, 0.004, 0.03)
    if kind == "wrench_creak":
        # Rangido metalico da chave inglesa girando
        lt = np.arange(int(0.42 * SR)) / SR
        f = 340 + 180 * np.sin(lt * 22.0) + 90 * lt
        tone = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.22 + np.sin(6 * np.pi * np.cumsum(f) / SR) * 0.08)
        return apply_fade(tone * np.sin(np.linspace(0, math.pi, len(lt))), 0.008, 0.04)
    if kind == "balloon_swell":
        # Borracha/PVC inchando sob pressao
        lt = np.arange(int(0.45 * SR)) / SR
        f = 180 + 420 * (lt / 0.45) ** 1.4 + 45 * np.sin(lt * 40.0)
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.28 * np.sin(np.linspace(0, math.pi, len(lt))) ** 0.7
        return apply_fade(tone, 0.006, 0.03)
    if kind == "cap_pop":
        # Tampao estourando e passando em fly-by Doppler na lente!
        lt = np.arange(int(0.62 * SR)) / SR
        rng = np.random.default_rng(77 + seed_offset)
        pop = np.sin(2 * np.pi * (190 * np.exp(-lt * 10.0) + 55) * lt) * np.exp(-lt * 12.0) * 0.55
        p = lt / 0.62
        doppler = np.sin(2 * np.pi * np.cumsum(420 + 1150 * np.sin(p * math.pi) ** 1.3) / SR) * np.sin(p * math.pi) * 0.26
        nz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [600.0 / NYQ, 4800.0 / NYQ], btype="band")
        whoosh = signal.filtfilt(b, a, nz) * (np.sin(p * math.pi) ** 1.2) * 0.40
        return apply_fade(pop + doppler + whoosh, 0.003, 0.04)
    if kind == "water_geyser":
        # Jato massivo de agua + bolhas estourando
        lt = np.arange(int(1.45 * SR)) / SR
        rng = np.random.default_rng(84 + seed_offset)
        nz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [420.0 / NYQ, 6200.0 / NYQ], btype="band")
        spray = signal.filtfilt(b, a, nz) * np.exp(-lt * 1.4) * 0.44
        sub = np.sin(2 * np.pi * (120 * np.exp(-lt * 6.0) + 48) * lt) * np.exp(-lt * 5.0) * 0.42
        return apply_fade(spray + sub, 0.005, 0.14)
    if kind == "plunger_suction":
        # PLOP! Ventosa do desentupidor grudando na cabeca do Voce!
        lt = np.arange(int(0.32 * SR)) / SR
        f = 140 + 480 * np.exp(-lt * 16.0) + 180 * np.sin(lt * 42.0) * np.exp(-lt * 8.0)
        plop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 11.0) * 0.48
        return apply_fade(plop, 0.002, 0.03)
    return np.zeros(100)


def main():
    print("[1/4] Sintetizando vozes Duplo Sentido 3D EP 09 (O Cano Estourado da Pia!)...")
    asyncio.run(synthesize_voices())

    print("[2/4] Montando timeline dinamica de alta retencao (8 falas / 6 beats)...")
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
    print(f"  Batidas EP09: {beat_starts} | TOTAL={total_dur}s")

    n = int(math.ceil(total_dur * SR))
    bgm = synth_kitchen_bgm(total_dur + 0.3)[:n]
    tail_fade = min(n, int(1.70 * SR))
    bgm[-tail_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, tail_fade)) ** 1.4

    voice_bus = np.zeros(n)
    sfx_bus = np.zeros(n)
    duck_env = np.ones(n)

    for d in loaded:
        mix_at(voice_bus, d["arr"], d["start"], 1.0)
        s_i = max(0, int((d["start"] - 0.05) * SR))
        e_i = min(n, int((d["end"] + 0.07) * SR))
        duck_env[s_i:e_i] = 0.40

    duck_win = int(0.13 * SR)
    duck_env = np.convolve(duck_env, np.ones(duck_win) / duck_win, mode="same")

    # SFX hidraulicos & cartoon coreografados (ZERO latido!)
    mix_at(sfx_bus, synth_sfx("pipe_drip", 1), 0.06, 0.85)
    mix_at(sfx_bus, synth_sfx("boing"), max(0.2, beat_starts[1] - 0.05), 0.88)
    mix_at(sfx_bus, synth_sfx("pipe_drip", 2), beat_starts[1] + 0.45, 0.72)
    mix_at(sfx_bus, synth_sfx("wrench_creak", 1), beat_starts[2] + 0.25, 0.85)
    mix_at(sfx_bus, synth_sfx("balloon_swell", 1), beat_starts[2] + 1.85, 0.80)
    mix_at(sfx_bus, synth_sfx("balloon_swell", 2), beat_starts[3] + 0.20, 0.90)
    # B5: hitstop -> tampao fly-by -> geiser -> desentupidor plop!
    mix_at(sfx_bus, synth_sfx("record_scratch", 1), beat_starts[4] + 0.04, 0.90)
    mix_at(sfx_bus, synth_sfx("cap_pop", 1), beat_starts[4] + 0.25, 0.96)
    mix_at(sfx_bus, synth_sfx("water_geyser", 1), beat_starts[4] + 0.42, 0.98)
    mix_at(sfx_bus, synth_sfx("plunger_suction", 1), beat_starts[4] + 1.90, 0.94)
    # B6: boing risada final
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[5] + 0.08, 0.82)

    master = bgm * duck_env + sfx_bus * 0.80 + voice_bus * 0.96
    pk = np.max(np.abs(master))
    if pk > 0:
        master = np.tanh((master / pk) * 1.14) * 0.87

    end_fade = min(len(master), int(0.25 * SR))
    master[-end_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, end_fade)) ** 2

    out_wav = AUDIO_DIR / "ep09_cano_mix.wav"
    wavfile.write(str(out_wav), SR, np.clip(master * 32767.0, -32767, 32767).astype(np.int16))

    tl_obj = {
        "episode": 9,
        "slug": "ep09-cano-cozinha",
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
    tl_js = AUDIO_DIR / "ep09_cano_timeline.js"
    with open(tl_js, "w", encoding="utf-8") as f:
        f.write("window.EP09_CANO_TIMELINE = " + json.dumps(tl_obj, ensure_ascii=False) + ";\n")

    print(f"Master pronto: {out_wav.name} ({total_dur}s) e {tl_js.name}")


if __name__ == "__main__":
    main()
