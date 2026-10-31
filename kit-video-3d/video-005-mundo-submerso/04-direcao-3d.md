# 🎥 DIREÇÃO DE CÂMERA 3D — Multi-Plano Cinematográfico

## Princípio Fundamental
Cenário persistente único (sem `clearSceneObjects()`). Transições por mutação de estado: nível da água, iluminação, clima e posição do personagem interpolados suavemente entre cenas.

## Planos de Câmera (8 Cenas + Fade)

### 1. Hook — Medium Close-Up (0-5s)
- **Posição:** [0.32, 1.45, 4.25]
- **LookAt:** [0.0, 1.28, 2.0]
- **FOV:** 38°
- **Shake:** 0.0 (estática)
- **Intenção:** Destacar rosto expressivo do Leo, olhos e moletom amarelo. Fundo urbano desfocado.

### 2. Sound — Plano Médio Lateral (5-10s)
- **Posição:** [-1.05, 1.52, 4.95]
- **LookAt:** [0.0, 1.35, 1.6]
- **FOV:** 42°
- **Shake:** 0.015 (vento sutil)
- **Intenção:** Mostrar pássaros fugindo no céu escurecendo. Ângulo revela tensão atmosférica.

### 3. Wall — Low-Angle Dramático (10-16s)
- **Posição:** [1.15, 1.18, 4.55]
- **LookAt:** [-0.25, 1.05, 1.4]
- **FOV:** 45°
- **Shake:** 0.03 (água subindo)
- **Intenção:** Enfatizar altura do muro d'água. Carros começando a boiar nos pés do Leo.

### 4. Rooftop — Plano Heroico (16-22s)
- **Posição:** [0.65, 5.75, 2.95]
- **LookAt:** [-1.45, 5.15, -0.5]
- **FOV:** 44°
- **Shake:** 0.02 (correnteza)
- **Intenção:** Leo no telhado da escola vendo caos abaixo. Profundidade vertical dramática.

### 5. Dark — Close-Up Tenso (22-28s)
- **Posição:** [-0.85, 5.68, 1.65]
- **LookAt:** [-1.75, 5.55, -0.5]
- **FOV:** 36°
- **Shake:** 0.035 (tempestade)
- **Intenção:** Iluminação apenas pela lanterna da mochila. Relâmpagos iluminam cena brevemente.

### 6. Sea — Plano Aberto Cinematográfico (28-35s)
- **Posição:** [0.95, 6.25, 3.45]
- **LookAt:** [-1.5, 5.05, -0.8]
- **FOV:** 46°
- **Shake:** 0.015 (ondas grandes)
- **Intenção:** Revelar cidade submersa até o horizonte. Imensidão do oceano.

### 7. Shark — Enquadramento Duplo (35-42s)
- **Posição:** [-3.15, 6.15, 2.45]
- **LookAt:** [-0.55, 4.45, 0.55]
- **FOV:** 44°
- **Shake:** 0.025 (tensão)
- **Intenção:** Leo no telhado + tubarão nadando na fachada da escola ao fundo. Dualidade perigo/observador.

### 8. CTA — Hero Close-Up (42-48s)
- **Posição:** [-1.15, 5.66, 1.82]
- **LookAt:** [-1.75, 5.52, -0.5]
- **FOV:** 36°
- **Shake:** 0.0 (estática)
- **Intenção:** Leo encara a lente ao amanhecer. Conexão direta com espectador. Pergunta final.

### 9. Fade — Blackout (48-50s)
- **Posição:** [-1.15, 5.66, 1.95] (mantém última posição)
- **LookAt:** [-1.75, 5.52, -0.5]
- **FOV:** 36°
- **Shake:** 0.0
- **Intenção:** Fade to black gradual. Exposição reduzida linearmente até zero.

## Direção de Iluminação

### Key Light (Luz Principal)
- **Cena 1-2:** Sol quente (5500K), intensidade 1.2, ângulo 45° superior esquerdo
- **Cena 3-4:** Céu nublado (6500K), intensidade 0.9, difusa
- **Cena 5:** Noturna emergencial (3200K), intensidade 0.3, intermitente (relâmpagos)
- **Cena 6-7:** Tempestade (7500K), intensidade 0.6, fria e dura
- **Cena 8:** Amanhecer (4500K), intensidade 1.0, dourada lateral

### Ambient Light
- **Cena 1-2:** Azul claro (#B0D4E8), intensidade 0.5
- **Cena 3-4:** Cinza azulado (#7A8B99), intensidade 0.4
- **Cena 5:** Azul escuro (#1A2B3D), intensidade 0.15
- **Cena 6-7:** Azul profundo (#0F1E2E), intensidade 0.25
- **Cena 8:** Laranja suave (#F4D4A0), intensidade 0.45

### Rim Light (Fresnel)
- **Cor:** Azul claro (#87CEFA) constante em todas as cenas
- **Intensidade:** 0.8
- **Propósito:** Separar personagem do fundo, destacar silhueta cel-shaded
- **Shader:** Fresnel power 3.2, bias 0.15

## Movimento de Câmera
- **Push-in Lento:** 0.04 unidades/segundo em direção ao LookAt (acumula até 0.22)
- **Handheld Sutil:** Senoide em X (freq 9.0Hz) e cosseno em Y (freq 11.0Hz) multiplicado por fator shake
- **Transições:** Lerp de 45% em cortes de cena, 100% * dt * 2.8 durante continuidade

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>