import fs from 'node:fs';
import path from 'node:path';

/**
 * Formata segundos em MM:SS para capítulos do YouTube
 */
export function formatYoutubeTimestamp(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Gera o Kit Completo de Publicação Viral para YouTube / Shorts / Reels / TikTok
 */
export function buildYoutubeViralKit(config) {
  const {
    slug,
    themeTitle,
    titles,
    hookLine,
    summaryParagraphs,
    beats,
    tags,
    hashtags,
    thumbnailPrompt
  } = config;

  const chaptersText = beats
    .map(b => `${formatYoutubeTimestamp(b.start)} - ${b.chapterTitle || b.tag || `Parte ${b.id + 1}`}`)
    .join('\n');

  const tagsCsv = tags.join(', ');
  const hashtagsLine = hashtags.join(' ');

  const youtubeDescription = `${hookLine}

${summaryParagraphs.join('\n\n')}

⏱️ CAPÍTULOS DO VÍDEO:
${chaptersText}

💬 Gostou dessa explicação em 3D? Comente aqui embaixo qual próximo paradoxo, máquina ou mistério da ciência você quer ver desmontado em 3D!
🔔 Inscreva-se no canal e ative o sininho para não perder os próximos vídeos 3D!

${hashtagsLine}`;

  const markdown = `# 🚀 KIT VIRAL DO YOUTUBE / SHORTS / REELS — ${themeTitle}

## 🏆 1. Títulos Virais de Alto CTR (Escolha 1 ou faça Teste A/B)
${titles.map((t, idx) => `${idx + 1}. **${t}**`).join('\n')}

---

## 📝 2. Descrição Otimizada para SEO (Pronta para Copiar e Colar)
\`\`\`text
${youtubeDescription}
\`\`\`

---

## 🏷️ 3. Tags do YouTube Studio (Prontas para Colar — Separadas por Vírgula)
\`\`\`text
${tagsCsv}
\`\`\`

---

## #️⃣ 4. Hashtags Rápidas (Shorts / TikTok / Reels)
\`\`\`text
${hashtagsLine}
\`\`\`

---

## 🖼️ 5. Sugestão de Thumbnail / Capa de Alto Clique
> ${thumbnailPrompt}
`;

  const outMdPath = path.join('output', `youtube-kit-${slug}.md`);
  const outJsonPath = path.join('output', `youtube-kit-${slug}.json`);

  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync(outMdPath, markdown, 'utf8');
  fs.writeFileSync(
    outJsonPath,
    JSON.stringify({ slug, themeTitle, titles, youtubeDescription, tagsCsv, hashtagsLine, chaptersText }, null, 2),
    'utf8'
  );

  return { outMdPath, outJsonPath, markdown };
}

// Se chamado diretamente, gera o Kit Viral do Vídeo #1 (O Gato de Schrödinger)
if (process.argv[1] && process.argv[1].endsWith('generate-youtube-kit.mjs')) {
  const timing = JSON.parse(fs.readFileSync('src/schrodingerLivingRoomTiming.json', 'utf8'));
  const beatTitles = [
    'A Sala de Estar Comum',
    'O Gato Curioso na Caixa',
    'O Gatilho Quântico (50% de Chance)',
    'O Detector e o Martelo Automático',
    'O Frasco de Veneno',
    'A Caixa Selada sem Observador',
    'O Que Diz o Nosso Senso Comum',
    'A Lei Bizarra da Física Quântica',
    'Superposição: 50% Vivo e 50% Morto!',
    'O Momento em que Abrimos a Caixa',
    'O Colapso da Realidade',
    'O Verdadeiro Segredo de Schrödinger'
  ];

  const beatsWithTitles = timing.beats.map((b, i) => ({
    ...b,
    chapterTitle: beatTitles[i] || `Ato ${i + 1}`
  }));

  const res = buildYoutubeViralKit({
    slug: 'gato-schrodinger',
    themeTitle: 'O Gato de Schrödinger — Explicação Visual 3D',
    titles: [
      'COMO UM GATO PODE ESTAR VIVO E MORTO AO MESMO TEMPO?! 🐈📦 (Explicação 3D)',
      'O Paradoxo do Gato de Schrödinger Explicado em 1 Minuto! (Animação 3D)',
      'Por Que Olhar Muda a Realidade? O Segredo do Gato de Schrödinger em 3D! 🤯',
      'O Experimento Mais Bizarro da Física Quântica: O Gato de Schrödinger em 3D',
      '50% VIVO e 50% MORTO?! Entenda o Gato de Schrödinger de um Jeito Fácil!'
    ],
    hookLine: '🐈📦 Como um gato dentro de uma caixa pode estar 50% VIVO e 50% MORTO ao mesmo tempo?! Entenda o paradoxo mais famoso da Física Quântica em uma animação 3D cristalina!',
    summaryParagraphs: [
      'Em 1935, o físico Erwin Schrödinger propôs um experimento mental intrigante para mostrar o quão bizarro é o mundo quântico: um gato trancado em uma caixa com um átomo radioativo instável, um detector Geiger, um martelo e um frasco de veneno.',
      'Enquanto ninguém abre a caixa para olhar, o átomo entra em SUPERPOSIÇÃO QUÂNTICA (disparou e não disparou simultaneamente) — deixando o próprio gato em dois estados ao mesmo tempo até que o ato de observar force a natureza a escolher uma única realidade!'
    ],
    beats: beatsWithTitles,
    tags: [
      'gato de schrodinger',
      'o gato de schrodinger',
      'fisica quantica',
      'paradoxo de schrodinger',
      'superposicao quantica',
      'gato vivo e morto',
      'mecanica quantica explicada',
      'animacao 3d ciencia',
      'curiosidades da ciencia',
      'experimento gato de schrodinger',
      'erwin schrodinger',
      'colapso da funcao de onda',
      'ciencia facil',
      'explicacao 3d',
      'shorts de ciencia'
    ],
    hashtags: [
      '#Shorts',
      '#GatoDeSchrodinger',
      '#FisicaQuantica',
      '#Ciencia',
      '#Curiosidades',
      '#Paradoxo',
      '#Animacao3D'
    ],
    thumbnailPrompt: 'Caixa de papelão em visão de Raio-X brilhante dividida ao meio: de um lado um gato laranja fofo vivo e curioso, do outro um gato fantasma neon ciano/magenta translúcido ao lado de um átomo brilhante, texto grande amarelo "VIVO E MORTO?!" com alto contraste.'
  });

  console.log(`✅ Kit Viral do YouTube gerado com sucesso em: ${res.outMdPath}`);
}
