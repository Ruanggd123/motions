# 🎬 ROTEIRO ASD-STE100 v13 — "Como Funciona uma Turbina a Jato"
## Nicho: Engenharia Extrema / Mecânica Aeronáutica
## Formato: Cenas Aninhadas MACRO → MICRO → RE-EXP
## Duração: 50 segundos | ~145 palavras

---

## CENA 1 — TURBINA_COMPLETA_BANCADA
- **NÍVEL:** MACRO
- **DURAÇÃO:** 5.0s (0.0–5.0)
- **CÂMERA:** pos=[0,2,8] lookAt=[0,1,0] fov=40 shake=0.0
- **COMPONENTE_DESTAQUE:** carcaca_externa | cor=#FFFFFF | emissive_pulse=1.5Hz
- **PERSONAGEM:** estado=OBSERVANDO escala=1.0x dança=null
- **NARRAÇÃO:** "Esta máquina gera 100 mil libras de empuxo." | emoção=NEUTRO
- **SFX:** ambient_hum@0.0 vol=0.3 pitch=1.0
- **TRANSIÇÃO_SAÍDA:** ZOOM_IN duração=2.5s alvo=CENA_2
- **VALIDAÇÃO_CDP:** CAM_FRUSTUM, CHAR_VISIBLE, LIGHT_MIN

## CENA 2 — ADMISSAO_AR
- **NÍVEL:** SUB
- **DURAÇÃO:** 5.0s (5.0–10.0)
- **CÂMERA:** pos=[0,1.5,5] lookAt=[0,1.2,0] fov=35 shake=0.01
- **COMPONENTE_DESTAQUE:** fan_blades | cor=#00D4FF | emissive_pulse=2.0Hz
- **PERSONAGEM:** estado=ENTRANDO escala=0.6x dança=null
- **NARRAÇÃO:** "O ar entra a 900 km/h pelo fan frontal." | emoção=CURIOSO
- **SFX:** wind_whoosh@5.0 vol=0.6 pitch=1.1 | turbine_spin@7.0 vol=0.4 pitch=0.9
- **TRANSIÇÃO_SAÍDA:** DOLLY_IN duração=2.0s alvo=CENA_3
- **VALIDAÇÃO_CDP:** CAM_FRUSTUM, CHAR_VISIBLE, SPOT_ACTIVE, SCALE_VALID

## CENA 3 — COMPRESSOR_AXIAL_INTERNO
- **NÍVEL:** MICRO
- **DURAÇÃO:** 6.0s (10.0–16.0)
- **CÂMERA:** pos=[0,0.3,1.8] lookAt=[0,0.2,0] fov=28 shake=0.02
- **COMPONENTE_DESTAQUE:** rotor_blades | cor=#FF6B35 | emissive_pulse=2.0Hz
- **PERSONAGEM:** estado=DENTRO escala=0.25x dança=null
- **NARRAÇÃO:** "As pás do compressor giram a 20 mil RPM, esmagando o ar." | emoção=TENSO
- **SFX:** turbine_hum@10.0 vol=0.7 pitch=1.1 | metal_whir@13.0 vol=0.5 pitch=0.9
- **TRANSIÇÃO_SAÍDA:** PULL_BACK duração=1.8s alvo=CENA_4
- **VALIDAÇÃO_CDP:** CAM_FRUSTUM, CHAR_VISIBLE, SPOT_ACTIVE, SCALE_VALID

## CENA 4 — CAMARA_COMBUSTAO
- **NÍVEL:** MICRO
- **DURAÇÃO:** 6.0s (16.0–22.0)
- **CÂMERA:** pos=[0,0.2,2.0] lookAt=[0,0.1,0] fov=28 shake=0.02
- **COMPONENTE_DESTAQUE:** injetores_combustivel | cor=#FF6B35 | emissive_pulse=3.0Hz
- **PERSONAGEM:** estado=DENTRO escala=0.25x dança=Shocked_Freeze
- **NARRAÇÃO:** "Na câmara, o combustível atinge 1700 graus Celsius." | emoção=CHOCADO
- **SFX:** fire_crackle@16.0 vol=0.8 pitch=1.0 | explosion_rumble@19.0 vol=0.6 pitch=0.8
- **TRANSIÇÃO_SAÍDA:** PULL_BACK duração=1.8s alvo=CENA_5
- **VALIDAÇÃO_CDP:** CAM_FRUSTUM, CHAR_VISIBLE, SPOT_ACTIVE, SCALE_VALID

## CENA 5 — TURBINA_EXTRACAO
- **NÍVEL:** MICRO
- **DURAÇÃO:** 5.0s (22.0–27.0)
- **CÂMERA:** pos=[0,0.3,2.2] lookAt=[0,0.2,0] fov=30 shake=0.015
- **COMPONENTE_DESTAQUE:** turbina_discos | cor=#FFD700 | emissive_pulse=2.5Hz
- **PERSONAGEM:** estado=DENTRO escala=0.25x dança=null
- **NARRAÇÃO:** "Os gases quentes giram a turbina que alimenta o compressor." | emoção=TENSO
- **SFX:** metal_clank@22.0 vol=0.5 pitch=1.0 | turbine_spin@24.0 vol=0.6 pitch=1.2
- **TRANSIÇÃO_SAÍDA:** PULL_BACK duração=2.0s alvo=CENA_6
- **VALIDAÇÃO_CDP:** CAM_FRUSTUM, CHAR_VISIBLE, SPOT_ACTIVE, SCALE_VALID

## CENA 6 — ESCAPE_JATO
- **NÍVEL:** SUB
- **DURAÇÃO:** 5.0s (27.0–32.0)
- **CÂMERA:** pos=[0,1,4] lookAt=[0,0.8,-1] fov=35 shake=0.01
- **COMPONENTE_DESTAQUE:** bocal_escape | cor=#FF6B35 | emissive_pulse=4.0Hz
- **PERSONAGEM:** estado=SAINDO escala=0.8x dança=null
- **NARRAÇÃO:** "O escape expulsa gases a 2000 km/h gerando empuxo." | emoção=TRIUNFANTE
- **SFX:** jet_blast@27.0 vol=0.9 pitch=1.0 | whoosh@30.0 vol=0.7 pitch=1.3
- **TRANSIÇÃO_SAÍDA:** ZOOM_OUT duração=2.5s alvo=CENA_7
- **VALIDAÇÃO_CDP:** CAM_FRUSTUM, CHAR_VISIBLE, SPOT_ACTIVE, SCALE_VALID

## CENA 7 — TURBINA_FUNCIONANDO_TESTE
- **NÍVEL:** RE-EXP
- **DURAÇÃO:** 6.0s (32.0–38.0)
- **CÂMERA:** pos=[0,2,9] lookAt=[0,1,0] fov=42 shake=0.0
- **COMPONENTE_DESTAQUE:** turbina_completa | cor=#39FF14 | emissive_pulse=1.0Hz
- **PERSONAGEM:** estado=COMEMORANDO escala=1.2x dança=Victory_Wiggle
- **NARRAÇÃO:** "Admissão, compressão, combustão, escape. Ciclo completo!" | emoção=TRIUNFANTE
- **SFX:** success_chime@32.0 vol=0.5 pitch=1.0 | turbine_full@34.0 vol=0.4 pitch=1.0
- **TRANSIÇÃO_SAÍDA:** CROSSFADE duração=1.5s alvo=CENA_8
- **VALIDAÇÃO_CDP:** CAM_FRUSTUM, CHAR_VISIBLE, LIGHT_MIN, LIGHT_MAX

## CENA 8 — CTA_ENGENHARIA
- **NÍVEL:** MACRO
- **DURAÇÃO:** 5.0s (38.0–43.0)
- **CÂMERA:** pos=[0,1.5,6] lookAt=[0,1.2,0] fov=40 shake=0.0
- **COMPONENTE_DESTAQUE:** null
- **PERSONAGEM:** estado=COMEMORANDO escala=1.0x dança=Happy_Spin
- **NARRAÇÃO:** "Qual motor você quer ver desmontado? Comenta aí!" | emoção=TRIUNFANTE
- **SFX:** pop@38.0 vol=0.4 pitch=1.2
- **TRANSIÇÃO_SAÍDA:** FADE_TO_BLACK duração=2.0s alvo=CENA_9
- **VALIDAÇÃO_CDP:** CAM_FRUSTUM, CHAR_VISIBLE

## CENA 9 — BLACK_FADE
- **NÍVEL:** N/A
- **DURAÇÃO:** 2.0s (43.0–45.0)
- **CÂMERA:** pos=[0,1.5,6] lookAt=[0,1.2,0] fov=40 shake=0.0
- **COMPONENTE_DESTAQUE:** null
- **PERSONAGEM:** estado=OBSERVANDO escala=1.0x dança=null
- **NARRAÇÃO:** "" | emoção=NEUTRO
- **SFX:** silence
- **TRANSIÇÃO_SAÍDA:** END
- **VALIDAÇÃO_CDP:** NONE

---

### Notas de Produção ASD-STE100
- **Ambiente único:** Bancada de laboratório com piso quadriculado, iluminação focal de estúdio.
- **Zero elementos DOM:** Toda informação é geometria 3D ou omitida.
- **Destaque luminoso:** Cada componente citado acende com emissive pulse + spotlight dedicada + dimming global.
- **Personagem ativo:** Encolhe para entrar na turbina, explora internamente, sai triunfante e faz dança cômica.
- **Áudio procedural:** Web Audio API puro, zero arquivos externos, ducking automático durante narração.
- **CDP Pre-Flight:** Validação automática de 8 checks antes de cada render.