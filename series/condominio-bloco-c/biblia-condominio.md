# Bíblia da Série: CONDOMÍNIO SOLARIS — BLOCO C ("Você Decide o Fim")

## 1. Por Que Este Tema Prende Qualquer Pessoa no Primeiro Segundo?
- **Identificação Cotidiana 100% Real:** Todo mundo já desceu de chinelo e moletom à noite para buscar uma entrega na portaria, já entrou num elevador silencioso de madrugada ou já viu mensagens estranhas no grupo de WhatsApp do prédio/bairro.
- **Cenário Familiar Transformado em Mistério:** Um prédio residencial comum de classe média brasileira (Bloco C, 8 andares, portaria com eclusa de grade dupla, guarita com câmeras de segurança, garagem no subsolo e elevador social).
- **O Gancho Inicial (Terça-feira, 23:42):**
  - Você (morador do 302) desce de moletom e chinelo para pegar seu lanche na portaria.
  - Quando chega no térreo, as duas grades da eclusa travam eletronicamente. Lá fora, uma neblina densa cobre a rua e todos os postes e prédios vizinhos apagaram.
  - No grupo de WhatsApp **"Condomínio Solaris — Bloco C"**, o síndico manda um áudio trêmulo e fixa 3 regras urgentes.

---

## 2. Elenco Fixo (Arquivos Modulares Individuais em `characters/`)

### 1. `VoceMorador.js` — Você (Morador do Apto 302, 24 anos)
- **Visual 2D:** Moletom azul-petróleo com capuz e cordões, dobras de tecido sombreadas, bermuda cargo cinza-escuro, meias brancas e chinelo, segurando o smartphone aceso na mão direita e o chaveiro do apê na esquerda.
- **Papel:** Protagonista narrado em 2ª pessoa. É quem toma as decisões votadas nos comentários.

### 2. `SeuValdirPorteiro.js` — Seu Valdir (Porteiro da Noite, 61 anos)
- **Visual 2D:** Camisa social azul-clara de portaria, colete azul-marinho e gravata escura, cabelo grisalho penteado, bigode espesso, óculos de grau com reflexo dos monitores de CFTV, segurando o rádio HT e o molho de chaves da portaria.
- **Personalidade:** Trabalha no prédio há 18 anos. Calmo, conhece cada barulho da tubulação e cada morador pelo passo.
- **Detalhe de Continuidade:** Tem um molho com 7 chaves na cintura, mas a chave do quadro de força fica trancada no armário da guarita.

### 3. `CamilaVizinha.js` + `PacocaCachorro.js` — Camila (Vizinha do 204, 25 anos) & Paçoca (Vira-Lata Caramelo)
- **Visual 2D (Camila):** Casaco corta-vento amarelo-mostarda sobre camiseta preta, calça jeans, tênis casual, cabelo castanho ondulado em camadas vetoriais, segurando a guia vermelha do cachorro.
- **Visual 2D (Paçoca):** Cachorro vira-lata caramelo clássico brasileiro, pelagem dourada sombreada, focinho escuro, orelhas caídas articuladas (que levantam quando sente perigo) e coleira vermelha.
- **Papel:** Os animais sentem antes dos humanos. Sempre que o Paçoca trava as quatro patas e rosna para uma porta ou para o fosso do elevador, algo está do outro lado.

### 4. `LucasEntregador.js` — Lucas (Entregador de Aplicativo, 22 anos)
- **Visual 2D:** Jaqueta preta e vermelha de motociclista com faixas refletivas prateadas no peito e braços, mochila térmica quadrada vermelha (`Bag de Entrega`) nas costas, capacete esportivo seguro no braço esquerdo e pacote de papel kraft do lanche na mão direita.
- **Situação no Ep 1:** Ficou trancado **no meio da eclusa** (entre a grade da rua e a grade interna da recepção) porque a trava magnética congelou quando a rua escureceu.

---

## 3. Cenários Reutilizáveis da Série (Arquivos Modulares em `scenarios/`)

1. **`PortariaBlocoC.js` (Cenário 01 — Térreo):**
   - Recepção de porcelanato polido com reflexo, parede ripada de madeira com letreiro `"BLOCO C"`, guarita blindada com monitores de CFTV, eclusa de grade dupla dando para a rua chuvosa/nebulosa e elevador social ao fundo.
2. **`CorredorElevadores.js` (Cenário 02 — Hall e Escadaria):**
   - Hall dos elevadores (Social e Serviço), painel digital vermelho marcando o andar, porta corta-fogo pesada com barra antipânico, extintor de parede e sensores de presença no teto.
3. **`GaragemSubsolo.js` (Cenário 03 — Subsolo G1):**
   - Colunas de concreto com pintura zebrada amarela e preta, carros estacionados na penumbra, tubulações de incêndio vermelhas no teto, quadro geral de disjuntores e rampa do portão basculante.

---

## 4. Regras de Sobrevivência do Condomínio (Acumulativas por Episódio)

- **Regra 1 (Dia 1):** Não abra o portão externo para ninguém que venha da neblina da rua sem antes olhar o reflexo da pessoa pelo vidro da guarita.
- **Regra 2 (Dia 1):** Se o elevador social descer sozinho do 4º andar (que está desocupado para reforma) e abrir a porta vazio, não entre e não deixe a porta fechar sem travar o botão.
- **Regra 3 (Dia 2):** Se o interfone tocar vindo do próprio apartamento onde você mora, não atenda.

---

## 5. Regras Rígidas de Rigging 2D & Anatomia dos Personagens

1. **Orientação Padrão — 100% Frontal:**
   - O protagonista ("Você") e Seu Valdir devem permanecer **sempre de frente** (`viewMode: 'front'`) durante repouso, tensão, observação e diálogos.
   - O modo perfil (`profile`) é **estritamente restrito ao ato de caminhar/andar** (`this.isWalking === true`). Logo que o personagem para de andar, o rig deve voltar imediatamente para a visão frontal.
2. **Eliminação de Braços Fantasmas / Mangas Duplicadas:**
   - No modo perfil de caminhada, o rig possui rigorosamente 2 braços:
     - `Braço Traseiro` desenhado **antes** da camada do tronco (atrás do corpo).
     - `Tronco` com camisa/moletom e gola.
     - `Braço Dianteiro` desenhado sobre o tronco, sustentando o smartphone com iluminação ciano.
     - Proibido desenhar cópias do braço ou ombros duplicados sobre o peito.
3. **Calibração de Abertura Labial (Lip-Sync Natural):**
   - Altura máxima de abertura labial limitada a ~3.6px para Você e ~4.0px para Seu Valdir.
   - Proibido qualquer rasgo escuro cavernoso invadindo o queixo ou o cavanhaque. Movimento sutil, sincronizado com os visemas de áudio.

---

## 6. Registro de Continuidade Acumulativa (Canon Ledger)

| Elemento de Cena | Estado no Ep. 01 | Estado no Ep. 02 | Estado para Ep. 03+ |
| :--- | :--- | :--- | :--- |
| **Porta da Guarita** | Aberta | Trancada com 3 ferrolhos de aço | Permanece trancada; precisa de chave mestra para abrir |
| **Vidro Blindado** | Intacto | Trincado por 3 pancadas brutais (41.5s) | Teia de rachaduras visível e fragilizada |
| **Luz de Emergência** | Desligada | Ativada girando em vermelho (41.5s) | Permanece girando em vermelho |
| **Câmera CAM 02** | Estática leve | Criatura de 2.20m visível na eclusa | Grade entortada com marcas de garras |
| **Energia Externa** | Apagão total na rua | Apagão contínuo + neblina densa | Neblina subindo para o 1º andar |

---

## 7. Direção de Câmera & Cortes Narrativos

- **Câmera Imersiva com Planos de Ação:**
  - Além dos planos gerais da portaria e da guarita, momentos cruciais de tensão cortam para **câmeras táticas em tela cheia** (ex: CCTV CAM 02 em tela cheia de 36.6s a 41.4s).
  - O corte em tela cheia da câmera de segurança permite ao espectador ver exatamente a ameaça de frente (criatura de 2.20m com olhos vermelhos brilhantes entre a neblina e as barras de ferro), elevando o suspense e a retenção do vídeo.
- **Janela de Decisão Interativa (> 1 Minuto de Duração):**
  - Episódios têm duração superior a 1 minuto (ex: Ep 02 com 68.0s).
  - Janela de leitura e decisão com no mínimo 16 segundos, cronômetro decrescente destacado no topo e cards em alto contraste para os comentários decidirem o próximo rumo da história.

---

## 8. Arquitetura de Vozes & Roadmap Técnico

### A Limitação Real Atual (Diagnóstico de Engenharia)
- **Microsoft Edge TTS (Offline/CLI):** No ecossistema gratuito de TTS da Microsoft, existe apenas **uma única voz masculina brasileira natural** disponível: `pt-BR-AntonioNeural`. As outras são femininas (`pt-BR-FranciscaNeural`, `pt-BR-ThalitaNeural`). Por essa razão, ao gerar vozes masculinas diferentes apenas via filtros matemáticos de pitch/taxa de áudio no Edge TTS, o timbre base permanece reconhecível como a mesma pessoa.
- **Amostra de Áudio Pessoal (`user_cloned_voice.wav`):** A gravação de 8 segundos enviada pelo usuário é uma amostra crua de áudio. Um arquivo de áudio estático sozinho **não sintetiza novas palavras** — ele serve como arquivo de referência (*reference audio embedding*) para um modelo neural de clonagem de voz (*Zero-Shot Voice Cloning*).

### Soluções e Próximos Passos para Vozes 100% Realistas e Distintas:
1. **Opção A (Gravação Real do Criador — Maior Conexão e Humanidade):** O usuário grava as falas do protagonista "Você" no celular e as envia. A voz fica 100% autêntica, humana e sem qualquer traço sintético.
2. **Opção B (API ElevenLabs Neural Pro):** Integração com chave ElevenLabs via API, permitindo clonar a voz do usuário a partir da amostra `.wav` e utilizar vozes de atores consagrados para Seu Valdir e demais personagens.
3. **Opção C (VoiceStudio Neural Local — CosyVoice / XTTS-v2):** Ativação do motor neural do VoiceStudio com placa de vídeo dedicada (GPU RTX), processando o áudio de referência localmente com zero custo de API.
