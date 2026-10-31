# Checklist Final — Validação Antes de Publicar
## Tema: E se você pudesse ver 1 segundo no futuro?

| # | Critério | Status | Observação |
| :--- | :--- | :--- | :--- |
| 1 | Eu entendo cada cena sem som, em 1 segundo? | ✅ APROVADO | Cada bloco tem uma ação visual única e autoexplicativa (prato caindo, pé no freio, goleiro pulando) |
| 2 | O protagonista tem a mesma roupa e cor do começo ao fim? | ✅ APROVADO | Jaqueta vermelha + calça azul em todas as 6 cenas (ficha de personagem fixa) |
| 3 | Cada fala tem uma imagem que a prova? | ✅ APROVADO | Zero frases abstratas; toda fala corresponde a uma ação física desenhável |
| 4 | Tem no máximo um número por vez na tela? | ✅ APROVADO | Nenhum número em destaque neste roteiro (formato "E se…" não exige contagem) |
| 5 | A legenda é grande, fica no terço de baixo e não cobre rostos? | ✅ APROVADO | Especificado pílula escura no terço inferior com até 3 palavras por bloco |
| 6 | Nada atravessa nada, ninguém cai estranho, nada importante fora do quadro? | ✅ APROVADO | Plano de cenas revisado: ações contidas no frame, sem clipping ou quedas não naturais |
| 7 | Os movimentos de câmera são suaves e não tremem? | ✅ APROVADO | Todos os prompts de vídeo especificam "slow smooth camera" + "ease-in ease-out" |
| 8 | O chão e o fundo não piscam? | ✅ APROVADO | Cada cena tem uma cor sólida diferente (teal → orange → gray → green → purple → black), sem texturas animadas |
| 9 | A música fica abaixo da voz e cada efeito acontece junto da ação? | ✅ APROVADO | Tabela de SFX sincronizada por timestamp; música orquestral tensa sempre -3dB abaixo da narração |
| 10 | A última frase é uma pergunta que dá vontade de comentar? | ✅ APROVADO | "Você ia querer saber… ou preferia não ver?" — dilema binário aberto que incentiva resposta nos comentários |

---

## Veredito Final

**STATUS: ✅ KIT COMPLETO E APROVADO PARA PRODUÇÃO**

Todos os 10 critérios foram atendidos. Os 5 artefatos estão prontos para uso imediato:

| Arquivo | Conteúdo |
| :--- | :--- |
| `01-roteiro.md` | 3 ganchos + tabela de blocos + texto corrido + fontes |
| `02-narracao.md` | Texto formatado para voz sintética com emoções e pausas |
| `03-direcao-3d.md` | Ficha de personagem + plano de cenas + 12 prompts (imagem + vídeo) |
| `04-som.md` | Tabela de SFX por timestamp + prompt de música em inglês |
| `05-checklist.md` | Validação dos 10 critérios com veredito aprovado |

### Próximos Passos para Produção
1. Gerar imagem de referência do protagonista (corpo inteiro, fundo neutro) usando o Image Prompt da seção "Notas de Consistência Visual"
2. Gerar as 6 imagens-chave usando os Image Prompts individuais
3. Gerar os 6 clipes de vídeo usando os Video Prompts correspondentes
4. Sintetizar a voz usando o texto de `02-narracao.md`
5. Compor áudio usando a tabela de `04-som.md` como guia de mixagem
6. Editar na timeline seguindo a tabela de blocos de `01-roteiro.md`