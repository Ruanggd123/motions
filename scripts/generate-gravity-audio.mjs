import fs from 'node:fs';

const lines = [
  "Imagine você caminhando tranquilamente por um parque bonito em uma manhã de sol.",
  "Mas do nada, uma anomalia cósmica desliga a gravidade da Terra por apenas cinco segundos.",
  "No primeiro segundo, o café na sua mão e as folhas do chão começam a flutuar no ar.",
  "No segundo seguinte, seus pés perdem o chão e você começa a subir sem conseguir se segurar.",
  "Como a Terra gira a mil e seiscentos quilômetros por hora, tudo o que não está preso decola para o alto.",
  "Bancos de praça, hidrantes e carros flutuam como se estivessem no meio do espaço sideral.",
  "A atmosfera também começaria a escapar, criando uma queda violenta na pressão do ar.",
  "Você flutua a vários metros de altura, vendo o chão se afastar sob os seus pés.",
  "Mas a contagem regressiva chega ao fim, e de repente a gravidade é religada com força total!",
  "Tudo o que subiu desaba em queda livre acelerada de volta em direção ao solo.",
  "Você despenca em direção à grama macia, fazendo um pouso desajeitado mas escapando com vida!",
  "Esse é o perigo da gravidade: cinco segundos desligada causariam o caos no planeta. Você teria coragem de encarar?"
];

async function main() {
  console.log('🎙️ Gerando Áudio Master Contínuo no VoiceStudio (http://127.0.0.1:8000/api/tts-continuous)...');
  const res = await fetch('http://127.0.0.1:8000/api/tts-continuous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      voice: 'pt-BR-AntonioNeural',
      rate: '-2%',
      outWav: 'output/gravidade_audio.wav',
      outMp3: 'output/gravidade_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/gravidadeTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master (Gravidade Zero) gerado com sucesso (${data.totalDuration}s)!`);
  data.beats.forEach(b => {
    console.log(`Beat ${String(b.id + 1).padStart(2, ' ')}: ${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s | "${b.text.slice(0, 48)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
