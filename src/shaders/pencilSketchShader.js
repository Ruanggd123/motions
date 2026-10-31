/**
 * PencilSketchShader v3 — Lápis de Cor Vibrante em Papel Texturizado
 *
 * MELHORIAS v3:
 * 1. Cores VIBRANTES e saturadas (lápis de cor de verdade, não pastel apagado)
 * 2. Textura de papel MUITO mais visível (fibras grossas, manchas, rugosidade)
 * 3. Traço de lápis mais grosso e orgânico
 * 4. Hachuras coloridas intensas seguindo a cor do objeto
 * 5. Sombras com lápis grafite + cor misturados
 */
import * as THREE from 'three';

// === VERTEX SHADER ===
export const pencilVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying float vDepth;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
`;

// === FRAGMENT SHADER (LÁPIS DE COR VIBRANTE) ===
export const pencilFragmentShader = `
uniform vec3 uBaseColor;
uniform float uTime;
uniform float uSketchIntensity;
uniform float uColorSaturation;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying float vDepth;

// Hash para ruído procedural
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Ruído suave para textura de papel
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Ruído de fibras do papel (mais grosseiro)
float paperFiber(vec2 p) {
  float n1 = noise(p * 150.0);
  float n2 = noise(p * 300.0 + 50.0);
  float n3 = noise(p * 600.0 + 100.0);
  return n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
}

// Padrão de hachura orgânica (linhas irregulares como lápis real)
float organicHatch(vec2 uv, float angle, float density, float irregularity) {
  float s = sin(angle);
  float c = cos(angle);
  vec2 rotated = vec2(
    uv.x * c - uv.y * s,
    uv.x * s + uv.y * c
  );
  float wobble = noise(rotated * 8.0) * irregularity;
  float line = fract((rotated.x + wobble) * density);
  float thickness = 0.35 + noise(rotated * 4.0) * 0.25;
  return smoothstep(thickness - 0.15, thickness + 0.15, line);
}

// Cross-hatching colorido intenso
vec3 coloredCrossHatch(vec2 uv, float darkness, vec3 baseColor) {
  vec3 hatchColor = vec3(0.0);
  float totalWeight = 0.0;

  // Camada 1: Cor principal vibrante
  if (darkness > 0.1) {
    float h1 = organicHatch(uv, 0.785, 50.0, 0.08);
    hatchColor += baseColor * h1 * 0.5;
    totalWeight += 0.5;
  }

  // Camada 2: Cor secundária (mais escura)
  if (darkness > 0.3) {
    float h2 = organicHatch(uv, -0.785, 60.0, 0.1);
    hatchColor += baseColor * 0.7 * h2 * 0.4;
    totalWeight += 0.4;
  }

  // Camada 3: Cor escura + grafite
  if (darkness > 0.5) {
    float h3 = organicHatch(uv, 0.2, 70.0, 0.12);
    vec3 darkMix = mix(baseColor * 0.4, vec3(0.15), 0.3);
    hatchColor += darkMix * h3 * 0.35;
    totalWeight += 0.35;
  }

  // Camada 4: Grafite puro (sombra profunda)
  if (darkness > 0.7) {
    float h4 = organicHatch(uv, 1.2, 80.0, 0.15);
    vec3 graphite = vec3(0.12, 0.11, 0.10);
    hatchColor += graphite * h4 * 0.4;
    totalWeight += 0.4;
  }

  return totalWeight > 0.0 ? hatchColor / totalWeight : vec3(0.0);
}

void main() {
  // === TEXTURA DE PAPEL MUITO VISÍVEL ===
  vec2 paperUv = gl_FragCoord.xy / vec2(720.0, 1280.0);

  // Fibras grossas do papel
  float fiber = paperFiber(paperUv);

  // Manchas e imperfeições
  float stain1 = noise(paperUv * 12.0 + uTime * 0.003) * 0.08;
  float stain2 = noise(paperUv * 25.0 + 50.0) * 0.05;

  // Rugosidade da superfície
  float roughness = noise(paperUv * 500.0) * 0.04;

  // Cor base do papel (creme quente com textura)
  vec3 paperColor = vec3(0.95, 0.91, 0.84);
  paperColor += (fiber - 0.5) * 0.12;
  paperColor -= stain1;
  paperColor -= stain2;
  paperColor += (roughness - 0.02);

  // === ILUMINAÇÃO PARA SKETCH ===
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
  float NdotL = dot(vNormal, lightDir);
  float diffuse = max(NdotL, 0.0);

  // Quantizar iluminação em bandas
  float shade;
  if (diffuse > 0.85) shade = 0.0;
  else if (diffuse > 0.6) shade = 0.2;
  else if (diffuse > 0.35) shade = 0.45;
  else if (diffuse > 0.15) shade = 0.7;
  else shade = 0.9;

  // === COR DO OBJETO (LÁPIS DE COR VIBRANTE) ===
  vec3 vibrantColor = uBaseColor;

  // Aumentar saturação para cores vibrantes
  float gray = dot(vibrantColor, vec3(0.299, 0.587, 0.114));
  vibrantColor = mix(vec3(gray), vibrantColor, uColorSaturation);

  // Boost de vibração (cores mais vivas)
  vibrantColor = pow(vibrantColor, vec3(0.85));

  // Tons de lápis de cor
  vec3 pencilLight = vibrantColor * 1.1;
  vec3 pencilMid = vibrantColor * 0.75;
  vec3 pencilDark = vibrantColor * 0.4;

  vec3 pencilColor;
  if (gray > 0.7) {
    pencilColor = mix(pencilLight, paperColor, (gray - 0.7) / 0.3);
  } else if (gray > 0.4) {
    pencilColor = mix(pencilMid, pencilLight, (gray - 0.4) / 0.3);
  } else {
    pencilColor = mix(pencilDark, pencilMid, gray / 0.4);
  }

  // === APLICAR HACHURAS COLORIDAS INTENSAS ===
  vec2 screenUv = gl_FragCoord.xy / vec2(720.0, 1280.0);
  vec3 hatch = coloredCrossHatch(screenUv + vUv * 0.3, shade, vibrantColor);

  // Misturar hachura com cor do lápis
  vec3 sketchColor = mix(pencilColor, hatch, shade * 0.7);

  // === CONTORNO DE LÁPIS GROSSO ===
  vec3 dx = dFdx(vNormal);
  vec3 dy = dFdy(vNormal);
  float edge = length(dx) + length(dy);
  float outline = smoothstep(0.2, 0.6, edge * uSketchIntensity);

  // Traço de lápis 6B escuro
  vec3 outlineColor = vec3(0.08, 0.07, 0.06);
  sketchColor = mix(sketchColor, outlineColor, outline * 0.85);

  // === COMBINAR COM PAPEL TEXTURIZADO ===
  vec3 finalColor = mix(paperColor, sketchColor, smoothstep(0.0, 0.1, shade + outline * 0.3));

  // Grão de lápis visível
  float pencilGrain = noise(screenUv * 400.0 + vUv * 100.0) * 0.08;
  finalColor -= pencilGrain * shade;

  // Vinheta suave
  vec2 vigUv = gl_FragCoord.xy / vec2(720.0, 1280.0);
  float vignette = 1.0 - smoothstep(0.3, 0.8, length(vigUv - 0.5) * 1.4);
  finalColor *= mix(0.85, 1.0, vignette);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// === SHADER DE CONTORNO (OUTLINE) ===
export const pencilOutlineVertexShader = `
uniform float uThickness;
void main() {
  vec3 newPos = position + normal * uThickness;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

export const pencilOutlineFragmentShader = `
uniform vec3 uOutlineColor;
uniform float uOpacity;
void main() {
  gl_FragColor = vec4(uOutlineColor, uOpacity);
}
`;

/**
 * Cria um material de sketch a lápis de cor vibrante
 */
export function createPencilMaterial(baseColor = 0x888888, sketchIntensity = 1.8, colorSaturation = 1.2) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBaseColor: { value: new THREE.Color(baseColor) },
      uTime: { value: 0 },
      uSketchIntensity: { value: sketchIntensity },
      uColorSaturation: { value: colorSaturation },
    },
    vertexShader: pencilVertexShader,
    fragmentShader: pencilFragmentShader,
    side: THREE.FrontSide,
  });
}

/**
 * Cria material de contorno (outline) estilo lápis grosso
 */
export function createPencilOutlineMaterial(thickness = 0.035) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uThickness: { value: thickness },
      uOutlineColor: { value: new THREE.Color(0x0a0a0a) },
      uOpacity: { value: 0.9 },
    },
    vertexShader: pencilOutlineVertexShader,
    fragmentShader: pencilOutlineFragmentShader,
    side: THREE.BackSide,
  });
}

/**
 * Aplica estilo lápis de cor vibrante a toda a cena
 */
export function applyPencilStyleToScene(scene, options = {}) {
  const {
    sketchIntensity = 1.8,
    outlineThickness = 0.035,
    paperBgColor = 0xF2E8D5,
    colorSaturation = 1.2,
  } = options;

  // Fundo papel creme texturizado
  scene.background = new THREE.Color(paperBgColor);
  scene.fog = null;

  // Coletar meshes primeiro para evitar loop infinito
  const meshes = [];
  const points = [];
  scene.traverse((child) => {
    if (child.isMesh) meshes.push(child);
    if (child.isPoints) points.push(child);
  });

  // Aplicar estilo nos meshes coletados
  meshes.forEach((child) => {
    if (child.material) {
      let baseColor = 0x888888;
      if (child.material.color) {
        baseColor = child.material.color.getHex();
      } else if (child.material.emissive) {
        baseColor = child.material.emissive.getHex();
      }

      const pencilMat = createPencilMaterial(baseColor, sketchIntensity, colorSaturation);
      if (child.material.dispose) child.material.dispose();
      child.material = pencilMat;

      // Adicionar outline na cena raiz
      if (!child.userData._hasOutline && child.geometry) {
        const outlineGeo = child.geometry.clone();
        const outlineMat = createPencilOutlineMaterial(outlineThickness);
        const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);
        child.updateWorldMatrix(true, false);
        outlineMesh.applyMatrix4(child.matrixWorld);
        scene.add(outlineMesh);
        child.userData._hasOutline = true;
        child.userData._outlineMesh = outlineMesh;
      }
    }
  });

  // Points → pontilhismo
  points.forEach((child) => {
    if (child.material) {
      child.material.color.setHex(0x2a2a2a);
      child.material.size = Math.max(child.material.size, 0.12);
    }
  });
}

/**
 * Atualiza o tempo uniforme em todos os materiais de lápis
 */
export function updatePencilTime(scene, time) {
  scene.traverse((child) => {
    if (child.isMesh && child.material && child.material.uniforms?.uTime) {
      child.material.uniforms.uTime.value = time;
    }
  });
}