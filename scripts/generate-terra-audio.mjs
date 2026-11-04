import fs from 'node:fs';

const lines = [
  "Você sobreviveria se a Terra parasse de girar por apenas cinco segundos?",
  "Neste exato momento, você e tudo ao seu redor estão se movendo a mais de mil e seiscentos quilômetros por hora em direção ao leste.",
  "Se o planeta parasse de repente, a Primeira Lei de Newton entraria em ação: tudo seria arremessado horizontalmente em velocidade supersônica!",
  "A atmosfera continuaria girando, gerando ventos de quinhentos metros por segundo que varreriam cidades, enquanto os oceanos formariam megatsunamis.",
  "Cinco segundos depois, a Terra voltaria a girar com um solavanco tectônico brutal, gerando terremotos globais catastróficos.",
  "A rotação suave do nosso planeta é o escudo silencioso que nos mantém vivos. Você sabia que estamos voando tão rápido pelo espaço?"
];

async function main() {
  console.log('🎙️ Gerando Áudio Master Contínuo no VoiceStudio (E Se a Terra Parasse)...');
  const res = await fetch('http://127.0.0.1:8000/api/tts-continuous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      voice: 'pt-BR-AntonioNeural',
      rate: '+0%', // Tom firme, documental e cativante
      outWav: 'output/terra-parou_audio.wav',
      outMp3: 'output/terra-parou_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/terraTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master (Terra Parou) gerado com sucesso (${data.totalDuration}s)!`);
  data.beats.forEach((b, idx) => {
    console.log(`Ato ${idx + 1} (${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s) [${b.duration.toFixed(2)}s]: "${b.text.slice(0, 48)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
