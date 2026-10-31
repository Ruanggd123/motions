import fs from 'node:fs';
import { buildYoutubeViralKit } from './generate-youtube-kit.mjs';

const timing = JSON.parse(fs.readFileSync('src/teletransporteTiming.json', 'utf8'));

const chapterTitles = [
  'A Máquina de Teletransporte em Casa',
  'Cápsula de Partida vs Cápsula de Destino',
  'O Scanner Laser Atômico',
  'O Cabo de Emaranhamento Quântico',
  'O Preço Físico: Desfazendo o Original',
  'A Reconstrução até a Última Memória',
  'Quem Saiu de Lá É Mesmo Você?',
  'E Se o Scanner Falhar em Apagar o Original?',
  'Dois Vocês ao Mesmo Tempo!',
  'O Paradoxo Mortal da Primeira Cápsula',
  'A Impressora de Clones Quântica',
  'Você Entraria Nessa Máquina?'
];

const beatsWithChapters = timing.beats.map((b, i) => ({
  ...b,
  chapterTitle: chapterTitles[i] || `Ato ${i + 1}`
}));

const res = buildYoutubeViralKit({
  slug: 'teletransporte-quantico',
  themeTitle: 'O Paradoxo do Teletransporte — Você Viaja ou Morre? (Animação 3D)',
  titles: [
    'POR QUE O TELETRANSPORTE NA VERDADE TE MATA?! ⚡🧬 (Explicação 3D)',
    'O Paradoxo da Máquina de Teletransporte: Você Viaja ou Vira um Clone?! 🤯',
    'Você Entraria Nessa Máquina? O Segredo Sombrio do Teletransporte Quântico em 3D!',
    'O Que Acontece se a Máquina de Teletransporte Falhar? (Paradoxo em 3D)',
    'TELETRANSPORTE QUÂNTICO: Viajar no Espaço ou Imprimir uma Cópia Sua?'
  ],
  hookLine: '⚡🧬 Se você entrasse em uma máquina de teletransporte hoje, quem sairia do outro lado seria mesmo VOCÊ... ou apenas um clone perfeito com as suas memórias enquanto você morreu na primeira cápsula?!',
  summaryParagraphs: [
    'O Paradoxo do Teletransporte (formulado pelo filósofo Derek Parfit e baseado nas leis do Emaranhamento Quântico) revela um problema assustador: para teletransportar um ser humano na velocidade da luz, um scanner precisa ler a posição exata de cada átomo do seu corpo — o que fisicamente desfaz o corpo original para reconstruí-lo com átomos novos no destino.',
    'Mas o que acontece se o scanner ler os seus dados e FALHAR na hora de apagar o seu corpo original? Dois de você passam a existir ao mesmo tempo! Descubra nesta animação 3D em visão de Raio-X por que muitos cientistas chamam o teletransporte de "a máquina de suicídio e clonagem"!'
  ],
  beats: beatsWithChapters,
  tags: [
    'paradoxo do teletransporte',
    'maquina de teletransporte',
    'teletransporte quantico',
    'voce morre no teletransporte',
    'paradoxo do clone',
    'emaranhamento quantico',
    'fisica quantica',
    'curiosidades da ciencia',
    'animacao 3d ciencia',
    'derek parfit teletransporte',
    'paradoxo de teseu',
    'explicacao 3d',
    'shorts de ciencia',
    'misterios da fisica',
    'teletransporte humano'
  ],
  hashtags: [
    '#Shorts',
    '#Teletransporte',
    '#FisicaQuantica',
    '#Paradoxo',
    '#Ciencia',
    '#Curiosidades',
    '#Animacao3D'
  ],
  thumbnailPrompt: 'Duas cápsulas de vidro iluminadas (uma azul ciano e outra verde esmeralda) conectadas por um feixe de luz dourado: dentro das duas cápsulas estão dois personagens idênticos apontando um para o outro assustados, texto gigante amarelo "VOCÊ MORRE OU VIAJA?!"'
});

fs.copyFileSync(
  res.outMdPath,
  'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/youtube-kit-teletransporte-quantico.md'
);
console.log(`✅ Kit Viral do YouTube (Vídeo #2) gerado em: ${res.outMdPath}`);
