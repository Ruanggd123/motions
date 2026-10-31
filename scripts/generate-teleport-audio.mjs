import fs from 'node:fs';

const lines = [
  "Imagine ter na sala da sua casa uma máquina de teletransporte, capaz de te levar a qualquer lugar em um segundo.",
  "De um lado da mesa fica a cápsula de partida, e do outro lado está a cápsula de destino.",
  "Para funcionar, um scanner laser precisa ler a posição exata de cada átomo do seu corpo.",
  "Essa informação viaja na hora por um cabo de emaranhamento quântico até a outra cápsula.",
  "Mas existe uma regra dura na física: para ler todos os dados quânticos, o scanner precisa desfazer o corpo original.",
  "No mesmo instante, a cápsula de destino usa átomos novos para reconstruir você, até a última memória.",
  "Para quem olha de fora, o teletransporte deu certo, mas será que quem saiu de lá é mesmo você?",
  "Para entender o paradoxo, imagine que o scanner leia seus dados, mas falhe na hora de apagar o original.",
  "Agora existem dois de você ao mesmo tempo, e ambos juram que são a pessoa verdadeira.",
  "Se o segundo é uma cópia quando você sobrevive, então ser desfeito na primeira cápsula significa que a sua vida terminou ali.",
  "Na prática, a máquina não move você pelo espaço, ela apenas envia a planta e imprime um clone perfeito no destino.",
  "Esse é o paradoxo do teletransporte: você entraria nessa cápsula, ou acha que quem sai do outro lado é outra pessoa?"
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
      outWav: 'output/teletransporte_audio.wav',
      outMp3: 'output/teletransporte_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/teletransporteTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master (Teletransporte) gerado com sucesso (${data.totalDuration}s)!`);
  data.beats.forEach(b => {
    console.log(`Beat ${String(b.id + 1).padStart(2, ' ')}: ${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s | "${b.text.slice(0, 48)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
