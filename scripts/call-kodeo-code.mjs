import fs from 'node:fs';

async function generateWithKodeo() {
  console.log('🤖 Chamando API da Kodeo (https://api.kodeo.com.br/v1/messages) usando modelo claude-opus-5...');

  const prompt = `Você é um engenheiro sênior de Three.js (r128).
Escreva o código JavaScript para instanciar o Submarino de Alta Profundidade e o cenário da Fossa das Marianas:
1. subRoot = new THREE.Group();
2. Casco: CylinderGeometry(0.85, 0.85, 2.4, 32), rotateX(Math.PI/2). MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }).
3. Nariz e Cauda: SphereGeometry com translate.
4. Interior da Cabine: console com emissive 0x00f5ff, tripulação (piloto e cientista), luz PointLight(0x38bdf8, 2.5, 8).
5. Faróis frontais e luzes volumétricas.
6. Vetores de pressão: setas em grupo usando CylinderGeometry e ConeGeometry (usar translate(0, -0.3, 0) no cone).
7. Sistema de partículas de cavitação/implosão (400 partículas).
8. Função window.evaluateSceneAtTime(t) e window.renderDeterministicFrame(t).

Retorne o código JavaScript limpo.`;

  const res = await fetch('https://api.kodeo.com.br/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': 'ck_2ca416bf4acf20572d20ae137e2df3075e94e8f6cc6298a0',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-opus-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const txt = await res.text();
  console.log('HTTP Status:', res.status);
  let data;
  try {
    data = JSON.parse(txt);
  } catch(e) {
    console.error('Falha ao fazer parse do JSON:', txt);
    return;
  }

  if (data.error) {
    console.error('Erro retornado pela Kodeo:', data.error);
    return;
  }

  if (data.content && data.content[0] && data.content[0].text) {
    let code = data.content[0].text;
    code = code.replace(/^```(?:javascript|js)?\n/i, '').replace(/\n```$/, '');
    fs.writeFileSync('src/kodeo-three-scene.js', code, 'utf8');
    console.log(`✅ Código gerado pela Kodeo com sucesso (${code.length} caracteres)!`);
  } else {
    console.log('Estrutura inesperada:', data);
  }
}

generateWithKodeo().catch(console.error);
