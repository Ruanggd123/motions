import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('--- ETAPA 1: BACKUP EM ZIP DOS PROJETOS LEGADOS 3D E LUTA ---');
const backupDir = path.resolve('backups_legados');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const zipPath = path.join(backupDir, 'backup_legados_3d_cinema_e_lutas.zip');

const itemsToArchive = [
  'buraco-negro-3d.html',
  'estrela-neutrons-3d.html',
  'gato-schrodinger-3d.html',
  'gravidade-zero-3d.html',
  'implosao-submarino-3d.html',
  'oxigenio-5-segundos-3d.html',
  'teletransporte-3d.html',
  'terra-parou-3d.html',
  'biomecanica-nocaute-3d.html',
  'combo-mortal-3d.html',
  'soco-no-queixo-3d.html',
  'fighter-showcase.html',
  'kit-video-3d',
  'remotion-video',
  'scenes',
  'src/fighter'
];

const existingItems = itemsToArchive.filter(i => fs.existsSync(i));
console.log('Itens encontrados para compactar:', existingItems);

const stagingDir = path.resolve('staging_legados');
if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });
fs.mkdirSync(stagingDir, { recursive: true });

console.log('Movendo itens para área de empacotamento temporária...');
for (const item of existingItems) {
  const src = path.resolve(item);
  const dest = path.join(stagingDir, item);
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

console.log('Compactando pasta staging_legados...');
const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipPath}' -Force"`;
execSync(psCmd, { stdio: 'inherit' });

if (fs.existsSync(zipPath)) {
  const stat = fs.statSync(zipPath);
  console.log(`✅ ZIP gerado com sucesso em: ${zipPath}`);
  console.log(`📦 Tamanho do arquivo ZIP: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);

  // Remove área temporária
  fs.rmSync(stagingDir, { recursive: true, force: true });

  // Agora remove os itens originais da raiz, mantendo APENAS o zip
  console.log('\n--- REMOVENDO ITENS ORIGINAIS PARA DEIXAR O REPOSITÓRIO LEVE E 100% 2D ---');
  for (const item of existingItems) {
    const full = path.resolve(item);
    try {
      if (fs.existsSync(full)) {
        if (fs.lstatSync(full).isDirectory()) {
          fs.rmSync(full, { recursive: true, force: true });
          console.log(`🗑️ Pasta removida: ${item}`);
        } else {
          fs.unlinkSync(full);
          console.log(`🗑️ Arquivo removido: ${item}`);
        }
      }
    } catch (e) {
      console.warn(`Aviso ao remover ${item}:`, e.message);
    }
  }
  console.log('\n✨ Concluído! O repositório agora está limpo e 100% focado em Animações 2D.');
} else {
  console.error('❌ Erro: O arquivo ZIP não foi encontrado.');
}
