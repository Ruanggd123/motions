"""Gerador de Audio Master -- Duplo Sentido 3D (EP 03: O Periquito da Vizinha)."""
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
GEN_DIR = AUDIO_DIR / "generated_ep03_periquito"
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
        "id": "ep03_b1_isca",
        "beat_idx": 0,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "01_isca_periquito.wav",
        "text": "A vizinha bateu aqui desesperada... dizendo que o PERIQUITO dela escapou e entrou com tudo na minha sala!",
        "speech_text": "A vizinha bateu aqui desesperada... dizendo que o periquito dela escapou e entrou com tudo na minha sala!...",
        "pre_gap": 0.08,
        "post_gap": 0.16,
    },
    {
        "id": "ep03_b2_camila",
        "beat_idx": 1,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+6%",
        "pitch": "+2Hz",
        "file": GEN_DIR / "02_camila_pega.wav",
        "text": "Pega ele logo! Se o meu periquito ficar solto assim vai bicar o sofá inteiro!",
        "speech_text": "Pega ele logo! Se o meu periquito ficar solto assim, vai bicar o sofá inteiro!",
        "pre_gap": 0.14,
        "post_gap": 0.14,
    },
    {
        "id": "ep03_b3_voce_liso",
        "beat_idx": 2,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "03_voce_liso.wav",
        "text": "Calma, Camila! Tô tentando segurar firme com as duas mãos, mas ele é liso demais!",
        "speech_text": "Calma, Camila! Tô tentando segurar firme com as duas mãos, mas ele é liso demais!...",
        "pre_gap": 0.10,
        "post_gap": 0.14,
    },
    {
        "id": "ep03_b4_camila_carinho",
        "beat_idx": 3,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+5%",
        "pitch": "+2Hz",
        "file": GEN_DIR / "04_camila_carinho.wav",
        "text": "Não aperta! Ele só fica mansinho se você passar o dedo bem devagar na cabeça dele!",
        "speech_text": "Não aperta! Ele só fica mansinho se você passar o dedo bem devagar na cabeça dele!",
        "pre_gap": 0.12,
        "post_gap": 0.14,
    },
    {
        "id": "ep03_b5_voce_pacoca",
        "beat_idx": 4,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "05_voce_pacoca.wav",
        "text": "Pronto, quase acalmou... Ei Paçoca, NÃO late agora! Ele voou direto na câmera!",
        "speech_text": "Pronto, quase acalmou... Ei Paçoca, não late agora! Ele voou direto na câmera!...",
        "pre_gap": 0.10,
        "post_gap": 0.14,
    },
    {
        "id": "ep03_b6_cta",
        "beat_idx": 5,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "06_voce_cta.wav",
        "text": "Sobrou pena pra todo lado! Comenta aqui: você segurava um periquito desse tamanho solto na sala?",
        "speech_text": "Sobrou pena pra todo lado! Agora comenta aqui: você segurava um periquito desse tamanho solto na sala?...",
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
                "seed": 910 + idx * 31 + attempt * 101,
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


def synth_comedy_bgm(total_sec):
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 132.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)

    bass = [196.0, 220.0, 246.94, 293.66, 261.63, 220.0, 196.0, 146.83]
    marimba = [783.99, 880.0, 987.77, 1046.5, 987.77, 880.0]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass[step % len(bass)]
        lt = np.arange(int(beat * 0.42 * SR)) / SR
        tone = (np.sin(2 * np.pi * freq * lt) * 0.52 + np.sin(4 * np.pi * freq * lt) * 0.14) * np.exp(-lt * 7.2) * 0.12
        mix_at(bgm, apply_fade(tone, 0.005, 0.02), cur, 1.0)
        if step % 2 == 1:
            mf = marimba[step % len(marimba)]
            mt = np.arange(int(0.11 * SR)) / SR
            pl = (np.sin(2 * np.pi * mf * mt) * 0.58 + np.sin(2 * np.pi * mf * 2 * mt) * 0.16) * np.exp(-mt * 18) * 0.06
            mix_at(bgm, apply_fade(pl, 0.003, 0.015), cur, 1.0)
        cur += beat
        step += 1

    bgm += np.sin(2 * np.pi * 65.4 * t) * 0.010
    return bgm


def synth_sfx(kind):
    if kind == "chirp":
        lt = np.arange(int(0.28 * SR)) / SR
        f = 2100 + np.sin(lt * 48) * 650 + lt * 1200
        sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(lt * 22)) * np.exp(-lt * 6.5) * 0.26
        return apply_fade(sig, 0.005, 0.03)
    if kind == "boing":
        lt = np.arange(int(0.32 * SR)) / SR
        f = 240 + 210 * np.sin(lt * 28.0) * np.exp(-lt * 5.0)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 7.5) * 0.26, 0.004, 0.02)
    if kind == "flap":
        lt = np.arange(int(0.45 * SR)) / SR
        rng = np.random.default_rng(77)
        nz = signal.lfilter([0.25], [1.0, -0.75], rng.normal(0, 1, len(lt)))
        env = (0.5 + 0.5 * np.sin(lt * 34.0)) * np.exp(-lt * 3.8)
        return apply_fade(nz * env * 0.28, 0.006, 0.04)
    if kind == "knock":
        lt = np.arange(int(0.26 * SR)) / SR
        sig = np.zeros_like(lt)
        for d in (0.01, 0.11):
            k = int(d * SR)
            if k < len(lt):
                st = lt[: len(lt) - k]
                sig[k:] += np.sin(2 * np.pi * 165 * st) * np.exp(-st * 28) * 0.42
        return apply_fade(sig, 0.002, 0.02)
    return np.zeros(100)


def main():
    print("[1/4] Sintetizando vozes Duplo Sentido 3D EP 03 (O Periquito da Vizinha)...")
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
    print(f"  Batidas EP03: {beat_starts} | TOTAL={total_dur}s")

    n = int(math.ceil(total_dur * SR))
    bgm = synth_comedy_bgm(total_dur + 0.3)[:n]
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

    mix_at(sfx_bus, synth_sfx("knock"), 0.12, 0.85)
    mix_at(sfx_bus, synth_sfx("boing"), max(0.2, beat_starts[1] - 0.05), 0.85)
    mix_at(sfx_bus, synth_sfx("chirp"), beat_starts[1] + 0.18, 0.72)
    mix_at(sfx_bus, synth_sfx("flap"), beat_starts[2] + 0.35, 0.78)
    mix_at(sfx_bus, synth_sfx("chirp"), beat_starts[3] + 0.12, 0.65)
    mix_at(sfx_bus, synth_sfx("flap"), beat_starts[4] + 0.90, 0.90)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[5] + 0.05, 0.75)
    mix_at(sfx_bus, synth_sfx("chirp"), beat_starts[5] + 0.25, 0.65)

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
            b_clip = apply_fade(b_arr[: int(0.75 * SR)], 0.01, 0.05)
            mix_at(sfx_bus, b_clip, beat_starts[4] + 1.45, 0.38)
        except Exception:
            pass

    master = bgm * duck_env + sfx_bus * 0.72 + voice_bus * 0.95
    pk = np.max(np.abs(master))
    if pk > 0:
        master = np.tanh((master / pk) * 1.12) * 0.86

    end_fade = min(len(master), int(0.25 * SR))
    master[-end_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, end_fade)) ** 2

    out_wav = AUDIO_DIR / "ep03_periquito_mix.wav"
    wavfile.write(str(out_wav), SR, np.clip(master * 32767.0, -32767, 32767).astype(np.int16))

    tl_obj = {
        "episode": 3,
        "slug": "ep03-periquito-vizinha",
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
    tl_js = AUDIO_DIR / "ep03_periquito_timeline.js"
    with open(tl_js, "w", encoding="utf-8") as f:
        f.write("window.EP03_PERIQUITO_TIMELINE = " + json.dumps(tl_obj, ensure_ascii=False) + ";\n")

    print(f"Master pronto: {out_wav.name} ({total_dur}s) e {tl_js.name}")


if __name__ == "__main__":
    main()
