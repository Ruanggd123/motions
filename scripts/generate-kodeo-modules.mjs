import fs from 'node:fs';

async function callKodeo(endpoint, prompt, maxTokens = 2500) {
  const apiKey = 'ck_2ca416bf4acf20572d20ae137e2df3075e94e8f6cc6298a0';
  const res = await fetch('https://api.kodeo.com.br/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-5.5',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    throw new Error(`Erro na Kodeo HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.content[0].text;
  return text.replace(/^```(?:javascript|js)?\n/i, '').replace(/\n```$/, '');
}

async function main() {
  console.log('🤖 Chamando API da Kodeo para gerar os 3 módulos gráficos de elite...');

  // Módulo 1: O Submarino de Alta Fidelidade
  console.log('📦 1/3: Gerando Submarino Industrial com a API Kodeo...');
  const subPrompt = `Você é um engenheiro sênior de Three.js (r128).
Escreva a função buildIndustrialSubmarine(THREE) que constrói um Submarino de Exploração Abissal ultra-detalhado (estilo Triton 36000 / Limiting Factor / Deepsea Challenger) e retorna um Group.
REGRAS TÉCNICAS ESTRITAS:
- NUNCA use .position em BufferGeometry! Use apenas geo.translate(x, y, z) ou mesh.position.set(...).
- O veículo DEVE conter:
  1. Casco exterior hidrodinâmico em branco naval (#f8fafc) com decalques/listras amarelas de segurança (0xf59e0b).
  2. Esfera central de pressão em titânio (#94a3b8, metalness: 0.95, roughness: 0.2) com anel de parafusos de flange.
  3. Cúpula frontal de acrílico translúcido (MeshPhysicalMaterial com color: 0x38bdf8, opacity: 0.25, transparent: true, depthWrite: false).
  4. Cabine interna: piso, 2 assentos anatômicos, piloto em traje escuro com visor brilhante ciano, console com 3 telas com emissive (0x38bdf8, 0x10b981, 0xf59e0b) e luz PointLight(0x38bdf8, 2.5, 6).
  5. 4 Propulsores em dutos cilíndricos com cubos e 3 pás de hélice metálicas.
  6. 2 Braços robóticos com pistões hidráulicos e garras de titânio.
  7. Barra de 6 holofotes LED superiores com MeshBasicMaterial branco-azulado.
  8. Dois feixes laser de calibração paralelos verdes (MeshBasicMaterial 0x22c55e aditivo) apontando para frente.
Retorne o Group com subRoot e referências importantes anexadas em subRoot.userData.
Retorne APENAS o código JavaScript da função buildIndustrialSubmarine(THREE).`;

  const subCode = await callKodeo('sub', subPrompt, 2500);
  fs.writeFileSync('src/kodeo-submarine-module.js', subCode, 'utf8');
  console.log('✅ Módulo do Submarino gerado com sucesso!');

  // Módulo 2: O Abismo da Fossa das Marianas & Chaminé Hidrotermal
  console.log('🌊 2/3: Gerando Cenário do Abismo & Chaminé Hidrotermal...');
  const envPrompt = `Você é um engenheiro sênior de Three.js (r128).
Escreva a função buildMarianaTrenchEnvironment(THREE, scene) que cria o cenário da Fossa das Marianas e retorna um objeto com referências para animação.
REGRAS TÉCNICAS ESTRITAS:
- NUNCA use .position em BufferGeometry! Use geo.translate(x,y,z).
- O cenário DEVE conter:
  1. Leito rochoso da Fossa das Marianas a 11.000m: terreno de basalto vulcânico com fissuras profundas (PlaneGeometry com relevo procedural ou malha rochosa escura com roughness 0.9).
  2. Chaminé hidrotermal (Black Smoker) de sulfeto metálico erguendo-se do fundo, com emissão âmbar na boca (0xf97316).
  3. Sistema de partículas de fumaça mineral e fuligem vulcânica saindo da chaminé.
  4. Organismos abissais bioluminescentes: 3 águas-vivas flutuantes com campânula hemisférica translúcida ciano/magenta e tentáculos curvos emitindo brilho suave.
  5. 800 partículas de neve marinha (Points) flutuando organicamente.
Retorne um objeto { seabedMesh, ventGroup, ventSmoke, jellyfishGroup, marineSnow, updateEnvironment: (t) => { ... } }.
Retorne APENAS o código JavaScript da função.`;

  const envCode = await callKodeo('env', envPrompt, 2500);
  fs.writeFileSync('src/kodeo-environment-module.js', envCode, 'utf8');
  console.log('✅ Módulo do Ambiente Abissal gerado com sucesso!');

  // Módulo 3: Implosão & Sonoluminescência
  console.log('💥 3/3: Gerando Efeitos de Implosão & Sonoluminescência...');
  const fxPrompt = `Você é um engenheiro sênior de Three.js (r128).
Escreva a função buildImplosionFX(THREE, scene) que cria os efeitos visuais cinematográficos da implosão em 20ms:
- Fissura tridimensional ramificada que brilha em vermelho incandescente (emissive 0xff0044).
- Flash esférico de sonoluminescência (Mesh com MeshBasicMaterial aditivo, escala inicial 0, expande para 4 e decai em 0.3s).
- Anel de onda de choque supersônica (RingGeometry ou TorusGeometry aditivo).
- Nuvem de 500 bolhas de cavitação (Points) com velocidades radiais explosivas e contração.
- 40 estilhaços metálicos de titânio (BoxGeometry / Tetraedros com materiais metálicos que giram e se espalham).
Retorne { crackMesh, flashMesh, shockwaveMesh, cavitationPoints, debrisGroup, triggerImplosionAt: (t, dt) => { ... } }.
Retorne APENAS o código JavaScript da função.`;

  const fxCode = await callKodeo('fx', fxPrompt, 2500);
  fs.writeFileSync('src/kodeo-fx-module.js', fxCode, 'utf8');
  console.log('✅ Módulo de Efeitos de Implosão gerado com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro na orquestração da Kodeo:', err);
  process.exit(1);
});
