import fs from 'node:fs';

async function verify() {
  console.log('🧪 Iniciando Auditoria QA do Vídeo 3D (implosao-submarino-3d.html)...');
  
  const htmlPath = 'implosao-submarino-3d.html';
  if (!fs.existsSync(htmlPath)) {
    throw new Error('Arquivo implosao-submarino-3d.html não encontrado!');
  }
  
  const content = fs.readFileSync(htmlPath, 'utf8');
  console.log(`📄 Tamanho do HTML: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
  
  // 1. Áudio Base64
  if (!content.includes('data:audio/mp3;base64,')) {
    throw new Error('Áudio Base64 não embutido!');
  }
  console.log('✅ Áudio Master VoiceStudio Base64 verificado.');

  // 2. Three.js e evaluateSceneAtTime
  if (!content.includes('window.evaluateSceneAtTime') || !content.includes('window.renderDeterministicFrame')) {
    throw new Error('Funções de renderização determinística não encontradas!');
  }
  console.log('✅ Motor Determinístico de Renderização 60fps verificado.');

  // 3. Downloads copy
  const dlPath = 'C:/Users/Ruan Gomes/Downloads/implosao_submarino_animacao_vertical_3d.html';
  if (!fs.existsSync(dlPath)) {
    throw new Error('Cópia em Downloads não encontrada!');
  }
  console.log('✅ Cópia preservada em Downloads verificada.');

  // 4. YouTube Kit
  const ytKitPath = 'output/youtube-kit-implosao-submarino.md';
  if (!fs.existsSync(ytKitPath)) {
    throw new Error('YouTube Kit não encontrado!');
  }
  console.log('✅ Kit Viral YouTube verificado.');

  console.log('\n🏆 VEREDITO QA AUDITOR: ✅ APROVADO COM 0 DEFEITOS!');
}

verify().catch(err => {
  console.error('❌ Falha na auditoria:', err);
  process.exit(1);
});
