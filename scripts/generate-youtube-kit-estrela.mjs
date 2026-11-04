import fs from 'node:fs';
import { buildYoutubeViralKit } from './generate-youtube-kit.mjs';

const timing = JSON.parse(fs.readFileSync('src/estrelaTiming.json', 'utf8'));

const beatTitles = [
  'Cabine 3D da Nave Valkyrie IX',
  'O Farol Pulsar de 700 Giros por Segundo',
  'Desarme Magnético (1 Quatrilhão de Gauss)',
  '1 Colher de Chá = O Peso do Monte Everest!',
  'Estrela Vampira Sugando Plasma Estelar',
  'Átomos Esticados como Agulhas Quânticas',
  'Terremoto Estelar na Crosta de Ferro',
  'Super-Explosão de Raios Gama (Magnetar Flare)',
  'Mergulho a 100.000 km/s Rumo ao Interior',
  'Raio-X Top-Down: A Massa Nuclear (Nhoque, Espaguete e Lasanha)',
  'Colisão Kilonova: A Fábrica de Ouro e Platina do Universo',
  'Retorno à Terra com um Tesouro Cósmico'
];

const beatsWithTitles = timing.beats.map((b, i) => ({
  ...b,
  chapterTitle: beatTitles[i] || `Ato ${i + 1}`
}));

const res = buildYoutubeViralKit({
  slug: 'estrela-neutrons',
  themeTitle: 'E Se Você Encontrasse uma Estrela de Nêutrons (Magnetar)? — Explicação 3D',
  titles: [
    'E SE VOCÊ CHEGASSE PERTO DE UMA ESTRELA DE NÊUTRONS?! 🧲⚡️ (Animação 3D)',
    '1 COLHER PESA IGUAL AO MONTE EVEREST! O Objeto Mais Extremo do Universo em 3D 🤯',
    'O Que Acontece Dentro de um MAGNETAR? (Massa Nuclear & Ouro Cósmico em 3D)',
    'O Ímã Mais Mortal do Universo: Como uma Estrela de Nêutrons Destrói Seus Átomos!',
    'De Onde Vem o OURO da Terra? O Segredo das Estrelas de Nêutrons em 3D! 🪙💥'
  ],
  hookLine: '🧲⚡️ O que aconteceria se a sua nave encontrasse uma ESTRELA DE NÊUTRONS (Magnetar) — o ímã mais extremo do universo, onde 1 colher de chá pesa tanto quanto o Monte Everest?! Veja em 12 cenários 3D!',
  summaryParagraphs: [
    'Nascida do colapso de uma estrela gigante em uma supernova, uma Estrela de Nêutrons comprime mais massa que o nosso Sol inteiro dentro de uma esfera de apenas 20 km de largura, girando até 716 vezes por segundo como um farol cósmico (Pulsar).',
    'Quando ela se torna um MAGNETAR, seu campo magnético atinge 1 quatrilhão de Gauss — forte o bastante para desmontar naves espaciais à distância, esticar os átomos do seu corpo em formato de agulhas finas e produzir a bizarra MASSA NUCLEAR (nhoque, espaguete e lasanha atômica) em seu interior, além de forjar ouro e platina puros ao colidir em uma Kilonova!'
  ],
  beats: beatsWithTitles,
  tags: [
    'estrela de neutrons',
    'magnetar',
    'pulsar',
    'o que e uma estrela de neutrons',
    'massa nuclear',
    'kilonova',
    'de onde vem o ouro',
    'gravidade estrela de neutrons',
    'astronomia 3d',
    'astrofisica explicada',
    'curiosidades do universo',
    'animacao 3d espaco',
    'buraco negro vs estrela de neutrons',
    'ciencia 3d',
    'shorts de astronomia'
  ],
  hashtags: [
    '#Shorts',
    '#EstrelaDeNeutrons',
    '#Magnetar',
    '#Astronomia',
    '#Universo',
    '#Ciencia',
    '#Animacao3D'
  ],
  thumbnailPrompt: 'Estrela de Nêutrons azul-elétrica brilhante com arcos magnéticos roxos e feixes de radiação gigantes, ao lado de uma colher de chá sustentando o Monte Everest e um astronauta 3D impressionado, texto amarelo vibrante "1 COLHER = EVEREST?!".'
});

console.log(`✅ Kit Viral do YouTube gerado com sucesso em: ${res.outMdPath}`);
