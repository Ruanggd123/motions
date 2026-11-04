import fs from 'node:fs';

const lines = JSON.parse(fs.readFileSync('src/fossaLines.json', 'utf8'));

async function main() {
  console.log('🎙️ Gerando Áudio Master Contínuo no VoiceStudio (Implosão na Fossa das Marianas)...');
  const res = await fetch('http://127.0.0.1:8000/api/tts-continuous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      voice: 'pt-BR-AntonioNeural',
      rate: '+2%',
      outWav: 'output/implosao-submarino_audio.wav',
      outMp3: 'output/implosao-submarino_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/implosaoTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master (Implosão Submarino) gerado com sucesso (${data.totalDuration}s)!`);
  data.beats.forEach((b, idx) => {
    console.log(`Ato ${idx + 1} (${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s) [${b.duration.toFixed(2)}s]: "${b.text.slice(0, 50)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
