# 🎬 ROTEIRO — FASE 2 (Storyboard)
## Tema: E Se Você Voltasse 10 Segundos no Tempo?
## Formato: E se... (superpoder)
## Nicho: Curiosidades
---
### 1) Três Opções de Gancho
1. E se você pudesse voltar exatamente dez segundos no tempo?
2. Você acaba de ganhar o poder de rebobinar dez segundos da sua vida.
3. E se cada erro seu viesse com um botão de voltar?
---
### 2) Roteiro em Blocos (Cenas Programáticas)
| Bloco | Fala | Duração (s) | Componente React/Remotion | Efeito Especial Programático | Número em destaque |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Gancho | E se você pudesse voltar exatamente dez segundos no tempo? | 4s | `<HookScene />` | Relógio SVG girando reverso com `spring()`, partículas de tempo voando | "10s" grande teal |
| 1 | Seu café cai da mesa... e você já está segurando antes de cair. | 7s | `<Scene1Coffee />` | Xícara caindo reverso com `interpolate()`, líquido voltando para dentro | Nenhum |
| 2 | Na rua, você desvia do carro antes dele buzinar. | 7s | `<Scene2Street />` | Carro avançando, protagonista pulando para trás com motion trail | Nenhum |
| 3 | No jogo, você volta e marca o gol que tinha perdido. | 7s | `<Scene3Goal />` | Bola voltando no tempo, protagonista chutando de novo com glow | Nenhum |
| Virada | Só que toda vez que você volta... algo muda sem você perceber. | 8s | `<Scene4Loop />` | Tela glitchando, cores invertendo, personagem duplicando com offset | Nenhum |
| Pergunta | Você usaria esse poder... ou teria medo do que ele muda? | 5s | `<Scene5CTA />` | Protagonista olhando para câmera, duas opções flutuando (USAR / MEDO) | Nenhum |
**Duração total estimada:** ~38 segundos de fala / ~45s com pausas dramáticas.
**Contagem de palavras:** 118 palavras (dentro da faixa 110-160). ✅
---
### 3) Texto Corrido (Pronto para Narrar)
E se você pudesse voltar exatamente dez segundos no tempo? Seu café cai da mesa... e você já está segurando antes de cair. Na rua, você desvia do carro antes dele buzinar. No jogo, você volta e marca o gol que tinha perdido. Só que toda vez que você volta... algo muda sem você perceber. Você usaria esse poder... ou teria medo do que ele muda?
---
### 4) Fontes
- Este roteiro é uma **hipótese ficcional** (formato "E se..."). Não há fatos reais que exijam citação.
- A estrutura narrativa segue o modelo de storytelling de vídeos curtos virais baseado em retenção por curiosidade e dilema moral no terço final.
- Referência de formato: Kit de Prompts "Histórias narradas em 3D" (seção 9 — Exemplo pronto).
---
### 5) Notas de Produção (Video-as-Code)
- Cada frase vira UMA cena programática clara com componente React dedicado
- Zero imagens externas — tudo renderizado via Remotion com CSS/SVG/Three.js
- Animações usam `spring()` e `interpolate()` da Remotion para fluidez 60fps
- Efeitos especiais: motion blur via CSS filter, glitch via clip-path, partículas via canvas
- Áudio sincronizado via `<Audio />` com ducking dinâmico
- Personagem mestre usado como sprite estático (`public/character-master.png`) com animações CSS overlay