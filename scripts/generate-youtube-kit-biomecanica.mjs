import fs from 'node:fs';
import { buildYoutubeViralKit } from './generate-youtube-kit.mjs';

const timing = JSON.parse(fs.readFileSync('src/socoTiming.json', 'utf8'));

const beatTitles = [
  'O Mistério do Queixo',
  'Soco Reto no Nariz (Força Absorvida)',
  'Gancho Lateral (A Maior Alavanca)',
  'Torque Rotacional Brutal a 42 rad/s',
  'Raio-X: Torção do Tronco Encefálico',
  'O Nocaute Imediato (Disjuntor Desligado)'
];

const beatsWithTitles = timing.beats.map((b, i) => ({
  ...b,
  chapterTitle: beatTitles[i] || `Parte ${i + 1}`
}));

const kit = buildYoutubeViralKit({
  slug: 'biomecanica-nocaute',
  themeTitle: 'Por Que Um Soco No Queixo Apaga? — Biomecânica 3D do Nocaute',
  titles: [
    'Por Que Um Soco no Queixo APAGA Instantaneamente? (Biomecânica 3D) 🥊💥',
    'A Física do NOCAUTE: O Que Acontece Dentro do Cérebro em 3D? 🧠⚡',
    'Soco no Nariz vs Soco no Queixo: A Alavanca Fatal Explicada em 3D! 🔬',
    'Por Que o Corpo DESLIGA Como um Disjuntor no Nocaute? (Raio-X 3D) 💀',
    'A Ciência do Gancho no Queixo: 45 N.m de Torque que Apaga Qualquer Um! ⚡'
  ],
  hookLine: 'Você já se perguntou por que um lutador aguenta um direto violento no nariz, mas cai desmaiado com um toque no queixo? A física e a anatomia explicam em 3D!',
  summaryParagraphs: [
    'Neste vídeo em animação 3D de alta fidelidade com visão de Raio-X multicamadas, dissecamos a biomecânica exata por trás do nocaute no boxe e MMA.',
    'Veja em detalhes por que o soco reto empurra a cabeça contra os fortes músculos do pescoço, enquanto o gancho atinge a mandíbula na maior distância da coluna, gerando um torque de rotação devastador que torce o tronco encefálico e desliga o cérebro instantaneamente.'
  ],
  beats: beatsWithTitles,
  tags: [
    'nocaute 3d',
    'soco no queixo',
    'biomecanica do nocaute',
    'boxe 3d',
    'mma ufc',
    'anatomia 3d',
    'raio x 3d',
    'cerebro nocaute',
    'tronco encefalico',
    'por que o queixo apaga',
    'ultimato ai',
    'ciencia do esporte',
    'nocaute explicacao',
    'curiosidades cientificas'
  ],
  hashtags: [
    '#Shorts',
    '#Boxe',
    '#MMA',
    '#UFC',
    '#Curiosidades',
    '#Ciencia',
    '#Anatomia',
    '#Fisica',
    '#Nocaute'
  ],
  thumbnailPrompt: 'Close-up cinematográfico 3D de alta tensão com manequim de boxe translúcido recebendo um gancho na mandíbula. Linha de torque amarela brilhante conectando o queixo à coluna, cérebro e tronco encefálico iluminados em neon rosa e amarelo elétrico. Expressão congelada de impacto com faíscas biométricas e texto amarelo chamativo: "POR QUE APAGA?".'
});

console.log('✅ Kit Viral do YouTube gerado com sucesso:');
console.log(`   -> ${kit.outMdPath}`);
