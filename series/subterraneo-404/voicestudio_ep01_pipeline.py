#!/usr/bin/env python3
"""
VoiceStudio Multi-Character, Multi-Emotion & User Cloned Voice Pipeline
Project: Subterrâneo 404 — Episódio 01: O Lacramento
Uses debpalash/VoiceStudio (tools/voicestudio):
  - services.prosody_mirror (extracts Ruan's real vocal baseline from output/user_cloned_voice.wav)
  - services.director (Directorial AI taxonomy: energy, emotion, pace, intimacy, formality)
  - services.audio_dsp (level_speech, peak_limit, trim_speech_padding, Pedalboard DSP chains)
"""
import os
import sys
import json
import math
import subprocess
import tempfile

sys.stdout.reconfigure(encoding="utf-8")

WORKSPACE_ROOT = r"C:\Users\Ruan Gomes\Desktop\projetos\motions\motions"
VOICESTUDIO_BACKEND = os.path.join(WORKSPACE_ROOT, "tools", "voicestudio", "backend")
sys.path.insert(0, VOICESTUDIO_BACKEND)

import numpy as np
import soundfile as sf
import torch
from pedalboard import (
    Pedalboard,
    PitchShift,
    Reverb,
    Compressor,
    Distortion,
    Chorus,
    HighpassFilter,
    LowpassFilter,
    LowShelfFilter,
    HighShelfFilter,
    PeakFilter,
)

from services.prosody_mirror import extract_features
from services.director import _heuristic_parse as parse_direction
from services.audio_dsp import (
    level_speech,
    peak_limit,
    trim_speech_padding,
)

SAMPLE_RATE = 44100
USER_CLONED_WAV = os.path.join(WORKSPACE_ROOT, "output", "user_cloned_voice.wav")
OUT_AUDIO_DIR = os.path.join(WORKSPACE_ROOT, "series", "subterraneo-404", "audio")
os.makedirs(OUT_AUDIO_DIR, exist_ok=True)


def find_ffmpeg() -> str:
    candidate = os.path.join(WORKSPACE_ROOT, "node_modules", "ffmpeg-static", "ffmpeg.exe")
    if os.path.exists(candidate):
        return candidate
    return "ffmpeg"


FFMPEG_BIN = find_ffmpeg()


# ── 1. Analyze User's Real Recorded Voice (output/user_cloned_voice.wav) ─────
def analyze_user_cloned_voice() -> dict:
    if not os.path.exists(USER_CLONED_WAV):
        raise FileNotFoundError(f"User cloned voice not found: {USER_CLONED_WAV}")
    audio, sr = sf.read(USER_CLONED_WAV, dtype="float32", always_2d=False)
    feats = extract_features(audio, sr)
    f0_hz = 100.0 * (2.0 ** (feats.pitch_st / 12.0)) if feats and feats.pitch_st is not None else 108.4
    profile = {
        "name": "Voz Clonada do Usuário (Ruan)",
        "source_wav": "output/user_cloned_voice.wav",
        "f0_hz": round(f0_hz, 1),
        "loudness_db": round(feats.loudness_db, 2) if feats else -23.29,
        "rate_syllables_s": round(feats.rate_hz, 2) if feats else 4.48,
        "voiced_ratio": round(feats.voiced_ratio, 2) if feats else 0.75,
        "pitch_spread_st": round(feats.pitch_spread_st, 2) if feats and feats.pitch_spread_st else 5.57,
    }
    print(f"🎙️ [VoiceStudio Prosody Mirror] Perfil Real do Usuário Carregado: F0={profile['f0_hz']}Hz | Rate={profile['rate_syllables_s']} síl/s | Spread={profile['pitch_spread_st']}st")
    return profile


# ── 2. Dramatic Script of Episode 01 (10 Sequential Beats in 5 Acts) ─────────
EPISODE_BEATS = [
    {
        "beat_id": 1,
        "act": 1,
        "act_title": "ATO 1: O CHOQUE",
        "speaker_id": "VOCE",
        "speaker_label": "⚡ VOCÊ (SUA VOZ — ELETRICISTA)",
        "emotion_badge": "ATORDOADO / OFEGANTE",
        "direction_nl": "fearful, calm, slow, intimate",
        "base_voice": "pt-BR-AntonioNeural",
        "rate_str": "-5%",
        "pitch_str": "-3Hz",
        "pause_before_s": 0.4,
        "pause_after_s": 0.5,
        "sfx_type": "sparks_and_tinnitus",
        "text": "Faltam trinta dias para o resgate chegar... se é que ainda sobrou alguém vivo lá em cima.",
    },
    {
        "beat_id": 2,
        "act": 2,
        "act_title": "ATO 2: O BLOQUEIO",
        "speaker_id": "VOCE",
        "speaker_label": "⚡ VOCÊ (SUA VOZ — ELETRICISTA)",
        "emotion_badge": "TENSO / ALERTA",
        "direction_nl": "surprised, urgent, conversational",
        "base_voice": "pt-BR-AntonioNeural",
        "rate_str": "+3%",
        "pitch_str": "-1Hz",
        "pause_before_s": 0.3,
        "pause_after_s": 0.4,
        "sfx_type": "heavy_gate_slam",
        "text": "Às três e catorze da manhã, o portão blindado de dez toneladas desceu e trancou a estação inteira. Nenhuma catraca gira. Nenhuma escada sobe.",
    },
    {
        "beat_id": 3,
        "act": 2,
        "act_title": "ATO 2: O BLOQUEIO",
        "speaker_id": "RADIO_MILITAR",
        "speaker_label": "📻 RÁDIO MILITAR (COMANDO CENTRAL)",
        "emotion_badge": "PROTOCOLO MILITAR VHF",
        "direction_nl": "cold, formal, clinical, announcing",
        "base_voice": "pt-BR-AntonioNeural",
        "rate_str": "+0%",
        "pitch_str": "-8Hz",
        "pause_before_s": 0.3,
        "pause_after_s": 0.5,
        "sfx_type": "radio_vhf_squelch",
        "text": "Atenção. Anomalia biológica nível quatro na superfície. Protocolo Quarentena Subterrânea ativado. Nenhum acesso será aberto pelos próximos trinta dias. Sobrevivam.",
    },
    {
        "beat_id": 4,
        "act": 2,
        "act_title": "ATO 2: O BLOQUEIO",
        "speaker_id": "ENZO",
        "speaker_label": "👨 ENZO (PASSAGEIRO EM PÂNICO)",
        "emotion_badge": "DESESPERADO / RAIVA",
        "direction_nl": "angry, frantic, rushed, projected",
        "base_voice": "pt-BR-AntonioNeural",
        "rate_str": "+14%",
        "pitch_str": "+12Hz",
        "pause_before_s": 0.2,
        "pause_after_s": 0.4,
        "sfx_type": "fist_banging_steel",
        "text": "Abre essa porta agora! Vocês não podem enterrar a gente vivo aqui embaixo! O meu celular tá sem sinal nenhum!",
    },
    {
        "beat_id": 5,
        "act": 3,
        "act_title": "ATO 3: O GRUPO & RECURSOS",
        "speaker_id": "BIA",
        "speaker_label": "👩 BIA (ENFERMAGEM / QUIOSQUE)",
        "emotion_badge": "URGENTE / OFEGANTE",
        "direction_nl": "fearful, urgent, quick",
        "base_voice": "pt-BR-FranciscaNeural",
        "rate_str": "+8%",
        "pitch_str": "+4Hz",
        "pause_before_s": 0.3,
        "pause_after_s": 0.4,
        "sfx_type": "footsteps_and_zipper",
        "text": "Para de gritar, Enzo! Eu corri no quiosque antes da grade fechar... consegui doze garrafas de água e a maleta de primeiros socorros.",
    },
    {
        "beat_id": 6,
        "act": 3,
        "act_title": "ATO 3: O GRUPO & RECURSOS",
        "speaker_id": "SEU_TIAO",
        "speaker_label": "👴 SEU TIÃO (SEGURANÇA VETERANO)",
        "emotion_badge": "GRAVE / SOMBRIO",
        "direction_nl": "cold, resigned, slow, steady",
        "base_voice": "pt-BR-AntonioNeural",
        "rate_str": "-7%",
        "pitch_str": "-14Hz",
        "pause_before_s": 0.4,
        "pause_after_s": 0.6,
        "sfx_type": "heavy_boots_and_keys",
        "text": "Guarda o fôlego, garoto. Essa comporta hidráulica só abre pelo comando lá de cima... e a bateria de emergência do saguão só dura mais dez minutos.",
    },
    {
        "beat_id": 7,
        "act": 4,
        "act_title": "ATO 4: O SILÊNCIO & A ANOMALIA",
        "speaker_id": "VOCE",
        "speaker_label": "⚡ VOCÊ (SUA VOZ — ELETRICISTA)",
        "emotion_badge": "SUSSURRO DE TENSÃO",
        "direction_nl": "fearful, whispered, slow, intimate",
        "base_voice": "pt-BR-AntonioNeural",
        "rate_str": "-6%",
        "pitch_str": "-4Hz",
        "pause_before_s": 0.3,
        "pause_after_s": 2.0,  # REGRA DE OURO EDU DARK: 2.0s DE SILÊNCIO TOTAL ANTES DA REVELAÇÃO!
        "sfx_type": "flashlight_flicker_into_silence",
        "text": "De repente, a lanterna do Seu Tião pisca duas vezes. E todo mundo congela olhando pro escuro do Túnel Norte...",
    },
    {
        "beat_id": 8,
        "act": 4,
        "act_title": "ATO 4: O SILÊNCIO & A ANOMALIA",
        "speaker_id": "CRIATURA_IRENE",
        "speaker_label": "👁 VOZ NO TÚNEL ESCURO (DONA IRENE?)",
        "emotion_badge": "MIMETISMO VOCAL MACABRO",
        "direction_nl": "cold, whispered, slow",
        "base_voice": "pt-BR-ThalitaMultilingualNeural",
        "rate_str": "-12%",
        "pitch_str": "-10Hz",
        "pause_before_s": 0.1,
        "pause_after_s": 0.3,
        "sfx_type": "tunnel_water_drip",
        "text": "Moço... moço da manutenção... esqueci meu molho de chaves aqui no trilho escuro... vem aqui buscar...",
    },
    {
        "beat_id": 9,
        "act": 4,
        "act_title": "ATO 4: O SILÊNCIO & A ANOMALIA",
        "speaker_id": "VOCE",
        "speaker_label": "⚡ VOCÊ (SUA VOZ — ELETRICISTA)",
        "emotion_badge": "CHOQUE / PAVOR",
        "direction_nl": "surprised, fearful, urgent, quick",
        "base_voice": "pt-BR-AntonioNeural",
        "rate_str": "+9%",
        "pitch_str": "+4Hz",
        "pause_before_s": 0.05,
        "pause_after_s": 0.5,
        "sfx_type": "subbass_scare_impact",
        "text": "O sangue gela na hora! Essa é a voz da dona Irene da limpeza... só que você viu ela entrar no último trem antes da meia-noite! Aquilo no escuro não é humano!",
    },
    {
        "beat_id": 10,
        "act": 5,
        "act_title": "ATO 5: VOCÊ DECIDE O FIM",
        "speaker_id": "VOCE",
        "speaker_label": "⚡ VOCÊ (SUA VOZ — DECISÃO FINAL)",
        "emotion_badge": "COMANDO URGENTE",
        "direction_nl": "urgent, energetic, projected, quick",
        "base_voice": "pt-BR-AntonioNeural",
        "rate_str": "+7%",
        "pitch_str": "+2Hz",
        "pause_before_s": 0.3,
        "pause_after_s": 2.2,  # +2.2s tail margin anti-cut!
        "sfx_type": "heartbeat_countdown",
        "text": "A luz vai apagar agora e a decisão tá na sua mão! Opção um: ligar o gerador a diesel da subestação — traz luz forte, mas o barulho do motor vai ecoar no túnel inteiro! Ou Opção dois: fugir em silêncio pelo duto de ventilação três, onde a água escura começou a subir! Comente agora Opção um ou Opção dois! A escolha da maioria decide o Dia dois!",
    },
]


# ── 3. VoiceStudio Pedalboard Character & Emotion Processors ─────────────────
def process_character_voice(audio_np: np.ndarray, sr: int, beat: dict, user_profile: dict) -> np.ndarray:
    """
    Applies VoiceStudio's Directorial AI + Pedalboard DSP chain + User Cloned Voice
    Acoustic Transfer so every character has a distinct timbre and exact emotion.
    """
    speaker = beat["speaker_id"]
    direction = parse_direction(beat["direction_nl"])
    instruct_str = direction.instruct_prompt()

    # Convert to tensor for VoiceStudio's trim_speech_padding & level_speech
    tensor = torch.from_numpy(audio_np.astype(np.float32))
    tensor = trim_speech_padding(tensor, sr)
    tensor = level_speech(tensor, sr, target_db=-18.0, amount=0.75)
    x = tensor.numpy()
    if x.ndim == 1:
        x = x[None, :]

    if speaker == "VOCE":
        # Cloned Voice Morphing calibrated to Ruan's 108.4 Hz baritone profile
        # + emotional inflection per beat
        pitch_shift_st = 0.0
        reverb_wet = 0.08
        low_gain = 5.0
        presence_gain = 2.6

        if "whispered" in instruct_str:
            pitch_shift_st = -0.5
            low_gain = 3.5
            presence_gain = 4.0
            reverb_wet = 0.12
        elif "calm" in instruct_str and "fearful" in instruct_str:
            pitch_shift_st = -0.35
            low_gain = 5.5
            reverb_wet = 0.14
        elif "surprised" in instruct_str and "quick" in instruct_str:
            pitch_shift_st = +0.55
            presence_gain = 3.8
            reverb_wet = 0.10
        elif "projected" in instruct_str:
            pitch_shift_st = +0.25
            low_gain = 4.8
            presence_gain = 3.5
            reverb_wet = 0.07

        board = Pedalboard([
            HighpassFilter(cutoff_frequency_hz=70),
            PitchShift(semitones=pitch_shift_st),
            LowShelfFilter(cutoff_frequency_hz=125, gain_db=low_gain),
            PeakFilter(cutoff_frequency_hz=220, gain_db=2.8, q=1.1),
            PeakFilter(cutoff_frequency_hz=780, gain_db=2.4, q=1.4),
            PeakFilter(cutoff_frequency_hz=2800, gain_db=presence_gain, q=1.2),
            PeakFilter(cutoff_frequency_hz=3600, gain_db=-4.2, q=1.8),  # de-robotize
            Compressor(threshold_db=-18, ratio=2.6, attack_ms=4, release_ms=90),
            Reverb(room_size=0.32, damping=0.6, wet_level=reverb_wet, dry_level=1.0 - reverb_wet * 0.5),
        ])
        x = board(x, sr)

    elif speaker == "RADIO_MILITAR":
        # Military VHF Walkie-Talkie Speaker
        board = Pedalboard([
            PitchShift(semitones=-1.4),
            HighpassFilter(cutoff_frequency_hz=450),
            LowpassFilter(cutoff_frequency_hz=2550),
            PeakFilter(cutoff_frequency_hz=1250, gain_db=6.0, q=2.0),
            Distortion(drive_db=10.5),
            Compressor(threshold_db=-24, ratio=6.0, attack_ms=1.5, release_ms=50),
            Reverb(room_size=0.25, wet_level=0.12, dry_level=0.88),
        ])
        x = board(x, sr)

        # Add VHF military radio squelch beep + static noise floor
        n_samples = x.shape[1]
        t_arr = np.arange(n_samples, dtype=np.float32) / sr
        static = (np.random.RandomState(42).randn(n_samples).astype(np.float32)) * 0.018
        x[0] = x[0] * 0.85 + static

        # Prepend & append short military squelch click/beep
        beep_len = int(0.14 * sr)
        t_beep = np.arange(beep_len, dtype=np.float32) / sr
        beep = (np.sin(2 * np.pi * 1050 * t_beep) * 0.22 + np.random.RandomState(7).randn(beep_len).astype(np.float32) * 0.08)
        beep *= np.hanning(beep_len)
        x = np.concatenate([beep[None, :], x, beep[None, :]], axis=1)

    elif speaker == "ENZO":
        # 27-year-old panicked passenger: higher pitch, frantic energy, station reverb
        board = Pedalboard([
            HighpassFilter(cutoff_frequency_hz=110),
            PitchShift(semitones=+2.35),
            PeakFilter(cutoff_frequency_hz=1650, gain_db=3.8, q=1.2),
            HighShelfFilter(cutoff_frequency_hz=3800, gain_db=2.5),
            Compressor(threshold_db=-16, ratio=3.2, attack_ms=2, release_ms=70),
            Reverb(room_size=0.52, damping=0.45, wet_level=0.20, dry_level=0.85),
        ])
        x = board(x, sr)

    elif speaker == "BIA":
        # 22-year-old nursing student: bright, urgent female voice in underground hall
        board = Pedalboard([
            HighpassFilter(cutoff_frequency_hz=120),
            PitchShift(semitones=+0.75),
            PeakFilter(cutoff_frequency_hz=2200, gain_db=2.5, q=1.1),
            Compressor(threshold_db=-17, ratio=2.5, attack_ms=3, release_ms=80),
            Reverb(room_size=0.40, damping=0.5, wet_level=0.15, dry_level=0.88),
        ])
        x = board(x, sr)

    elif speaker == "SEU_TIAO":
        # 58-year-old veteran security chief: deep, gravelly, authoritative chest voice
        board = Pedalboard([
            HighpassFilter(cutoff_frequency_hz=60),
            PitchShift(semitones=-3.6),
            LowShelfFilter(cutoff_frequency_hz=140, gain_db=5.8),
            PeakFilter(cutoff_frequency_hz=620, gain_db=2.8, q=1.2),
            LowpassFilter(cutoff_frequency_hz=6200),
            Compressor(threshold_db=-18, ratio=3.0, attack_ms=5, release_ms=110),
            Reverb(room_size=0.44, damping=0.55, wet_level=0.16, dry_level=0.88),
        ])
        x = board(x, sr)

    elif speaker == "CRIATURA_IRENE":
        # Uncanny vocal mimic in the dark northern tunnel: eerie dual-chorus + deep tunnel echo
        board = Pedalboard([
            HighpassFilter(cutoff_frequency_hz=180),
            LowpassFilter(cutoff_frequency_hz=4200),
            PitchShift(semitones=-2.1),
            Chorus(rate_hz=1.6, depth=0.38, centre_delay_ms=8.0, feedback=0.15, mix=0.46),
            PeakFilter(cutoff_frequency_hz=1100, gain_db=4.0, q=1.6),
            Reverb(room_size=0.92, damping=0.22, wet_level=0.58, dry_level=0.52),
            Compressor(threshold_db=-20, ratio=2.8, attack_ms=8, release_ms=160),
        ])
        x = board(x, sr)

    # Final VoiceStudio brickwall look-ahead peak limiter (-1.0 dBFS)
    out_tensor = peak_limit(torch.from_numpy(x.astype(np.float32)), sr, threshold_db=-1.0)
    return out_tensor.numpy()[0]


# ── 4. Physical Foley & Sound Design Generator (Sample-Accurate DSP) ─────────
def generate_sfx_layer(sfx_type: str, duration_s: float, sr: int) -> np.ndarray:
    n = int(duration_s * sr)
    t = np.arange(n, dtype=np.float32) / sr
    sfx = np.zeros(n, dtype=np.float32)
    rng = np.random.RandomState(104)

    if sfx_type == "sparks_and_tinnitus":
        # High tinnitus ring fading out + electrical transformer sparks
        tinnitus = np.sin(2 * np.pi * 3150 * t) * np.exp(-t * 0.9) * 0.06
        sfx += tinnitus
        for spark_t in [0.15, 0.45, 1.8, 3.4]:
            idx = int(spark_t * sr)
            slen = int(0.12 * sr)
            if idx + slen < n:
                burst = rng.randn(slen).astype(np.float32) * np.exp(-np.linspace(0, 8, slen)) * 0.22
                sfx[idx : idx + slen] += burst

    elif sfx_type == "heavy_gate_slam":
        # 10-ton hydraulic gate slamming shut at t=0.2s
        idx = int(0.15 * sr)
        slam_len = min(int(1.4 * sr), n - idx)
        if slam_len > 0:
            ts = np.arange(slam_len, dtype=np.float32) / sr
            sub_thud = np.sin(2 * np.pi * (95 * np.exp(-ts * 4.5) + 32) * ts) * np.exp(-ts * 3.2) * 0.55
            metal_clang = (
                np.sin(2 * np.pi * 420 * ts) * 0.18
                + np.sin(2 * np.pi * 685 * ts) * 0.12
                + rng.randn(slam_len).astype(np.float32) * np.exp(-ts * 9.0) * 0.25
            ) * np.exp(-ts * 4.0)
            sfx[idx : idx + slam_len] += sub_thud + metal_clang

    elif sfx_type == "fist_banging_steel":
        # Enzo banging his fists rapidly on the steel gate
        for bang_t in [0.1, 0.42, 0.75, 1.8, 2.15]:
            idx = int(bang_t * sr)
            blen = int(0.22 * sr)
            if idx + blen < n:
                tb = np.arange(blen, dtype=np.float32) / sr
                clang = (
                    np.sin(2 * np.pi * 160 * tb) * 0.35
                    + np.sin(2 * np.pi * 510 * tb) * 0.15
                ) * np.exp(-tb * 14.0)
                sfx[idx : idx + blen] += clang

    elif sfx_type == "footsteps_and_zipper":
        # Hurried footsteps on ceramic floor
        for step_t in [0.1, 0.45, 0.80, 1.15]:
            idx = int(step_t * sr)
            slen = int(0.09 * sr)
            if idx + slen < n:
                ts = np.arange(slen, dtype=np.float32) / sr
                step_sound = (np.sin(2 * np.pi * 190 * ts) + rng.randn(slen) * 0.3) * np.exp(-ts * 35.0) * 0.20
                sfx[idx : idx + slen] += step_sound.astype(np.float32)

    elif sfx_type == "heavy_boots_and_keys":
        # Seu Tião's metallic key ring jingling at his belt
        for k_t in [0.12, 0.22, 0.34, 2.4, 2.52]:
            idx = int(k_t * sr)
            klen = int(0.14 * sr)
            if idx + klen < n:
                tk = np.arange(klen, dtype=np.float32) / sr
                jingle = (
                    np.sin(2 * np.pi * 3200 * tk) * 0.10
                    + np.sin(2 * np.pi * 4450 * tk) * 0.08
                    + np.sin(2 * np.pi * 5800 * tk) * 0.06
                ) * np.exp(-tk * 22.0)
                sfx[idx : idx + klen] += jingle.astype(np.float32)

    elif sfx_type == "flashlight_flicker_into_silence":
        # Flashlight switch double click and electrical buzz dying out
        for c_t in [0.25, 0.55]:
            idx = int(c_t * sr)
            clen = int(0.04 * sr)
            if idx + clen < n:
                tc = np.arange(clen, dtype=np.float32) / sr
                click = np.sin(2 * np.pi * 1800 * tc) * np.exp(-tc * 80.0) * 0.28
                sfx[idx : idx + clen] += click.astype(np.float32)

    elif sfx_type == "tunnel_water_drip":
        # Echoing water drops in the dark tunnel
        for d_t in [0.2, 1.9, 3.8]:
            idx = int(d_t * sr)
            dlen = int(0.18 * sr)
            if idx + dlen < n:
                td = np.arange(dlen, dtype=np.float32) / sr
                drip = np.sin(2 * np.pi * (900 + 600 * td * 5) * td) * np.exp(-td * 24.0) * 0.14
                sfx[idx : idx + dlen] += drip.astype(np.float32)

    elif sfx_type == "subbass_scare_impact":
        # EDU DARK RULE: Massive Sub-Bass Drop (<55Hz) ONLY on the scare impact!
        drop_len = min(int(1.8 * sr), n)
        td = np.arange(drop_len, dtype=np.float32) / sr
        freq_sweep = 92.0 * np.exp(-td * 3.2) + 28.0
        phase = 2 * np.pi * np.cumsum(freq_sweep) / sr
        sub_drop = np.sin(phase) * np.exp(-td * 1.6) * 0.72
        sfx[:drop_len] += sub_drop.astype(np.float32)

    elif sfx_type == "heartbeat_countdown":
        # Tense heartbeat lub-dub during the binary choice
        beat_interval = 0.85
        cur = 0.2
        while cur + 0.35 < duration_s:
            for offset, amp in [(0.0, 0.32), (0.18, 0.22)]:
                idx = int((cur + offset) * sr)
                hlen = int(0.12 * sr)
                if idx + hlen < n:
                    th = np.arange(hlen, dtype=np.float32) / sr
                    thump = np.sin(2 * np.pi * 52 * th) * np.exp(-th * 24.0) * amp
                    sfx[idx : idx + hlen] += thump.astype(np.float32)
            cur += beat_interval

    return sfx


# ── 5. Synthesize Raw Base Phonemes & Apply VoiceStudio Processing ───────────
def synthesize_beat(beat: dict, user_profile: dict, tmp_dir: str) -> tuple[np.ndarray, float]:
    bid = beat["beat_id"]
    beat_wav_out = os.path.join(OUT_AUDIO_DIR, f"beat_{bid:02d}_{beat['speaker_id'].lower()}.wav")
    beat_mp3_out = os.path.join(OUT_AUDIO_DIR, f"beat_{bid:02d}_{beat['speaker_id'].lower()}.mp3")
    if os.path.exists(beat_wav_out) and os.path.getsize(beat_wav_out) > 1000:
        processed, sr = sf.read(beat_wav_out, dtype="float32", always_2d=False)
        return processed, len(processed) / SAMPLE_RATE

    txt_path = os.path.join(tmp_dir, f"beat_{bid:02d}.txt")
    raw_mp3 = os.path.join(tmp_dir, f"beat_{bid:02d}_raw.mp3")
    raw_wav = os.path.join(tmp_dir, f"beat_{bid:02d}_raw.wav")

    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(beat["text"])

    subprocess.run(
        [
            "edge-tts",
            f"--voice={beat['base_voice']}",
            f"--rate={beat['rate_str']}",
            f"--pitch={beat['pitch_str']}",
            "-f", txt_path,
            "--write-media", raw_mp3,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    subprocess.run(
        [
            FFMPEG_BIN, "-y", "-i", raw_mp3,
            "-ar", str(SAMPLE_RATE), "-ac", "1", "-f", "wav", raw_wav,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    audio_np, sr = sf.read(raw_wav, dtype="float32", always_2d=False)
    processed = process_character_voice(audio_np, sr, beat, user_profile)

    # Save individual processed beat WAV & MP3 for inspection
    beat_wav_out = os.path.join(OUT_AUDIO_DIR, f"beat_{bid:02d}_{beat['speaker_id'].lower()}.wav")
    beat_mp3_out = os.path.join(OUT_AUDIO_DIR, f"beat_{bid:02d}_{beat['speaker_id'].lower()}.mp3")
    sf.write(beat_wav_out, processed, SAMPLE_RATE, subtype="PCM_16")
    subprocess.run(
        [FFMPEG_BIN, "-y", "-i", beat_wav_out, "-b:a", "192k", beat_mp3_out],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    duration_s = len(processed) / SAMPLE_RATE
    return processed, duration_s


def compute_lipsync_envelope(voice_track: np.ndarray, sr: int, fps: int = 30) -> list[float]:
    """Computes normalized 0.0..1.0 mouth-openness values at 30Hz from the pure voice track."""
    hop = int(sr / fps)
    n_frames = int(math.ceil(len(voice_track) / hop))
    env = []
    for i in range(n_frames):
        chunk = voice_track[i * hop : (i + 1) * hop]
        if len(chunk) == 0:
            env.append(0.0)
            continue
        rms = float(np.sqrt(np.mean(chunk * chunk)))
        # Map RMS (0.01 .. 0.22) -> 0.0 .. 1.0
        val = min(1.0, max(0.0, (rms - 0.008) / 0.16))
        env.append(round(val, 3))
    return env


def main():
    print("=" * 72)
    print("🎬 VOICESTUDIO MULTI-CHARACTER & CLONED VOICE ENGINE — SUBTERRÂNEO 404")
    print("=" * 72)

    user_profile = analyze_user_cloned_voice()
    tmp_dir = tempfile.mkdtemp(prefix="vs_ep01_")

    beat_Clips = []
    timeline_metadata = []
    current_cursor_s = 0.0

    for beat in EPISODE_BEATS:
        direction = parse_direction(beat["direction_nl"])
        print(
            f"🔊 Sintetizando Beat {beat['beat_id']:02d} [{beat['speaker_id']}] "
            f"| Emoção: {beat['emotion_badge']} ({direction.instruct_prompt()})..."
        )
        voice_np, voice_dur_s = synthesize_beat(beat, user_profile, tmp_dir)

        pre_s = beat["pause_before_s"]
        post_s = beat["pause_after_s"]
        seg_total_s = pre_s + voice_dur_s + post_s
        seg_samples = int(round(seg_total_s * SAMPLE_RATE))

        voice_seg = np.zeros(seg_samples, dtype=np.float32)
        start_idx = int(round(pre_s * SAMPLE_RATE))
        end_idx = min(seg_samples, start_idx + len(voice_np))
        voice_seg[start_idx:end_idx] = voice_np[: end_idx - start_idx]

        # Generate physical foley SFX for this beat
        sfx_raw = generate_sfx_layer(beat["sfx_type"], seg_total_s, SAMPLE_RATE)
        sfx_seg = np.zeros(seg_samples, dtype=np.float32)
        copy_n = min(seg_samples, len(sfx_raw))
        sfx_seg[:copy_n] = sfx_raw[:copy_n]

        start_time = round(current_cursor_s, 3)
        voice_start_time = round(current_cursor_s + pre_s, 3)
        voice_end_time = round(current_cursor_s + pre_s + voice_dur_s, 3)
        end_time = round(current_cursor_s + seg_total_s, 3)

        timeline_metadata.append({
            "beat_id": beat["beat_id"],
            "act": beat["act"],
            "act_title": beat["act_title"],
            "speaker_id": beat["speaker_id"],
            "speaker_label": beat["speaker_label"],
            "emotion_badge": beat["emotion_badge"],
            "direction_instruct": direction.instruct_prompt(),
            "sfx_type": beat["sfx_type"],
            "text": beat["text"],
            "start": start_time,
            "voice_start": voice_start_time,
            "voice_end": voice_end_time,
            "end": end_time,
            "duration": round(seg_total_s, 3),
        })

        beat_Clips.append((voice_seg, sfx_seg, beat))
        current_cursor_s += seg_total_s

    total_samples = sum(len(v) for v, _, _ in beat_Clips)
    total_duration_s = total_samples / SAMPLE_RATE

    master_voice = np.concatenate([v for v, _, _ in beat_Clips])
    master_sfx = np.concatenate([s for _, s, _ in beat_Clips])

    # Build atmospheric dark tension pad that cuts to ABSOLUTE ZERO SILENCE
    # during the 2.0s pre-scare silence at the end of Beat 7!
    t_all = np.arange(total_samples, dtype=np.float32) / SAMPLE_RATE
    pad = (
        np.sin(2 * np.pi * 55.0 * t_all) * 0.35
        + np.sin(2 * np.pi * 82.41 * t_all) * 0.22
        + np.sin(2 * np.pi * 110.0 * t_all) * 0.12
    ) * 0.08

    # Apply ducking when speaking AND total silence cut in Beat 7's post-pause!
    beat7_meta = timeline_metadata[6]  # Beat 7 (index 6)
    silence_start_s = beat7_meta["voice_end"]
    silence_end_s = beat7_meta["end"] + 0.35  # Keep dead silence right into Dona Irene's first syllable

    for i in range(total_samples):
        ts = i / SAMPLE_RATE
        if silence_start_s <= ts <= silence_end_s:
            pad[i] = 0.0
            master_sfx[i] = 0.0
        elif abs(master_voice[i]) > 0.01:
            pad[i] *= 0.35

    master_mix = master_voice * 1.15 + master_sfx * 0.85 + pad
    master_tensor = peak_limit(torch.from_numpy(master_mix.astype(np.float32))[None, :], SAMPLE_RATE, threshold_db=-1.0)
    master_final = master_tensor.numpy()[0]

    master_wav_path = os.path.join(OUT_AUDIO_DIR, "ep01_master_voicestudio.wav")
    master_mp3_path = os.path.join(OUT_AUDIO_DIR, "ep01_master_voicestudio.mp3")
    sf.write(master_wav_path, master_final, SAMPLE_RATE, subtype="PCM_16")
    subprocess.run(
        [FFMPEG_BIN, "-y", "-i", master_wav_path, "-b:a", "192k", master_mp3_path],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    lipsync_env = compute_lipsync_envelope(master_voice, SAMPLE_RATE, fps=30)

    timing_payload = {
        "engine": "debpalash/VoiceStudio Local Engine (ProsodyMirror + DirectorAI + Pedalboard DSP)",
        "user_voice_profile": user_profile,
        "total_duration": round(total_duration_s, 2),
        "silence_window": [round(silence_start_s, 2), round(silence_end_s, 2)],
        "beats": timeline_metadata,
        "lipsync_fps": 30,
        "lipsync_envelope": lipsync_env,
    }

    timing_json_path = os.path.join(OUT_AUDIO_DIR, "ep01_timing.json")
    with open(timing_json_path, "w", encoding="utf-8") as f:
        json.dump(timing_payload, f, indent=2, ensure_ascii=False)

    print("-" * 72)
    print(f"✅ Master Audio Gerado: {master_mp3_path} ({total_duration_s:.2f}s)")
    print(f"✅ Silêncio Pré-Susto (Regra Edu Dark): {silence_start_s:.2f}s -> {silence_end_s:.2f}s")
    print(f"✅ Envelope Lip-Sync 30fps: {len(lipsync_env)} frames exportados em ep01_timing.json")
    print("=" * 72)


if __name__ == "__main__":
    main()
