import fs from 'node:fs';

const lines = [
  "Você sabe por que esse é considerado o combo mais devastador da história do combate?",
  "A trocação começa em ritmo alucinante. Jab, direto, esquiva de cabeça! O lutador lê o movimento e prepara a armadilha.",
  "O contra-ataque explode: um gancho violento no fígado! A pancada comprime o órgão sob as costelas, ativando o nervo vago e drenando o oxigênio.",
  "Com o abdômen paralisado, a guarda desce. É a brecha fatal para o gancho de esquerda na ponta do queixo!",
  "A cabeça gira com torque violento. O cérebro colide contra o crânio e o tronco encefálico desliga a consciência na hora!",
  "Nocaute absoluto em dois atos. Física, biomecânica e precisão cirúrgica. Você conseguiria defender esse combo?"
];

async function main() {
  console.log('🎙️ Gerando Áudio Master Contínuo no VoiceStudio (Combo Mortal)...');
  const res = await fetch('http://127.0.0.1:8000/api/tts-continuous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      voice: 'pt-BR-AntonioNeural',
      rate: '+2%', // Ritmo mais esportivo, vibrante e enérgico!
      outWav: 'output/combo-mortal_audio.wav',
      outMp3: 'output/combo-mortal_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/comboTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master (Combo Mortal) gerado com sucesso (${data.totalDuration}s)!`);
  data.beats.forEach((b, idx) => {
    console.log(`Ato ${idx + 1} (${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s) [${b.duration.toFixed(2)}s]: "${b.text.slice(0, 48)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
