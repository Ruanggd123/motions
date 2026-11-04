import fs from 'node:fs';

async function callKodeoForAAAVisuals() {
  console.log('🚀 Chamando API Kodeo no MÁXIMO para gerar o motor gráfico AAA do Submarino e Abismo da Fossa das Marianas...');

  const prompt = `Você é o Artista Técnico Líder e Engenheiro Gráfico Three.js (r128) da Lucasfilm / ILM e Kurzgesagt.
O usuário achou a animação anterior "muito feia" (era apenas um cilindro básico com esferas simples).
Precisamos de um modelo 3D de SUBMARINO DE ALTA PROFUNDIDADE (Estilo Deepsea Challenger / Triton 36000 / Limiting Factor) ABSOLUTAMENTE CINEMATOGRÁFICO, RICO EM DETALHES INDUSTRIAIS E VISUALMENTE ESPETACULAR.

Crie o código JavaScript puro da função:
createEliteAbyssScene(THREE, scene, camera, phoneViewport)

ESPECIFICAÇÕES DE ALTO IMPACTO VISUAL:
1. DESIGN INDUSTRIAL DO SUBMARINO (NÃO faça apenas 1 cilindro! Monte um veículo complexo):
   - Chassi tubular externo de titânio (exosqueleto estrutural com barras diagonais).
   - Esfera de Pressão Central de Titânio Forjado (com anel de parafusos de flange visíveis).
   - Cúpula de observação de acrílico ultra-transparente frontal com refração interna e anel de vedação.
   - Cockpit interior altamente detalhado:
     * Bancos ergonômicos com cintos de segurança em silhueta.
     * Painel de aviônica com 3 telas multifunção emissivas (ciano, verde e âmbar).
     * Suporte de vida com cilindros de oxigênio criogênicos.
     * Luz de cabine dinâmica (PointLight ciano pulsante).
   - 4 Propulsores Vetorizados: cada um com duto cilíndrico (cowling), cubo central e 3 pás de hélice metálicas.
   - 2 Braços Robóticos Manipuladores articulados: ombro, pistões hidráulicos, antebraço e garras mecânicas de titânio.
   - Grade de sensores e cesta de amostragem frontal com cilindros científicos e cabos.
   - Barra de faróis LED de alta intensidade (6 spots montados na barra superior) projetando cones volumétricos com shader/material translúcido aditivo.
   - Feixes de laser verde paralelos de escala oceanográfica projetados para frente.

2. CENÁRIO DO ABISMO (FOSSA DAS MARIANAS):
   - Fundo oceânico rochoso (terreno de basalto vulcânico com fissuras abissais).
   - Chaminé hidrotermal (Black Smoker) com partículas de fumaça mineral e brilho geotérmico âmbar.
   - Águas-vivas e organismos bioluminescentes (medusas estilizadas flutuando com emissão translúcida ciano/magenta).
   - 1.000 partículas de neve marinha cintilante flutuando na correnteza.

3. EFEITOS DA IMPLOSÃO CINEMATOGRÁFICA (20ms):
   - Fissura tridimensional ramificada que brilha em vermelho incandescente e pulsa no Ato 4.
   - No Ato 5 (26.57s):
     * O submarino sofre colapso estrutural assimétrico violento!
     * Flash espetacular de sonoluminescência (núcleo de plasma branco e dourado a 5.000°C).
     * Onda de choque esférica em expansão (shockwave ring com transparência aditiva).
     * Nuvem massiva de 600 bolhas de cavitação em expansão e compressão pulsante.
     * 50 fragmentos de titânio girando e se dispersando no vácuo abissal.

4. REGRAS TÉCNICAS ESTRITAS THREE.JS R128:
   - NUNCA use .position em BufferGeometry! Use sempre geo.translate(x, y, z) ou mesh.position.set(...).
   - Use materiais que funcionem perfeitamente com iluminação padrão (MeshStandardMaterial, MeshPhysicalMaterial com emissive, MeshBasicMaterial aditivo para luzes).
   - Retorne o objeto com todas as referências para controle no evaluateSceneAtTime(t).

Retorne APENAS o código JavaScript puro (sem markdown, sem introdução).`;

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
    fs.writeFileSync('src/kodeo-elite-scene.js', code, 'utf8');
    console.log(`✅ Motor Gráfico AAA gerado pela Kodeo com sucesso (${code.length} caracteres)!`);
  } else {
    console.error('Erro na resposta Kodeo:', data);
  }
}

callKodeoForAAAVisuals().catch(console.error);
