import fs from 'node:fs';
import { buildYoutubeViralKit } from './generate-youtube-kit.mjs';

const timing = JSON.parse(fs.readFileSync('src/comboTiming.json', 'utf8'));

const beatTitles = [
  'A Encarada de Campeonato',
  'Trocação Alucinante: Jab, Direto e Esquiva',
  'O Contra-Ataque Brutal no Fígado (3200 N)',
  'A Brecha Fatal na Guarda',
  'Raio-X: Torque Rotacional e Tronco Encefálico',
  'Nocaute Absoluto em Dois Atos'
];

const beatsWithTitles = timing.beats.map((b, i) => ({
  ...b,
  chapterTitle: beatTitles[i] || `Parte ${i + 1}`
}));

const kit = buildYoutubeViralKit({
  slug: 'combo-mortal',
  themeTitle: 'O Combo Que Desliga Qualquer Humano: Fígado e Queixo em 3D',
  titles: [
    'O Combo Que DESLIGA Qualquer Lutador em 2 Segundos! (Biomecânica 3D) 🥊⚡',
    'Por Que o Golpe no Fígado + Gancho no Queixo é FATAL? (Raio-X 3D) 💀',
    'A Física da Esquiva e do Contra-Ataque Perfeito no Boxe! 🔬🥊',
    'O Que Acontece com o Fígado e o Cérebro no Combo de Nocaute? (3D) 🧠',
    'Nocaute em 2 Atos: A Biomecânica da Maior Combinação da Luta! 💥'
  ],
  hookLine: 'Você sabe por que a combinação de soco no fígado seguida de gancho no queixo é considerada o combo mais indefensável da história das artes marciais? A física e a anatomia explicam em 3D!',
  summaryParagraphs: [
    'Nesta animação 3D de alta octanagem com o nosso novo manequim anatômico profissional, dissecamos a biomecânica de uma trocação real: jab, direto, esquiva bob & weave de elite e o contra-ataque duplo devastador.',
    'Veja em visão de Raio-X multicamadas como o impacto de 3200 N sob o arco costal comprime o fígado e ativa o reflexo vasovagal drenando o oxigênio e forçando a guarda a cair — abrindo a brecha perfeita para o gancho com torque rotacional que desliga o tronco encefálico.'
  ],
  beats: beatsWithTitles,
  tags: [
    'combo no boxe',
    'soco no figado',
    'gancho no queixo',
    'biomecanica do boxe',
    'nocaute 3d',
    'esquiva bob and weave',
    'anatomia da luta',
    'raio x combate',
    'mma ufc nocaute',
    'ciencia do combate',
    'curiosidades de luta',
    'ultimato ai',
    'como funciona o nocaute'
  ],
  hashtags: [
    '#Shorts',
    '#Boxe',
    '#MMA',
    '#UFC',
    '#Nocaute',
    '#Ciencia',
    '#Biomecanica',
    '#Anatomia',
    '#Luta'
  ],
  thumbnailPrompt: 'Cena de impacto épica em 3D vertical com dois lutadores esculpidos em alabastro acetinado. O atacante vermelho conecta um gancho no fígado do defensor azul, com o tórax translúcido revelando o fígado e as costelas iluminados por onda de choque bioelétrica. Texto em amarelo chamativo: "O COMBO FATAL".'
});

console.log('✅ Kit Viral do Combo Mortal gerado com sucesso:');
console.log(`   -> ${kit.outMdPath}`);
