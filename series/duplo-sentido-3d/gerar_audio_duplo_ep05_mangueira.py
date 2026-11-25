"""Gerador de Audio Master -- Duplo Sentido 3D (EP 05: A Mangueira da Vizinha!)."""
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
GEN_DIR = AUDIO_DIR / "generated_ep05_mangueira"
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
        "id": "ep05_b1_isca",
        "beat_idx": 0,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "01_isca_mangueira.wav",
        "text": "A vizinha me chamou correndo na garagem... dizendo que a MANGUEIRA dela tá grossa demais e não para de vazar!",
        "speech_text": "A vizinha me chamou correndo na garagem... dizendo que a mangueira dela tá grossa demais e não para de vazar!...",
        "pre_gap": 0.08,
        "post_gap": 0.16,
    },
    {
        "id": "ep05_b2_camila_garagem",
        "beat_idx": 1,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+6%",
        "pitch": "+2Hz",
        "file": GEN_DIR / "02_camila_garagem.wav",
        "text": "Vem logo segurar essa mangueira! Se eu soltar ela sai chicoteando a garagem inteira!",
        "speech_text": "Vem logo segurar essa mangueira! Se eu soltar ela sai chicoteando a garagem inteira!",
        "pre_gap": 0.12,
        "post_gap": 0.14,
    },
    {
        "id": "ep05_b3_voce_pressao",
        "beat_idx": 2,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "03_voce_pressao.wav",
        "text": "Caramba, Camila! Tô segurando firme com as duas mãos aqui... mas tá dura de tanta pressão!",
        "speech_text": "Caramba, Camila! Tô segurando firme com as duas mãos aqui... mas tá dura de tanta pressão!...",
        "pre_gap": 0.10,
        "post_gap": 0.14,
    },
    {
        "id": "ep05_b4_camila_bico",
        "beat_idx": 3,
        "speaker": "camila",
        "voice_type": "edge",
        "edge_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate": "+5%",
        "pitch": "+2Hz",
        "file": GEN_DIR / "04_camila_bico.wav",
        "text": "Cuidado na ponta! Se você apertar o bico demais vai espirrar jato bem na minha cara!",
        "speech_text": "Cuidado na ponta! Se você apertar o bico demais vai espirrar jato bem na minha cara!",
        "pre_gap": 0.12,
        "post_gap": 0.14,
    },
    {
        "id": "ep05_b5_voce_jato",
        "beat_idx": 4,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "05_voce_jato.wav",
        "text": "Deixa eu travar o bico aqui... Eita! Apertei demais, molhou nós dois inteiros na oficina!",
        "speech_text": "Deixa eu travar o bico aqui... Eita! Apertei demais, molhou nós dois inteiros na oficina!...",
        "pre_gap": 0.10,
        "post_gap": 0.16,
    },
    {
        "id": "ep05_b6_cta",
        "beat_idx": 5,
        "speaker": "voce",
        "voice_type": "voicestudio",
        "vs_voice": "ep06_voce_alloy",
        "file": GEN_DIR / "06_voce_cta.wav",
        "text": "Banho grátis de domingo! Agora comenta aí: você lava o carro em casa ou leva no lava-rápido?",
        "speech_text": "Banho grátis de domingo! Agora comenta aí: você lava o carro em casa ou leva no lava-rápido?...",
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
    last_60 = float(np.sqrt(np.mean(arr[-int(0.06 * SR) :] ** 2))) / pk
    return last_60 < 0.15, last_60


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
                    comm = edge_tts.Communicate(
                        dlg["speech_text"],
                        edge_v,
                        rate=dlg.get("rate", "+5%"),
                        pitch=dlg.get("pitch", "+1Hz"),
                    )
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
                "seed": 1510 + idx * 37 + attempt * 103,
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


def synth_oficina_bgm(total_sec):
    """Trilha comica leve de domingo na garagem/oficina (baixo groove + marimba/ukulele saltitante)."""
    n = int(total_sec * SR)
    t = np.arange(n) / SR
    bpm = 132.0
    beat = 60.0 / bpm
    bgm = np.zeros(n)

    bass = [196.0, 246.94, 293.66, 246.94, 220.0, 261.63, 329.63, 293.66]
    pluck = [783.99, 987.77, 1174.66, 987.77, 880.0, 1046.5]
    step = 0
    cur = 0.0
    while cur < total_sec - 0.25:
        freq = bass[step % len(bass)]
        lt = np.arange(int(beat * 0.44 * SR)) / SR
        tone = (np.sin(2 * np.pi * freq * lt) * 0.52 + np.sin(4 * np.pi * freq * lt) * 0.14) * np.exp(-lt * 6.8) * 0.12
        mix_at(bgm, apply_fade(tone, 0.005, 0.02), cur, 1.0)
        if step % 2 == 1:
            mf = pluck[step % len(pluck)]
            mt = np.arange(int(0.11 * SR)) / SR
            pl = (np.sin(2 * np.pi * mf * mt) * 0.56 + np.sin(2 * np.pi * mf * 2 * mt) * 0.16) * np.exp(-mt * 16.5) * 0.06
            mix_at(bgm, apply_fade(pl, 0.003, 0.015), cur, 1.0)
        cur += beat
        step += 1

    bgm += np.sin(2 * np.pi * 65.41 * t) * 0.009
    return bgm


def synth_sfx(kind):
    """SFX 100% tematicos de oficina/mangueira (ZERO latido de cachorro!)."""
    if kind == "pop":
        lt = np.arange(int(0.16 * SR)) / SR
        f = 420 + 520 * np.exp(-lt * 22)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 18) * 0.30, 0.002, 0.02)
    if kind == "boing":
        lt = np.arange(int(0.32 * SR)) / SR
        f = 220 + 230 * np.sin(lt * 28.0) * np.exp(-lt * 5.0)
        return apply_fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-lt * 7.2) * 0.28, 0.004, 0.02)
    if kind == "valve_squeak":
        lt = np.arange(int(0.34 * SR)) / SR
        f = 680 + 280 * np.sin(lt * 18.0) + 120 * lt
        tone = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.45 + np.sin(4 * np.pi * np.cumsum(f) / SR) * 0.18)
        env = np.sin(np.linspace(0, math.pi, len(lt))) ** 0.8
        return apply_fade(tone * env * 0.22, 0.01, 0.04)
    if kind == "hose_hiss":
        lt = np.arange(int(0.65 * SR)) / SR
        rng = np.random.default_rng(51)
        nz = rng.normal(0, 1, len(lt))
        b, a = signal.butter(2, [1400.0 / NYQ, 6800.0 / NYQ], btype="band")
        hiss = signal.filtfilt(b, a, nz)
        env = np.sin(np.linspace(0, math.pi, len(lt))) ** 0.65 * (0.7 + 0.3 * np.sin(lt * 22.0))
        return apply_fade(hiss * env * 0.22, 0.02, 0.08)
    if kind == "water_blast":
        lt = np.arange(int(1.65 * SR)) / SR
        rng = np.random.default_rng(55)
        nz = rng.normal(0, 1, len(lt))
        b1, a1 = signal.butter(2, [420.0 / NYQ, 5800.0 / NYQ], btype="band")
        jet = signal.filtfilt(b1, a1, nz)
        b2, a2 = signal.butter(2, [160.0 / NYQ, 900.0 / NYQ], btype="band")
        body = signal.filtfilt(b2, a2, rng.normal(0, 1, len(lt)))
        attack = np.minimum(1.0, lt / 0.06)
        decay = np.exp(-np.maximum(0.0, lt - 0.55) * 1.9)
        bubble_mod = 0.78 + 0.22 * np.sin(2 * np.pi * 14.0 * lt)
        click = np.sin(2 * np.pi * 920 * lt) * np.exp(-lt * 45) * 0.35
        out = (jet * 0.42 + body * 0.34) * attack * decay * bubble_mod + click
        return apply_fade(out, 0.005, 0.14)
    return np.zeros(100)


def main():
    print("[1/4] Sintetizando vozes Duplo Sentido 3D EP 05 (A Mangueira da Vizinha!)...")
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
    print(f"  Batidas EP05: {beat_starts} | TOTAL={total_dur}s")

    n = int(math.ceil(total_dur * SR))
    bgm = synth_oficina_bgm(total_dur + 0.3)[:n]
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

    # SFX sincronizados com cada acao fisica (SEM latido!)
    mix_at(sfx_bus, synth_sfx("pop"), 0.14, 0.78)
    mix_at(sfx_bus, synth_sfx("boing"), max(0.2, beat_starts[1] - 0.04), 0.88)
    mix_at(sfx_bus, synth_sfx("hose_hiss"), beat_starts[1] + 0.55, 0.70)
    mix_at(sfx_bus, synth_sfx("pop"), beat_starts[2] + 0.25, 0.72)
    mix_at(sfx_bus, synth_sfx("hose_hiss"), beat_starts[2] + 0.90, 0.65)
    mix_at(sfx_bus, synth_sfx("valve_squeak"), beat_starts[3] + 0.40, 0.80)
    mix_at(sfx_bus, synth_sfx("water_blast"), beat_starts[4] + 1.30, 0.95)
    mix_at(sfx_bus, synth_sfx("boing"), beat_starts[5] + 0.10, 0.76)

    master = bgm * duck_env + sfx_bus * 0.76 + voice_bus * 0.95
    pk = np.max(np.abs(master))
    if pk > 0:
        master = np.tanh((master / pk) * 1.12) * 0.86

    end_fade = min(len(master), int(0.25 * SR))
    master[-end_fade:] *= np.cos(np.linspace(0.0, math.pi / 2.0, end_fade)) ** 2

    out_wav = AUDIO_DIR / "ep05_mangueira_mix.wav"
    wavfile.write(str(out_wav), SR, np.clip(master * 32767.0, -32767, 32767).astype(np.int16))

    tl_obj = {
        "episode": 5,
        "slug": "ep05-mangueira-oficina",
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
    tl_js = AUDIO_DIR / "ep05_mangueira_timeline.js"
    with open(tl_js, "w", encoding="utf-8") as f:
        f.write("window.EP05_MANGUEIRA_TIMELINE = " + json.dumps(tl_obj, ensure_ascii=False) + ";\n")

    print(f"Master pronto: {out_wav.name} ({total_dur}s) e {tl_js.name}")


if __name__ == "__main__":
    main()
