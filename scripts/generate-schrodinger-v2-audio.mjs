import fs from 'node:fs';

const lines = [
  "Imagine a sala da sua casa, em um dia totalmente comum.",
  "Em cima da mesa, colocamos um gato curioso dentro de uma caixa de papelão.",
  "Junto com ele, há um único átomo instável, com cinquenta por cento de chance de disparar.",
  "Se o átomo disparar, este detector solta o martelo automaticamente.",
  "O martelo então quebra o frasco de veneno, mas se o átomo não disparar, nada acontece.",
  "Agora fechamos a caixa, e sem olhar lá dentro, ninguém sabe o que aconteceu.",
  "Para o nosso senso comum, o gato lá dentro só pode estar vivo, ou morto.",
  "Mas na física quântica, sem observador, o átomo fica nos dois estados ao mesmo tempo.",
  "Isso cria a superposição, onde o gato está cinquenta por cento vivo e cinquenta por cento morto simultaneamente.",
  "Essa mistura bizarra dura até o exato segundo em que abrimos a caixa para olhar.",
  "O simples ato de olhar faz a natureza decidir na hora, e a incerteza vira uma única realidade.",
  "Esse é o gato de Schrödinger, mostrando que no mundo quântico observar muda a realidade."
];

async function main() {
  console.log('🎙️ Chamando VoiceStudio Server v13 (http://127.0.0.1:8000/api/tts-continuous)...');
  const res = await fetch('http://127.0.0.1:8000/api/tts-continuous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      voice: 'pt-BR-AntonioNeural',
      rate: '-2%',
      outWav: 'output/schrodinger_living_room_audio.wav',
      outMp3: 'output/schrodinger_living_room_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`VoiceStudio erro HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/schrodingerLivingRoomTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master gerado (${data.totalDuration}s): ${data.outWav} & ${data.outMp3}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
