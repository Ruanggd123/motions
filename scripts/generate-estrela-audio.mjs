import fs from 'node:fs';

const lines = [
  "Imagine que a sua nave acabou de sair da dobra espacial, diante do objeto mais extremo do universo: uma Estrela de Nêutrons!",
  "Ela nasceu da morte de um sol gigante e gira setecentas vezes por segundo, varrendo o cosmos com dois feixes mortais de radiação!",
  "Antes de você recuar, o campo magnético de um quatrilhão de Gauss arranca o casco da nave e ejeta você no espaço!",
  "Aqui a gravidade é duzentos bilhões de vezes mais forte que a da Terra: uma simples colherinha dessa estrela pesa tanto quanto o Monte Everest!",
  "Ao seu lado, uma estrela companheira inteira está sendo vampirizada, tendo seu plasma sugado em uma espiral incandescente!",
  "O magnetismo extremo distorce até os átomos do seu corpo, transformando cada átomo em uma agulha microscópica alongada!",
  "Enquanto você cai a cem mil quilômetros por segundo, um terremoto estelar trinca a crosta de ferro dez bilhões de vezes mais dura que o aço!",
  "A fissura libera uma Super-Explosão de Raios Gama capaz de evaporar oceanos a anos-luz de distância!",
  "De volta à cápsula de emergência em velocidade relativística, você mergulha através da crosta externa rumo ao interior proibido!",
  "Visto em Raio-X, o interior revela a bizarra Massa Nuclear: camadas de nêutrons prensados em forma de nhoque, espaguete e lasanha atômica!",
  "No núcleo quântico supercondutor, duas estrelas de nêutrons finalmente colidem em uma Kilonova, forjando ouro e platina puros no espaço!",
  "Graças a uma dobra de emergência, você retorna à órbita da Terra com um tesouro cósmico! Você encararia esse monstro magnético?"
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
      outWav: 'output/estrela-neutrons_audio.wav',
      outMp3: 'output/estrela-neutrons_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/estrelaTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ VoiceStudio Master (Estrela de Nêutrons 12 Beats) gerado com sucesso (${data.totalDuration}s)!`);
  data.beats.forEach(b => {
    console.log(`Beat ${String(b.id + 1).padStart(2, ' ')}: ${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s | "${b.text.slice(0, 52)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
