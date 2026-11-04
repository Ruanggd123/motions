import fs from 'node:fs';

async function generateCodeWithKodeo() {
  console.log('⚡ Solicitando geração de código à API Kodeo (modelo claude-haiku-5.5)...');

  const prompt = `Você é um engenheiro sênior especialista em Three.js (r128) e animação 3D interativa.
Escreva a função JavaScript pura createSubmersibleScene(THREE, scene, camera, phoneViewport) que configura todos os elementos do submarino e do abismo da Fossa das Marianas, e retorna os objetos e materiais necessários para a animação.

Requisitos técnicos estritos:
1. NUNCA acesse ou modifique '.position' em BufferGeometry! BufferGeometry não possui .position. Use 'geo.translate(x, y, z)'.
2. Materiais com renderização 100% visível e vibrante em WebGL:
   - subRoot: new THREE.Group() adicionado a scene.
   - Casco: CylinderGeometry(0.85, 0.85, 2.4, 32). rotateX(Math.PI/2). MeshStandardMaterial com color: 0x38bdf8, transparent: true, opacity: 0.22, roughness: 0.2, metalness: 0.8, depthWrite: false, side: THREE.DoubleSide.
   - Nariz: SphereGeometry(0.85, 32, 16, 0, Math.PI*2, 0, Math.PI/2). rotateX(Math.PI/2). translate(0, 0, 1.2).
   - Cauda: SphereGeometry(0.85, 32, 16, 0, Math.PI*2, 0, Math.PI/2). rotateX(-Math.PI/2). translate(0, 0, -1.2).
   - Anéis de reforço de titânio: TorusGeometry(0.86, 0.04, 16, 48) com MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 }).
   - Tanques de lastro: cilindros laterais amarelos/laranja (0xf59e0b).
   - Interior da cabine: piso, console central com MeshStandardMaterial({ color: 0x0f172a, emissive: 0x38bdf8, emissiveIntensity: 1.0 }), 2 tripulantes estilizados (esferas e cilindros).
   - Bolha interna de ar: SphereGeometry(0.72, 24, 24) com MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending }).
   - Faróis: SpotLight(0xa5f3fc, 8.0, 18, Math.PI / 5) e ConeGeometry volumétrico (translate em z=3.0) translúcido.
   - Vetores de pressão: 20 setas apontando para o casco. Cada seta é um Group com haste (CylinderGeometry) e ponta (ConeGeometry com translate(0, -0.3, 0)).
   - Fissura: TorusGeometry luminoso vermelho (emissive 0xff0044).
   - Partículas de cavitação/implosão: Points com 400 partículas.
   - Neve marinha abissal: Points com 600 partículas flutuantes.
3. Iluminação completa:
   - AmbientLight(0x0a223a, 1.8)
   - DirectionalLight(0x38bdf8, 2.2) em (2, 6, 3)
   - PointLight(0x00f5ff, 2.5, 8) no interior da cabine
4. Retorne o objeto com todas as referências:
   return { subRoot, hullMesh, noseMesh, rearMesh, hullXRayMat, airPocketMat, consoleMesh, lightCone, arrowMeshes, crackMesh, crackMat, debrisGeo, debrisMat, debrisVel, snowGeo, snowCount, particleCount };

Retorne APENAS o código JavaScript puro (sem introdução, sem markdown).`;

  const res = await fetch('https://api.kodeo.com.br/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': 'ck_2ca416bf4acf20572d20ae137e2df3075e94e8f6cc6298a0',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-5.5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json();
  if (data.content && data.content[0] && data.content[0].text) {
    let code = data.content[0].text;
    code = code.replace(/^```(?:javascript|js)?\n/i, '').replace(/\n```$/, '');
    fs.writeFileSync('src/kodeo-scene-builder.js', code, 'utf8');
    console.log(`✅ Código da cena gerado pela Kodeo com sucesso (${code.length} caracteres)!`);
  } else {
    console.error('Erro na resposta:', data);
  }
}

generateCodeWithKodeo().catch(console.error);
