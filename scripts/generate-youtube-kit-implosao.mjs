import fs from 'node:fs';
import { buildYoutubeViralKit } from './generate-youtube-kit.mjs';

const timing = JSON.parse(fs.readFileSync('src/implosaoTiming.json', 'utf8'));

const chapterTitles = [
  'O Abismo de 11.000 Metros',
  'A Pressão Monstruosa de 1.100 ATM',
  'Raio-X: O Casco Sob 1 Tonelada/cm²',
  'A Microfissura Oculta no Titânio',
  'A Implosão Supersônica em 20ms',
  'Colapso Total e Vácuo Abissal'
];

const beatsWithChapters = timing.beats.map((b, idx) => ({
  ...b,
  chapterTitle: chapterTitles[idx] || `Ato ${idx + 1}`
}));

const kit = buildYoutubeViralKit({
  slug: 'implosao-submarino',
  themeTitle: 'A Implosão Abissal a 11.000 Metros (Fossa das Marianas 3D)',
  titles: [
    'O Que Realmente Acontece Quando um Submarino Implode a 11.000m? 🌊💥',
    'A Física Assustadora de Uma Implosão em 20 Milissegundos em 3D ⚠️',
    'Fossa das Marianas: O Que 1.100 Atmosferas Fazem Com o Corpo Humano?',
    'Por Que Uma Implosão Submarina Acontece Mais Rápido Que a Dor? 🧠⚡',
    'Desmontando a Implosão no Fundo do Oceano em Raio-X 3D!'
  ],
  hookLine: 'O que realmente acontece dentro de um submarino quando ele atinge a pressão brutal da Fossa das Marianas?',
  summaryParagraphs: [
    'A 11 mil metros de profundidade, na Fossa das Marianas, a coluna d’água exerce uma pressão titânica de 1.100 atmosferas — o equivalente a sustentar o peso da Torre Eiffel sobre o polegar.',
    'Neste vídeo em 3D com visão Raio-X de cima e física biomecânica, dissecamos milissegundo a milissegundo o momento em que o casco de titânio sofre uma microfissura, o ar interno superaquece adiabaticamente a mais de 5.000 graus Celsius e o colapso supersônico vaporiza a matéria em menos de 20 milissegundos — muito antes de qualquer sinal neural de dor chegar ao cérebro.'
  ],
  beats: beatsWithChapters,
  tags: [
    'fossa das marianas',
    'implosao submarino',
    'titan submarino',
    'animacao 3d',
    'fisica da implosao',
    'oceano profundo',
    'curiosidades cientificas',
    'ciencia em 3d',
    'pressao atmosferica',
    'abismo oceanico',
    'shorts ciencia',
    'biomecanica'
  ],
  hashtags: [
    '#Shorts',
    '#Ciencia',
    '#FossaDasMarianas',
    '#Fisica',
    '#Animacao3D',
    '#Curiosidades',
    '#Oceano'
  ],
  thumbnailPrompt: 'Close 3D cinematográfico e dramático de um submarino de pesquisa no abismo negro do oceano, com casco semi-transparente estilo Raio-X emanando luz ciano interna, rachaduras vermelhas luminosas de alta tensão no titânio e setas volumétricas carmesim de pressão esmagadora, com bolhas colapsando em flash dourado de sonoluminescência.'
});

console.log('✅ YouTube Kit gerado com sucesso em:', kit.outMdPath);
