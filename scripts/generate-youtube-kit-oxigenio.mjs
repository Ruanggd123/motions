import fs from 'node:fs';
import { buildYoutubeViralKit } from './generate-youtube-kit.mjs';

const timing = JSON.parse(fs.readFileSync('src/oxigenioTiming.json', 'utf8'));

const beatTitles = [
  'A Pergunta Impossível: Aguenta 5 Segundos?',
  'O Céu Apaga no Meio-Dia (Vácuo Estelar)',
  'Pressão Despenca 21% e Tímpanos Explodem',
  'Concreto Vira Areia Fina (O2 é a Cola)',
  'Motores Morrem e Aviões Caem em Parafuso',
  'Sem Camada de Ozônio: Radiação UV Solar Crua',
  'Oceanos Viram Nuvens Gigantes de Gás Hidrogênio',
  'Solda a Frio: Metais Se Fundem ao Toque',
  '45% do Solo é Oxigênio: O Chão Some!',
  'Queda Livre no Abismo Magmático da Terra',
  'Os 5 Segundos Acabam: Onda de Choque Sônica',
  'A Terra Sobreviveu por um Triz! Você Aguentaria?'
];

const beatsWithTitles = timing.beats.map((b, i) => ({
  ...b,
  chapterTitle: beatTitles[i] || `Ato ${i + 1}`
}));

const res = buildYoutubeViralKit({
  slug: 'oxigenio-5-segundos',
  themeTitle: 'E Se a Terra Perdesse o Oxigênio por 5 Segundos?! — Simulação 3D',
  titles: [
    'E SE A TERRA PERDESSE O OXIGÊNIO POR APENAS 5 SEGUNDOS?! 😱🌍 (Simulação 3D)',
    'POR QUE 5 SEGUNDOS SEM OXIGÊNIO DESTRUIRIA O MUNDO?! 💥🧬 (Explicação 3D)',
    'O Que Acontece com Seu Corpo Sem Oxigênio por 5 Segundos? 🤯💨',
    'Você Não Duraria Nem 1 Segundo Sem Oxigênio! Veja o Porquê em 3D ⚡🏙️',
    'Prédios Viram Areia e Tímpanos Explodem: 5 Segundos Sem Oxigênio! 🌍🔥'
  ],
  hookLine: '😱🌍 Você acha que 5 segundos sem oxigênio não é nada porque consegue segurar o ar? Você não duraria nem o primeiro segundo! Veja o que aconteceria segundo a segundo em 12 cenários 3D!',
  summaryParagraphs: [
    'Muita gente pensa que 5 segundos sem oxigênio seria moleza porque um ser humano consegue prender a respiração por mais de um minuto. Mas a verdade é chocante: o oxigênio não serve apenas para respirar!',
    'Ele compõe 21% da pressão da nossa atmosfera, 100% da camada de ozônio protetora contra o Sol, é o ligante químico molecular que mantém todo o concreto do mundo de pé, forma a água dos oceanos (H2O) e compõe 45% de toda a crosta sólida da Terra. Sem ele por míseros 5 segundos, prédios esfarelam, tímpanos rompem pela descompressão, metais se fundem instantaneamente e o solo racha direto para o magma!'
  ],
  beats: beatsWithTitles,
  tags: [
    'e se a terra perdesse o oxigenio',
    '5 segundos sem oxigenio',
    'o que acontece se o oxigenio sumir',
    'curiosidades cientificas',
    'animacao 3d',
    'simulacao 3d',
    'oqueaconteceuse',
    'ciencia explicada',
    'curioso 3d',
    'efeitos do oxigenio',
    'oxigenio na terra',
    'shorts de ciencia',
    'curiosidades do mundo',
    'shorts virais'
  ],
  hashtags: [
    '#Shorts',
    '#Curiosidades',
    '#Ciencia',
    '#Animacao3D',
    '#Terra',
    '#Fisica',
    '#Curioso3D'
  ],
  thumbnailPrompt: 'Céu de dia preto como espaço sideral, prédios de concreto desmanchando em areia e poeira, fenda gigante com magma no chão e personagem 3D cobrindo as orelhas em pânico com cronômetro vermelho 05.00s e texto em letras amarelas 3D "5 SEGUNDOS SEM OXIGÊNIO?!".'
});

console.log(`✅ Kit Viral do YouTube gerado com sucesso em: ${res.outMdPath}`);
