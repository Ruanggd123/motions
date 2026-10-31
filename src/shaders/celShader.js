/**
 * celShader.js v10 — Shader Cinematográfico Toon / PBR-Lite (Estilo Pixar / Arcane / Spider-Verse)
 *
 * Recursos v10:
 * - 3 bandas de luz com transição suave via smoothstep (zero serrilhado em curvas)
 * - Sombreamento hemisférico Quente (Key Light) vs. Frio (Shadow Tint azul-violeta)
 * - Fresnel Rim Light (luz de recorte cinematográfica na silhueta contra fundos escuros)
 * - Specular Sheen suave (Blinn-Phong) para cabelo, olhos, nylon e botas
 * - Outline de silhueta limpo (BackSide) calibrado para geometrias orgânicas
 */
import * as THREE from 'three';

export const celVertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const celFragmentShader = /* glsl */`
  uniform vec3 uBaseColor;
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform vec3 uAmbientColor;
  uniform vec3 uRimColor;
  uniform float uBand1;
  uniform float uBand2;
  uniform float uRimPower;
  uniform float uRimIntensity;
  uniform float uSpecular;

  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 lightDir = normalize(uLightDir);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // 1. Iluminação Direcional Suavizada (Smooth Toon Bands)
    float NdotL = dot(normal, lightDir);
    float bandHigh = smoothstep(uBand1 - 0.08, uBand1 + 0.08, NdotL);
    float bandMid  = smoothstep(uBand2 - 0.10, uBand2 + 0.10, NdotL);

    // Sombra fria rica (evita sombra preta lavada)
    vec3 shadowColor = mix(uBaseColor * vec3(0.32, 0.34, 0.48), uBaseColor * uAmbientColor, 0.45);
    vec3 midColor    = uBaseColor * 0.84;
    vec3 litColor    = uBaseColor * uLightColor * 1.08;

    vec3 shadedColor = mix(shadowColor, midColor, bandMid);
    shadedColor      = mix(shadedColor, litColor, bandHigh);

    // 2. Gradiente Hemisférico Vertical (Top-down sky bounce)
    float hemi = clamp(normal.y * 0.5 + 0.5, 0.0, 1.0);
    shadedColor += uBaseColor * mix(vec3(-0.04, -0.03, 0.02), vec3(0.06, 0.06, 0.04), hemi);

    // 3. Specular Highlight Suave (Blinn-Phong estilizado)
    vec3 halfVec = normalize(lightDir + viewDir);
    float NdotH = max(dot(normal, halfVec), 0.0);
    float spec = smoothstep(0.86, 0.94, pow(NdotH, 24.0)) * uSpecular * bandHigh;
    shadedColor += uLightColor * spec * 0.35;

    // 4. Fresnel Rim Light (Luz de Recorte Cinematográfica)
    float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
    float rim = smoothstep(0.55, 0.88, pow(fresnel, uRimPower)) * uRimIntensity;
    // Rim mais forte no topo e lados iluminados
    rim *= clamp(normal.y * 0.4 + 0.7, 0.25, 1.0);
    shadedColor += uRimColor * rim;

    gl_FragColor = vec4(clamp(shadedColor, 0.0, 1.0), 1.0);
  }
`;

export const outlineVertexShader = /* glsl */`
  uniform float uOutlineWidth;

  void main() {
    vec3 norm = normalize(normal);
    vec3 pos = position + norm * uOutlineWidth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const outlineFragmentShader = /* glsl */`
  uniform vec3 uOutlineColor;

  void main() {
    gl_FragColor = vec4(uOutlineColor, 1.0);
  }
`;

/**
 * Cria um material cel-shaded v10 completo (corpo + outline).
 * @param {THREE.Color|number} baseColor - cor base do objeto
 * @param {object} opts - opções adicionais
 * @returns {{ celMaterial: THREE.ShaderMaterial, outlineMaterial: THREE.ShaderMaterial }}
 */
export function createCelMaterial(baseColor, opts = {}) {
  const {
    lightDir = new THREE.Vector3(0.6, 1.0, 0.75).normalize(),
    lightColor = new THREE.Color(1.0, 0.97, 0.92),
    ambientColor = new THREE.Color(0.35, 0.40, 0.55),
    rimColor = new THREE.Color(0.65, 0.82, 1.0),
    band1 = 0.38,
    band2 = -0.12,
    rimPower = 2.2,
    rimIntensity = 0.32,
    specular = 0.25,
    outlineWidth = 0.014,
    outlineColor = new THREE.Color(0.09, 0.09, 0.14),
  } = opts;

  const celMaterial = new THREE.ShaderMaterial({
    vertexShader: celVertexShader,
    fragmentShader: celFragmentShader,
    uniforms: {
      uBaseColor: { value: new THREE.Color(baseColor) },
      uLightDir: { value: lightDir },
      uLightColor: { value: lightColor },
      uAmbientColor: { value: ambientColor },
      uRimColor: { value: rimColor },
      uBand1: { value: band1 },
      uBand2: { value: band2 },
      uRimPower: { value: rimPower },
      uRimIntensity: { value: rimIntensity },
      uSpecular: { value: specular },
    },
  });

  const outlineMaterial = new THREE.ShaderMaterial({
    vertexShader: outlineVertexShader,
    fragmentShader: outlineFragmentShader,
    uniforms: {
      uOutlineWidth: { value: outlineWidth },
      uOutlineColor: { value: outlineColor },
    },
    side: THREE.BackSide,
  });

  return { celMaterial, outlineMaterial };
}

/**
 * Aplica cel-shading + outline a uma mesh existente.
 */
export function applyCelShading(mesh, baseColor, opts = {}) {
  const { celMaterial, outlineMaterial } = createCelMaterial(baseColor, opts);
  const group = new THREE.Group();

  const celMesh = mesh.clone();
  celMesh.material = celMaterial;
  group.add(celMesh);

  if (opts.outline !== false) {
    const outlineMesh = mesh.clone();
    outlineMesh.material = outlineMaterial;
    group.add(outlineMesh);
  }

  return group;
}
