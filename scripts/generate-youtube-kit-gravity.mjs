import fs from 'node:fs';
import { buildYoutubeViralKit } from './generate-youtube-kit.mjs';

function generateGravityKit() {
  const timing = JSON.parse(fs.readFileSync('src/gravidadeTiming.json', 'utf8'));

  const chapterTitles = [
    'O Passeio Matinal no Parque',
    'A Anomalia: 5 Segundos Sem Gravidade',
    'Folhas e Café Flutuando no Ar',
    'Pés Soltos do Chão!',
    'A Rotação da Terra a 1600 km/h',
    'Bancos e Hidrantes no Espaço',
    'A Queda Violenta da Pressão Atmosférica',
    'Metros de Altura em Queda Livre Reversa',
    'A Contagem: A Gravidade Religa!',
    'O Despencar Violento de Volta ao Solo',
    'O Pouso de Emergência no Gramado',
    'Você Sobreviveria a 5 Segundos Sem Gravidade?'
  ];

  const beatsWithChapters = timing.beats.map((b, i) => ({
    ...b,
    chapterTitle: chapterTitles[i] || `Ato ${i + 1}`
  }));

  const res = buildYoutubeViralKit({
    slug: 'gravidade-zero',
    themeTitle: 'E Se a Gravidade Fosse Desligada por 5 Segundos? (Animação 3D)',
    titles: [
      'E SE A GRAVIDADE DESLIGASSE POR 5 SEGUNDOS?! 😱🌍 (Simulação 3D)',
      'O Que Aconteceria se a Gravidade Parasse do Nada? (Você Sobreviveria?!)',
      '5 Segundos Sem Gravidade: O Experimento Mais Aterrorizante da Terra em 3D!',
      'Por Que 5 Segundos Sem Gravidade Destruiriam o Planeta Inteiro?! 🤯',
      'E SE TUDO COMEÇASSE A FLUTUAR AGORA?! A Física do Fim da Gravidade em 3D'
    ],
    hookLine: '😱🌍 Imagine você caminhando tranquilamente por um parque bonito... e de repente, a gravidade de toda a Terra é DESLIGADA por apenas 5 segundos! O que aconteceria com você, com a atmosfera e com a rotação do planeta?!',
    summaryParagraphs: [
      'A gravidade é a força invisível que mantém tudo preso ao solo enquanto a Terra gira em seu próprio eixo a impressionantes 1.600 km/h. Se ela desaparecesse por um piscar de olhos — meros 5 segundos —, o efeito da inércia faria qualquer pessoa, carro, banco de praça e gota d\'água decolar violentamente em direção ao céu!',
      'Para piorar, a atmosfera começaria a se expandir em direção ao vácuo e a pressão do ar despencaria instantaneamente. Quando a contagem regressiva chegasse a zero e a gravidade fosse religada com força total, tudo o que subiu desabaria a mais de 180 km/h em direção ao solo! Descubra nesta animação 3D detalhada por que 5 segundos seriam suficientes para o caos absoluto!'
    ],
    beats: beatsWithChapters,
    tags: [
      'e se a gravidade desligasse',
      'sem gravidade por 5 segundos',
      'gravidade zero',
      'curiosidades da fisica',
      'animacao 3d ciencia',
      'o que acontece sem gravidade',
      'terra sem gravidade',
      'fisica explicada',
      'shorts de ciencia',
      'simulacao 3d gravidade',
      'rotacao da terra',
      'misterios do universo',
      'apocalipse da fisica',
      'explicacao 3d divertida'
    ],
    hashtags: [
      '#Shorts',
      '#Gravidade',
      '#Fisica',
      '#Ciencia',
      '#Curiosidades',
      '#Simulacao3D',
      '#Animacao3D'
    ],
    thumbnailPrompt: 'Personagem em pânico flutuando de cabeça para baixo no ar sobre um parque bonito, segurando uma xícara de café com o líquido flutuando em esferas ao lado de um banco de praça flutuando no céu azul, texto em letras amarelas brilhantes "5 SEGUNDOS SEM GRAVIDADE?!"'
  });

  fs.copyFileSync(
    res.outMdPath,
    'C:/Users/Ruan Gomes/.gemini/antigravity/brain/f65a7527-d97f-4f93-88d1-e96feaf70935/youtube-kit-gravidade-zero.md'
  );
  console.log(`✅ Kit Viral do YouTube (Gravidade Zero) gerado em: ${res.outMdPath}`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-youtube-kit-gravity.mjs')) {
  generateGravityKit();
}
export { generateGravityKit };
