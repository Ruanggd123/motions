import fs from 'node:fs';

const lines = [
  "Imagine que você está em uma missão espacial tranquila, quando de repente sua nave encontra um buraco negro supermassivo!",
  "Antes mesmo de você reagir, a gravidade monstruosa arranca os painéis da sua nave e puxa você para o abismo!",
  "A luz é tão curvada na esfera de fótons que, se você olhar para a frente, verá a sua própria nuca refletida no espaço!",
  "Ao seu lado, um planeta rochoso inteiro é despedaçado como se fosse feito de areia, alimentando um disco de plasma a milhões de graus!",
  "Aqui o espaço-tempo afunda tanto que o tempo quase para: cada segundo no seu pulso equivale a mil anos passando lá na Terra!",
  "Para quem te observa de longe, você parece desacelerar até congelar completamente, ficando cada vez mais vermelho!",
  "Mas para você, a queda continua em velocidade absurda! E como seus pés estão mais perto do centro, eles sofrem uma tração brutal!",
  "A diferença de gravidade entre seus pés e sua cabeça é de bilhões de vezes: seu corpo e a nave são esticados como um fio de espaguete!",
  "Você finalmente cruza o Horizonte de Eventos! A partir dessa fronteira invisível, nem mesmo a velocidade da luz consegue escapar!",
  "Lá dentro, espaço e tempo trocam de papel: tentar fugir para trás é tão impossível quanto tentar viajar para o ontem!",
  "No centro está a Singularidade de densidade infinita! Mas e se um buraco de minhoca te lançasse para fora em outra região do cosmos?",
  "Você voltaria intacto, mas milhões de anos no futuro! E aí, você teria coragem de pular nesse abismo cósmico?"
];

async function main() {
  console.log('🎙️ Gerando Áudio Master Contínuo de 12 Atos no VoiceStudio (http://127.0.0.1:8000/api/tts-continuous)...');
  const res = await fetch('http://127.0.0.1:8000/api/tts-continuous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      voice: 'pt-BR-AntonioNeural',
      rate: '+2%',
      outWav: 'output/buraco-negro_audio.wav',
      outMp3: 'output/buraco-negro_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/buracoTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master (Buraco Negro 12 Beats) gerado com sucesso (${data.totalDuration}s)!`);
  data.beats.forEach(b => {
    console.log(`Beat ${String(b.id + 1).padStart(2, ' ')}: ${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s | "${b.text.slice(0, 52)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
