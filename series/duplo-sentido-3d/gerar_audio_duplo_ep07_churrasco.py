"""Gerador de Audio Master -- Duplo Sentido 3D (EP 07 v3 Cartoon Meme Overhaul: A Linguica do Churrasco!)."""
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
GEN_DIR = AUDIO_DIR / "generated_ep07_churrasco"
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

# Roteiro v3 100% reescrito: In Media Res 0.0s, comedia brasileira natural, zero cliche repetitivo!
DIALOGUES_DEF = [
    {
        "id": "ep07_b1_voce_desespero",
        "beat_idx": 0,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "edge_fallback": "pt-BR-AntonioNeural",
        "atempo": 1.10,
        "vs_speed": 1.09,
        "file": GEN_DIR / "01_b1_desespero.wav",
        "text": "NÃO DÁ, CAMILA! Tá muito quente, tá pingando na minha mão e não entra de jeito nenhum!",
        "speech_text": "Não dá, Camila! Tá muito quente, tá pingando na minha mão e não entra de jeito nenhum!...",
        "pre_gap": 0.05,
        "post_gap": 0.12,
    },
    {
        "id": "ep07_b2_camila_dobrar",
        "beat_idx": 1,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+9%",
        "pitch": "+3Hz",
        "atempo": 1.06,
        "file": GEN_DIR / "02_b2_camila_dobrar.wav",
        "text": "Para de show! É só dobrar a ponta que essa linguiça gigante cabe na grelha!",
        "speech_text": "Para de show! É só dobrar a ponta que essa linguiça gigante cabe na grelha!",
        "pre_gap": 0.07,
        "post_gap": 0.12,
    },
    {
        "id": "ep07_b3_voce_mestre",
        "beat_idx": 2,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "edge_fallback": "pt-BR-AntonioNeural",
        "atempo": 1.10,
        "vs_speed": 1.08,
        "file": GEN_DIR / "03_b3_mestre_churrasco.wav",
        "text": "Deixa com o mestre do churrasco! Olha a ginga do pulso... nunca perdi uma carne na minha mão!",
        "speech_text": "Deixa com o mestre do churrasco! Olha a ginga do pulso, nunca perdi uma carne na minha mão!...",
        "pre_gap": 0.06,
        "post_gap": 0.12,
    },
    {
        "id": "ep07_b4_camila_segura",
        "beat_idx": 3,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+10%",
        "pitch": "+5Hz",
        "atempo": 1.06,
        "file": GEN_DIR / "04_b4_camila_segura.wav",
        "text": "EI, MESTRE! Olha a ponta do espeto, ela tá escorregando! SEGURA!",
        "speech_text": "Ei, mestre! Olha a ponta do espeto, ela tá escorregando! Segura!",
        "pre_gap": 0.06,
        "post_gap": 0.12,
    },
    {
        "id": "ep07_b5_voce_tecnica",
        "beat_idx": 4,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "edge_fallback": "pt-BR-AntonioNeural",
        "atempo": 1.04,
        "vs_speed": 1.02,
        "seed": 1788,
        "file": GEN_DIR / "05_b5_tecnica_secreta.wav",
        "text": "Olha só... técnica secreta! Já cai empanada no ar direto na farofa!",
        "speech_text": "Olha só, técnica secreta! Já cai empanada no ar, direto na farofa!...",
        "pre_gap": 1.48,
        "post_gap": 0.14,
    },
    {
        "id": "ep07_b6a_camila_risada",
        "beat_idx": 5,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+12%",
        "pitch": "+5Hz",
        "atempo": 1.06,
        "file": GEN_DIR / "06a_b6_camila_desastre.wav",
        "text": "Mestre do desastre!",
        "speech_text": "Mestre do desastre!",
        "pre_gap": 0.06,
        "post_gap": 0.08,
    },
    {
        "id": "ep07_b6b_voce_roast_cta",
        "beat_idx": 5,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "edge_fallback": "pt-BR-AntonioNeural",
        "atempo": 1.10,
        "vs_speed": 1.08,
        "file": GEN_DIR / "06b_b6_churrasqueiro_raiz.wav",
        "text": "Se você riu da minha cara ou pensou besteira no começo, comenta CHURRASQUEIRO RAIZ aí embaixo!",
        "speech_text": "Se você riu da minha cara ou pensou besteira no começo, comenta churrasqueiro raiz aí embaixo!...",
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
            print(f"  [Edge-TTS] {out_file.name} ({dlg['edge_voice']} rate={dlg.get('rate', '+9%')})...", flush=True)
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
                    "speed": float(dlg.get("vs_speed", 1.08)),
                    "preprocess_prompt": True,
                    "denoise": True,
                    "num_step": 12,
                    "guidance_scale": 2.0,
                    "seed": int(dlg.get("seed", 1910 + idx * 53)) + attempt * 127,
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


def synth_churrasco_bgm(total_sec):
    """Trilha brasileira alegre de churrasco de domingo (pagodinho/cavaquinho animado + surdo quente)."""
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 134.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)
    bass = [130.81, 164.81, 196.0, 164.81, 146.83, 174.61, 220.0, 196.0]
    cavaq = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 880.0, 659.25]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass[step % len(bass)]
        lt = np.arange(int(beat * 0.45 * SR)) / SR
        tone = (np.sin(2 * np.pi * freq * lt) * 0.56 + np.sin(3 * np.pi * freq * lt) * 0.14) * np.exp(-lt * 6.4) * 0.115
        mix_at(bgm, apply_fade(tone, 0.005, 0.025), cur, 1.0)
        if step % 2 == 1:
            mf = cavaq[step % len(cavaq)]
            mt = np.arange(int(0.105 * SR)) / SR
            pl = (np.sin(2 * np.pi * mf * mt) * 0.52 + np.sin(4 * np.pi * mf * mt) * 0.22) * np.exp(-mt * 16.5) * 0.060
            mix_at(bgm, apply_fade(pl, 0.003, 0.015), cur, 1.0)
        cur += beat
        step += 1

    bgm += np.sin(2 * np.pi * 65.41 * t) * 0.008
    return bgm


def synth_sfx(kind, seed_offset=0):
    """SFX cartoon de alta energia tematicos de churrasco/comedia (ZERO latido!)."""
    if kind == "vine_pop":
        # Impacto cartoon estilo meme fisheye no frame 0.0s!
        lt = np.arange(int(0.32 * SR)) / SR
        sub = np.sin(2 * np.pi * (118 * np.exp(-lt * 5.0) + 46) * lt) * np.exp(-lt * 7.5) * 0.46
        pop = np.sin(2 * np.pi * np.cumsum(460 + 620 * np.exp(-lt * 26)) / SR) * np.exp(-lt * 22) * 0.30
        return apply_fade(sub + pop, 0.002, 0.03)
    if kind == "boing":
        # Cartoon BOING elastico exagerado!
        lt = np.arange(int(0.38 * SR)) / SR
        f = 210 + 290 * np.sin(lt * 34.0) * np.exp(-lt * 4.5) + 95 * lt
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 6.2) * 0.34, 0.004, 0.03)
    if kind == "rubber_stretch":
        # Som elastico de borracha esticando (B2/B3/B4 squash & stretch!)
        lt = np.arange(int(0.36 * SR)) / SR
        f = 240 + 460 * (lt / 0.36) ** 1.3 + 55 * np.sin(lt * 48.0)
        tone = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.24 + np.sin(4 * np.pi * np.cumsum(f) / SR) * 0.09)
        env = np.sin(np.linspace(0, math.pi, len(lt))) ** 0.7
        return apply_fade(tone * env, 0.006, 0.03)
    if kind == "record_scratch":
        # Record scratch comico no hitstop de B5!
        lt = np.arange(int(0.24 * SR)) / SR
        rng = np.random.default_rng(91 + seed_offset)
        f = 1650 - 1180 * (lt / 0.24) + 340 * np.sin(lt * 72.0)
        sc = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 8.5) * 0.30
        nz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [1800.0 / NYQ, 6500.0 / NYQ], btype="band")
        grit = signal.filtfilt(b, a, nz) * np.exp(-lt * 10.0) * 0.24
        return apply_fade(sc + grit, 0.003, 0.025)
    if kind == "sizzle":
        # Chiado vivido de churrasqueira + estalinhos crocantes de gordura na brasa!
        lt = np.arange(int(1.15 * SR)) / SR
        rng = np.random.default_rng(77 + seed_offset)
        nz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [2200.0 / NYQ, 9200.0 / NYQ], btype="band")
        sz = signal.filtfilt(b, a, nz)
        env = np.sin(np.linspace(0, math.pi, len(lt))) ** 0.65 * (0.72 + 0.28 * np.sin(lt * 29.0))
        crackle = np.zeros(len(lt))
        for _ in range(20):
            pos = int(rng.uniform(0.05, 1.06) * SR)
            plen = int(0.012 * SR)
            if pos + plen < len(crackle):
                pt = np.arange(plen) / SR
                pf = rng.uniform(3200.0, 6900.0)
                crackle[pos : pos + plen] += np.sin(2 * np.pi * pf * pt) * np.exp(-pt * 340.0) * rng.uniform(0.18, 0.44)
        return apply_fade(sz * env * 0.25 + crackle * 0.56, 0.02, 0.10)
    if kind == "metallic_ping":
        # Aviso metalico nervoso da linguica gigante deslizando na ponta de inox!
        lt = np.arange(int(0.46 * SR)) / SR
        rng = np.random.default_rng(83 + seed_offset)
        f1 = 820 + 520 * lt + 95 * np.sin(lt * 42.0)
        f2 = 1640 + 780 * lt
        slide = (np.sin(2 * np.pi * np.cumsum(f1) / SR) * 0.22 + np.sin(2 * np.pi * np.cumsum(f2) / SR) * 0.13) * np.exp(-lt * 4.5)
        scrape_nz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [3000.0 / NYQ, 7600.0 / NYQ], btype="band")
        scrape = signal.filtfilt(b, a, scrape_nz) * np.sin(np.linspace(0, math.pi, len(lt))) * 0.13
        return apply_fade(slide + scrape, 0.006, 0.04)
    if kind == "whoosh_flyby":
        # FWOOOOSH Doppler absurdo da linguica gigante passando colada na lente da camera em B5a!
        lt = np.arange(int(0.72 * SR)) / SR
        rng = np.random.default_rng(88 + seed_offset)
        p = lt / 0.72
        # Apito cartoon subindo rapido na aproximacao e caindo no afastamento (efeito Doppler!)
        doppler_f = 420 + 1320 * np.sin(p * math.pi) ** 1.4 + 90 * np.sin(lt * 48.0)
        whistle = np.sin(2 * np.pi * np.cumsum(doppler_f) / SR) * (np.sin(p * math.pi) ** 0.7) * 0.30
        wnz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [500.0 / NYQ, 4400.0 / NYQ], btype="band")
        whoosh = signal.filtfilt(b, a, wnz) * (np.sin(p * math.pi) ** 1.2) * 0.48
        return apply_fade(whistle + whoosh, 0.006, 0.04)
    if kind == "farofa_nuke":
        # EXPLOSAO COGUMELO DE FAROFA + tigela vermelha girando no ar + quiques comicos!
        lt = np.arange(int(1.35 * SR)) / SR
        rng = np.random.default_rng(79 + seed_offset)
        # Sub-thump cartoon gigante (POOF-KABOOM!)
        boom = np.sin(2 * np.pi * (145 * np.exp(-lt * 8.0) + 48) * lt) * np.exp(-lt * 6.0) * 0.58
        # Nuvem massiva de farofa explodindo
        nz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [380.0 / NYQ, 5400.0 / NYQ], btype="band")
        poof = signal.filtfilt(b, a, nz) * np.exp(-lt * 3.6) * 0.48
        # Boing elastico da tigela lancada girando pro alto + batidinhas na mesa
        spin_boing = np.sin(2 * np.pi * np.cumsum(310 + 380 * np.sin(lt * 26.0) * np.exp(-lt * 3.8)) / SR) * np.exp(-lt * 5.2) * 0.24
        clatter = np.zeros(len(lt))
        for delay, freq, amp in [(0.42, 320.0, 0.26), (0.64, 370.0, 0.19), (0.82, 410.0, 0.12), (0.96, 445.0, 0.07)]:
            dt_w = np.maximum(0.0, lt - delay)
            mask = lt >= delay
            clatter += (np.sin(2 * np.pi * freq * dt_w) + 0.45 * np.sin(2 * np.pi * freq * 1.58 * dt_w)) * np.exp(-dt_w * 24.0) * mask * amp
        return apply_fade(boom + poof + spin_boing + clatter, 0.004, 0.15)
    return np.zeros(100)


def main():
    print("[1/4] Sintetizando vozes Duplo Sentido 3D EP 07 v3 (Cartoon Meme Overhaul)...")
    asyncio.run(synthesize_voices())

    print("[2/4] Montando timeline dinamica de alta retencao (7 falas / 6 beats)...")
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
    print(f"  Batidas EP07 v3: {beat_starts} | TOTAL={total_dur}s")

    n = int(math.ceil(total_dur * SR))
    bgm = synth_churrasco_bgm(total_dur + 0.3)[:n]
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

    # SFX cartoon coreografados (100% comedia de churrasco, ZERO latido!)
    mix_at(sfx_bus, synth_sfx("vine_pop"), 0.05, 0.88)
    mix_at(sfx_bus, synth_sfx("sizzle", 1), 1.40, 0.42)
    mix_at(sfx_bus, synth_sfx("boing"), max(0.2, beat_starts[1] - 0.05), 0.90)
    mix_at(sfx_bus, synth_sfx("sizzle", 2), beat_starts[1] + 0.35, 0.85)
    mix_at(sfx_bus, synth_sfx("rubber_stretch"), beat_starts[2] + 0.15, 0.78)
    mix_at(sfx_bus, synth_sfx("sizzle", 3), beat_starts[2] + 0.65, 0.80)
    mix_at(sfx_bus, synth_sfx("metallic_ping", 1), beat_starts[2] + 2.40, 0.72)
    mix_at(sfx_bus, synth_sfx("rubber_stretch"), beat_starts[3] + 0.08, 0.86)
    mix_at(sfx_bus, synth_sfx("metallic_ping", 2), beat_starts[3] + 1.35, 0.88)
    # B5: hitstop record-scratch -> gigante passando na lente -> EXPLOSAO COGUMELO DE FAROFA!
    mix_at(sfx_bus, synth_sfx("record_scratch", 1), beat_starts[4] + 0.04, 0.90)
    mix_at(sfx_bus, synth_sfx("whoosh_flyby", 1), beat_starts[4] + 0.62, 0.96)
    mix_at(sfx_bus, synth_sfx("farofa_nuke", 1), beat_starts[4] + 1.52, 1.00)
    # B6: risada saltitante + boing do fisheye close-up final!
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[5] + 0.08, 0.82)
    if len(loaded) >= 7:
        mix_at(sfx_bus, synth_sfx("vine_pop"), loaded[6]["start"] - 0.04, 0.74)

    master = bgm * duck_env + sfx_bus * 0.80 + voice_bus * 0.96
    pk = np.max(np.abs(master))
    if pk > 0:
        master = np.tanh((master / pk) * 1.14) * 0.87

    end_fade = min(len(master), int(0.25 * SR))
    master[-end_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, end_fade)) ** 2

    out_wav = AUDIO_DIR / "ep07_churrasco_mix.wav"
    wavfile.write(str(out_wav), SR, np.clip(master * 32767.0, -32767, 32767).astype(np.int16))

    tl_obj = {
        "episode": 7,
        "slug": "ep07-linguica-churrasco",
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
    tl_js = AUDIO_DIR / "ep07_churrasco_timeline.js"
    with open(tl_js, "w", encoding="utf-8") as f:
        f.write("window.EP07_CHURRASCO_TIMELINE = " + json.dumps(tl_obj, ensure_ascii=False) + ";\n")

    print(f"Master pronto: {out_wav.name} ({total_dur}s) e {tl_js.name}")


if __name__ == "__main__":
    main()
