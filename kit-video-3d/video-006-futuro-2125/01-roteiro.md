# 🎬 ROTEIRO — "E Se Você Acordasse em 2125?"
## Nicho: Futurismo / Tecnologia Extrema
## Formato: Escalada narrativa progressiva ("O que aconteceria primeiro...")
## Duração: 48 segundos | ~135 palavras

---

### Texto Corrido (Pronto para Narrar)

E se você abrisse os olhos agora... mas fosse o ano 2125?

Primeiro: o silêncio. Mas não é paz. É ausência de som natural.

Depois: a luz. Não vem do sol. Vem de tudo. Paredes, chão, ar.

Você tenta andar. O chão responde. Muda de cor sob seus pés.

Uma voz fala dentro da sua cabeça. Sem fone. Sem alto-falante. Direto no cérebro.

Você olha pela janela. Carros voam em filas perfeitas. Sem motorista. Sem barulho.

Um drone pousa na sua varanda. Entrega café. Sorri. Sim, ele sorri.

A cidade respira. Prédios crescem e encolhem como pulmões vivos.

Ninguém usa celular. Ninguém digita. Tudo é pensamento.

Você percebe: não existe mais privacidade. Nem solidão.

Você ia querer ficar nesse futuro... ou voltaria para o caos de hoje?

---

### Tabela de Cenas (8 cenas + fade final)

| Cena | Tempo | Fala | Ambiente 3D (PERSISTENTE — mesma base, muda estado) | Câmera | Animação Interativa |
|---|---|---|---|---|---|
| 1-Hook | 0-5s | "E se você abrisse os olhos... mas fosse 2125?" | Quarto futurista escuro: paredes lisas, cama flutuante, luz ambiente suave azul | Estática frontal elevada (z=14) | Personagem acorda (pose idle→curious); luzes das paredes pulsam suavemente; partículas holográficas flutuam |
| 2-Silêncio | 5-10s | "Primeiro: o silêncio. Ausência de som natural." | MESMO quarto, luzes aumentam intensidade, janelas revelam céu artificial | Mesma posição | Personagem vira cabeça lentamente; hologramas de dados aparecem nas paredes; som ambiente visualizado como ondas luminosas |
| 3-Luz | 10-16s | "Depois: a luz. Vem de tudo." | MESMO quarto, piso e paredes brilham, cores mudam gradualmente | Mesma posição | Piso reage aos passos do personagem (ondas de luz); paredes exibem informações dinâmicas; personagem caminha explorando |
| 4-Chão | 16-22s | "O chão responde. Muda de cor." | MESMO quarto, piso interativo ativo, padrões geométricos luminosos | Mesma posição | Personagem anda pelo quarto; cada passo gera ripple de luz; móveis se rearranjam automaticamente; IA assistente aparece como holograma |
| 5-Voz | 22-28s | "Uma voz fala na sua cabeça." | MESMO quarto, holograma neural projetado ao redor da cabeça do personagem | Mesma posição | Anéis de luz orbitam a cabeça do personagem; expressão de surpresa; dados visuais fluem pelo ar; interface neural pulsa |
| 6-Janela | 28-35s | "Carros voam. Sem motorista." | MESMO quarto, janela panorâmica revela cidade futurista externa | Mesma posição | Veículos voadores passam em formação; prédios externos pulsam com luz; nuvens artificiais derivam; personagem observa da janela |
| 7-Drone | 35-42s | "Um drone entrega café. Ele sorri." | MESMO quarto, drone entra pela janela, bandeja flutuante | Mesma posição | Drone com animação de voo suave; rosto digital sorridente; vapor do café; personagem recebe com curiosidade; drone faz gesto amigável |
| 8-CTA | 42-48s | "Ficaria nesse futuro... ou voltaria?" | MESMO quarto, duas portas holográficas (FICAR / VOLTAR), iluminação dramática | Mesma posição | Portas pulsam alternadamente; personagem entre as duas opções; partículas de decisão flutuam; texto 3D rotaciona |
| 9-Fade | 48-50s | (silêncio) | Fade to black gradual | — | — |

---

### Notas de Produção — AMBIENTE PERSISTENTE FUTURISTA

**PRINCÍPIO FUNDAMENTAL:** O cenário é UM SÓ objeto Three.js persistente. NENHUM `clearSceneObjects()` entre cenas.

#### Transições por Mutação de Estado:
- **Iluminação:** Intensidade e cor das luzes ambientais interpoladas via lerp
- **Hologramas:** Opacidade e complexidade aumentam progressivamente
- **Piso interativo:** Ativação gradual do efeito ripple nos passos
- **Janela:** Revelação progressiva da cidade externa (fog density diminui)
- **Personagem:** Posição muda via animação procedural (acorda → explora → observa → decide)

#### Animações Interativas Obrigatórias:
- Personagem reage a cada descoberta (surpresa, curiosidade, medo, aceitação)
- Hologramas com física de partícula (flutuação, rotação, pulso)
- Piso reage à posição do personagem (ripple de luz nos passos)
- Drone com animação orgânica (hover suave, inclinação nas curvas)
- Cidade externa viva (veículos em movimento, prédios pulsantes)
- Interface neural visualizada como anéis orbitais ao redor da cabeça