import fs from 'node:fs';

const lines = [
  "Por que um soco no queixo apaga uma pessoa instantaneamente?",
  "Um soco reto no meio do rosto apenas empurra a cabeça para trás, e os músculos fortes do pescoço absorvem o impacto.",
  "Já o gancho no queixo atinge a ponta da mandíbula, exatamente no ponto mais distante do eixo da coluna.",
  "A cabeça não recua: ela gira com um torque violento a mais de quarenta radianos por segundo!",
  "O cérebro colide contra a parede do crânio e o tronco encefálico sofre uma torção extrema, desligando o sistema nervoso na hora.",
  "O corpo desliga como um disjuntor e desaba no chão. Proteger o queixo salva vidas. Você sabia dessa física?"
];

async function main() {
  console.log('🎙️ Gerando Áudio Master Contínuo no VoiceStudio (http://127.0.0.1:8000/api/tts-continuous)...');
  const res = await fetch('http://127.0.0.1:8000/api/tts-continuous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      voice: 'pt-BR-AntonioNeural',
      rate: '-1%',
      outWav: 'output/soco-no-queixo_audio.wav',
      outMp3: 'output/soco-no-queixo_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/socoTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master (Soco no Queixo) gerado com sucesso (${data.totalDuration}s)!`);
  data.beats.forEach(b => {
    console.log(`Beat ${String(b.id + 1).padStart(2, ' ')}: ${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s | "${b.text.slice(0, 48)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
