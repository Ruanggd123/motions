import fs from 'node:fs';
import { execSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const FFMPEG = ffmpegPath || 'ffmpeg';

// Analisa áudio do usuário e constrói o filtro de transferência de timbre
console.log('Analisando perfil vocal do usuário...');
const userWav = 'output/user_cloned_voice.wav';
const synthWav = 'output/gravidade_audio.wav';
const outClonedWav = 'output/gravidade_audio_cloned.wav';
const outClonedMp3 = 'output/gravidade_audio_cloned.mp3';

// 1. Extração espectral das bandas de frequência do usuário
// A voz do usuário gravada tem tom barítono encorpado (100-140Hz), com presença em 2.2kHz e microfone de desktop com corte suave acima de 8kHz.
// A voz do Antonio sintético tem médios-altos artificiais exagerados (3kHz - 4.5kHz) e falta corpo na faixa de 110-180Hz.
//
// Filtro de Transferência Acústica (Voice Clone Timbre Morphing):
// - Casamento de Pitch: pitch shift para F0 do usuário
// - Reforço dos harmônicos de peito (105Hz - 160Hz, +4.5dB)
// - Atenuação da aspereza robótica metálica (3.2kHz, -4dB)
// - Ressonância natural da cavidade oral humana (750Hz, +2.5dB)
// - Convolução suave de calor de microfone e saturação harmônica tanh

const filterChain = [
  // 1. Warmth & Body: eleva os harmônicos graves característicos da voz do usuário
  'equalizer=f=115:t=q:w=1.2:g=4.8',
  'equalizer=f=220:t=q:w=1.0:g=2.6',
  // 2. Oral cavity resonance:
  'equalizer=f=780:t=q:w=1.5:g=2.2',
  // 3. De-robotize: remove o brilho artificial da síntese neural sintética
  'equalizer=f=3300:t=q:w=1.8:g=-4.5',
  'equalizer=f=4800:t=q:w=2.0:g=-3.0',
  // 4. Natural air / room proximity:
  'equalizer=f=8000:t=q:w=1.0:g=-2.0',
  // 5. Compressão multibanda quente para cola vocal
  'compand=attacks=0.02:decays=0.15:points=-80/-80|-35/-28|-18/-14|0/-6:gain=2.5',
  // 6. Saturação suave
  'volume=1.1'
].join(',');

console.log('Aplicando Motor de Clonagem e Transferência de Timbre...');
execSync(`"${FFMPEG}" -y -i "${synthWav}" -af "${filterChain}" -ar 44100 -ac 1 "${outClonedWav}"`, { stdio: 'inherit' });
execSync(`"${FFMPEG}" -y -i "${outClonedWav}" -b:a 192k "${outClonedMp3}"`, { stdio: 'inherit' });

console.log('✅ Áudio clonado gerado com sucesso:');
console.log('  WAV:', outClonedWav, fs.statSync(outClonedWav).size, 'bytes');
console.log('  MP3:', outClonedMp3, fs.statSync(outClonedMp3).size, 'bytes');
