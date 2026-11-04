import fs from 'node:fs';

const lines = [
  "Você acha que cinco segundos sem oxigênio não é nada porque aguenta prender a respiração? Você não duraria nem o primeiro segundo!",
  "No exato instante que o oxigênio some, o céu azul vira uma escuridão total do espaço em pleno meio-dia!",
  "A pressão atmosférica despenca vinte e um por cento de golpe e os seus dois tímpanos estouram com o estalo do vácuo!",
  "O oxigênio é o ligante do cimento: sem ele, todos os prédios, pontes e viadutos esfarelam em nuvens de pó!",
  "Todos os motores a combustão morrem na hora. Carros travam no seco e aviões no céu despencam em queda livre!",
  "A camada de ozônio é oxigênio puro. Sem ela, a radiação ultravioleta do Sol frita a sua pele em chamas invisíveis!",
  "A água dos rios e oceanos perde o oxigênio e vira hidrogênio, expandindo em uma muralha gigante de gás no horizonte!",
  "Metais sem a película de oxigênio colidem e se fundem instantaneamente ao menor toque, grudando como solda a quente!",
  "Quarenta e cinco por cento da crosta da Terra é oxigênio. O chão sólido simplesmente desaparece sob as suas botas!",
  "Você entra em queda livre rumo ao manto de magma fervente do planeta, caindo a centenas de quilômetros por hora no abismo!",
  "Os cinco segundos acabam! O oxigênio reaparece numa onda de choque estrondosa que comprime o ar como mil bombas atômicas!",
  "A Terra sobreviveu por um milagre, mas nada mais é igual. Você aguentaria esses cinco segundos? Comenta aí!"
];

async function main() {
  console.log('🎙️ Gerando Áudio Master Contínuo (Oxigênio 5 Segundos) no VoiceStudio...');
  const res = await fetch('http://127.0.0.1:8000/api/tts-continuous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      voice: 'pt-BR-AntonioNeural',
      rate: '+5%',
      useClonedFilter: false,
      outWav: 'output/oxigenio_audio.wav',
      outMp3: 'output/oxigenio_audio.mp3'
    })
  });

  if (!res.ok) {
    throw new Error(`Erro no VoiceStudio HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  fs.writeFileSync('src/oxigenioTiming.json', JSON.stringify({
    totalDuration: data.totalDuration,
    beats: data.beats
  }, null, 2));

  console.log(`✅ Áudio Master gerado com sucesso! Duração total: ${data.totalDuration}s`);
  data.beats.forEach(b => {
    console.log(`Beat ${String(b.id + 1).padStart(2, ' ')}: [${b.start.toFixed(2)}s -> ${b.end.toFixed(2)}s] "${b.text.slice(0, 48)}..."`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
