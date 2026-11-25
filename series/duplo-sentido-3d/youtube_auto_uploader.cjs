#!/usr/bin/env node
/**
 * youtube_auto_uploader.cjs
 * Upload e agendamento automatico de YouTube Shorts via YouTube Data API v3.
 * Zero dependencias externas (Node.js v24+ nativo: fetch, http, fs, path, os, child_process).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { exec } = require('child_process');

const AUTH_DIR = path.join(__dirname, '.youtube-auth');
const CLIENT_SECRET_PATH = path.join(AUTH_DIR, 'client_secret.json');
const TOKEN_PATH = path.join(AUTH_DIR, 'token.json');
const UPLOAD_LOG_PATH = path.join(AUTH_DIR, 'upload_log.json');
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');

const REDIRECT_HOST = '127.0.0.1';
const REDIRECT_PORT = 8765;
const REDIRECT_PATH = '/oauth2callback';
const REDIRECT_URI = `http://${REDIRECT_HOST}:${REDIRECT_PORT}${REDIRECT_PATH}`;

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
];

function parseCliArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith('--')) {
      const key = tok.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    } else {
      args._.push(tok);
    }
  }
  return args;
}

function ensureAuthDir() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

function findNewestClientSecretInDownloads() {
  if (!fs.existsSync(DOWNLOADS_DIR)) return null;
  const entries = fs
    .readdirSync(DOWNLOADS_DIR)
    .filter((f) => /^client_secret.*\.json$/i.test(f))
    .map((f) => {
      const full = path.join(DOWNLOADS_DIR, f);
      return { full, mtimeMs: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return entries.length > 0 ? entries[0].full : null;
}

function readOAuthClientConfig(explicitPath) {
  ensureAuthDir();
  if (explicitPath) {
    const resolved = path.resolve(explicitPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Arquivo de credenciais nao encontrado: ${resolved}`);
    }
    fs.copyFileSync(resolved, CLIENT_SECRET_PATH);
  } else if (!fs.existsSync(CLIENT_SECRET_PATH)) {
    const dl = findNewestClientSecretInDownloads();
    if (dl) {
      fs.copyFileSync(dl, CLIENT_SECRET_PATH);
      console.log(`[Auth] Credencial importada automaticamente de Downloads: ${path.basename(dl)}`);
    }
  }

  if (!fs.existsSync(CLIENT_SECRET_PATH)) {
    return null;
  }

  const raw = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf8'));
  const cfg = raw.installed || raw.web;
  if (!cfg || !cfg.client_id || !cfg.client_secret) {
    throw new Error(
      `Formato invalido em ${CLIENT_SECRET_PATH}. Baixe o JSON OAuth Desktop ("App para computador") no Google Cloud Console.`
    );
  }
  return {
    clientId: cfg.client_id,
    clientSecret: cfg.client_secret,
    authUri: cfg.auth_uri || 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: cfg.token_uri || 'https://oauth2.googleapis.com/token',
  };
}

function readToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function writeToken(tok) {
  ensureAuthDir();
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tok, null, 2), 'utf8');
}

function appendUploadLog(entry) {
  ensureAuthDir();
  let list = [];
  if (fs.existsSync(UPLOAD_LOG_PATH)) {
    try {
      list = JSON.parse(fs.readFileSync(UPLOAD_LOG_PATH, 'utf8'));
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
  }
  list.push(entry);
  fs.writeFileSync(UPLOAD_LOG_PATH, JSON.stringify(list, null, 2), 'utf8');
}

async function exchangeCodeForToken(oauthCfg, code) {
  const body = new URLSearchParams({
    code,
    client_id: oauthCfg.clientId,
    client_secret: oauthCfg.clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  const res = await fetch(oauthCfg.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Falha ao trocar codigo por token: ${JSON.stringify(json)}`);
  }
  const token = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    scope: json.scope,
    token_type: json.token_type,
    expiry_date: Date.now() + (Number(json.expires_in || 3600) - 60) * 1000,
  };
  writeToken(token);
  return token;
}

async function ensureValidAccessToken(oauthCfg) {
  let token = readToken();
  if (!token) {
    throw new Error('Nao autenticado ainda. Execute: node youtube_auto_uploader.cjs auth');
  }
  if (token.access_token && token.expiry_date && Date.now() < token.expiry_date) {
    return token.access_token;
  }
  if (!token.refresh_token) {
    throw new Error('Token expirado sem refresh_token. Execute novamente: node youtube_auto_uploader.cjs auth');
  }
  const body = new URLSearchParams({
    client_id: oauthCfg.clientId,
    client_secret: oauthCfg.clientSecret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token',
  });
  const res = await fetch(oauthCfg.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Falha ao renovar token OAuth: ${JSON.stringify(json)}`);
  }
  token = {
    ...token,
    access_token: json.access_token,
    expiry_date: Date.now() + (Number(json.expires_in || 3600) - 60) * 1000,
    ...(json.scope ? { scope: json.scope } : {}),
  };
  writeToken(token);
  return token.access_token;
}

async function getAuthenticatedChannel(accessToken) {
  const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Erro ao consultar canal YouTube: ${JSON.stringify(json)}`);
  }
  return (json.items && json.items[0]) || null;
}

function sanitizeTags(rawTags) {
  const arr = Array.isArray(rawTags)
    ? rawTags
    : String(rawTags || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  const out = [];
  let totalLen = 0;
  for (const tag of arr) {
    const clean = tag.replace(/[<>]/g, '').trim();
    if (!clean) continue;
    const cost = (clean.includes(' ') ? clean.length + 2 : clean.length) + (out.length > 0 ? 1 : 0);
    if (totalLen + cost > 490) break;
    out.push(clean);
    totalLen += cost;
  }
  return out;
}

function extractFenceAfterHeading(markdown, headingRegex) {
  const lines = markdown.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i])) {
      for (let j = i + 1; j < Math.min(lines.length, i + 8); j++) {
        if (/^```/.test(lines[j].trim())) {
          const buf = [];
          for (let k = j + 1; k < lines.length; k++) {
            if (/^```\s*$/.test(lines[k].trim())) {
              return buf.join('\n').trim();
            }
            buf.push(lines[k]);
          }
        }
        if (/^#{1,3}\s/.test(lines[j])) break;
      }
    }
  }
  return '';
}

function parseYouTubeKit(kitPath, variant = 'A') {
  const resolved = path.resolve(kitPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Kit markdown nao encontrado: ${resolved}`);
  }
  const md = fs.readFileSync(resolved, 'utf8');
  const wantB = String(variant || 'A').trim().toUpperCase() === 'B';

  let scopeMd = md;
  const idxA = md.search(/^##\s+.*Kit Canal A/m);
  const idxB = md.search(/^##\s+.*Kit Canal B/m);
  if (idxA !== -1 || idxB !== -1) {
    if (wantB && idxB !== -1) {
      const rest = md.slice(idxB);
      const nextTop = rest.slice(5).search(/\n##\s+(?!#)/);
      scopeMd = nextTop !== -1 ? rest.slice(0, nextTop + 5) : rest;
    } else if (!wantB && idxA !== -1) {
      const rest = md.slice(idxA);
      const nextTop = rest.slice(5).search(/\n##\s+(?!#)/);
      scopeMd = nextTop !== -1 ? rest.slice(0, nextTop + 5) : rest;
    }
  }

  const title =
    extractFenceAfterHeading(scopeMd, /^#{2,3}\s+T[íi]tulo\b/i) ||
    extractFenceAfterHeading(md, /^#{2,3}\s+T[íi]tulo\b/i);
  const description =
    extractFenceAfterHeading(scopeMd, /^#{2,3}\s+Descri[çc][ãa]o\b/i) ||
    extractFenceAfterHeading(md, /^#{2,3}\s+Descri[çc][ãa]o\b/i);
  const comment =
    extractFenceAfterHeading(scopeMd, /^#{2,3}\s+(?:📌\s*)?Coment[áa]rio Fixado\b/i) ||
    extractFenceAfterHeading(md, /^#{2,3}\s+(?:📌\s*)?Coment[áa]rio Fixado\b/i);
  const tagsRaw =
    extractFenceAfterHeading(scopeMd, /^#{2,3}\s+(?:🏷️?\s*)?Tags(?:\s+SEO)?\b/i) ||
    extractFenceAfterHeading(md, /^#{2,3}\s+(?:🏷️?\s*)?Tags(?:\s+SEO)?\b/i);

  const mp4Match = md.match(/`([a-z0-9_\-]+\.mp4)`/i);

  return {
    kitPath: resolved,
    variant: wantB ? 'B' : 'A',
    filename: mp4Match ? mp4Match[1] : null,
    title,
    description,
    comment,
    tags: sanitizeTags(tagsRaw),
  };
}

function resolveVideoPath(videoArg, fallbackFilename) {
  const candidates = [];
  const raw = videoArg || fallbackFilename;
  if (!raw) return null;
  candidates.push(path.resolve(raw));
  candidates.push(path.join(DOWNLOADS_DIR, path.basename(raw)));
  candidates.push(path.join(__dirname, raw));
  candidates.push(path.join(__dirname, 'output', path.basename(raw)));
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }
  return null;
}

function openUrlInBrowser(url) {
  if (process.platform === 'win32') {
    exec(`cmd /c start "" "${url.replace(/"/g, '%22')}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

async function cmdStatus(args) {
  const oauthCfg = readOAuthClientConfig(args.credentials);
  if (!oauthCfg) {
    console.log('[Status] Credencial OAuth NAO encontrada.');
    console.log(`Esperado em: ${CLIENT_SECRET_PATH}`);
    console.log(`Ou baixe client_secret_*.json na pasta: ${DOWNLOADS_DIR}`);
    console.log('Consulte YOUTUBE_API_SETUP.md para os 4 passos no Google Cloud Console.');
    return;
  }
  console.log('[Status] client_secret.json OK.');

  const tok = readToken();
  if (!tok || (!tok.access_token && !tok.refresh_token)) {
    console.log('[Status] Token OAuth ainda nao conectado.');
    console.log('Rode: node series/duplo-sentido-3d/youtube_auto_uploader.cjs auth');
    return;
  }

  const accessToken = await ensureValidAccessToken(oauthCfg);
  const channel = await getAuthenticatedChannel(accessToken);
  if (!channel) {
    console.log('[Status] Token valido, mas nenhum canal YouTube vinculado a essa conta.');
    return;
  }
  console.log('[Status] Canal YouTube conectado:');
  console.log(`  Nome:     ${channel.snippet?.title}`);
  console.log(`  Handle:   ${channel.snippet?.customUrl || '(nao definido)'}`);
  console.log(`  ID:       ${channel.id}`);
  console.log(`  Inscritos:${channel.statistics?.subscriberCount ?? 'oculto'} | Videos: ${channel.statistics?.videoCount ?? '?'}`);
}

async function cmdAuth(args) {
  const oauthCfg = readOAuthClientConfig(args.credentials);
  if (!oauthCfg) {
    console.error('[Erro] Nenhuma credencial OAuth encontrada em .youtube-auth/client_secret.json ou Downloads/client_secret*.json.');
    console.error('Siga YOUTUBE_API_SETUP.md e baixe o JSON ("App para computador").');
    process.exit(1);
  }

  const state = Math.random().toString(36).slice(2, 14);
  const authUrl = new URL(oauthCfg.authUri);
  authUrl.searchParams.set('client_id', oauthCfg.clientId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const u = new URL(req.url, REDIRECT_URI);
        if (u.pathname !== REDIRECT_PATH) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const err = u.searchParams.get('error');
        if (err) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h2>Autorizacao cancelada ou recusada: ${err}</h2>`);
          server.close();
          reject(new Error(`OAuth recusado: ${err}`));
          return;
        }
        const gotState = u.searchParams.get('state');
        const code = u.searchParams.get('code');
        if (gotState !== state || !code) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h2>Estado ou codigo OAuth invalido.</h2>');
          return;
        }

        const token = await exchangeCodeForToken(oauthCfg, code);
        const ch = await getAuthenticatedChannel(token.access_token);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          `<html><body style="font-family:sans-serif;padding:32px;background:#0f172a;color:#f8fafc">` +
            `<h2>YouTube conectado com sucesso!</h2>` +
            `<p>Canal: <b>${ch?.snippet?.title || 'OK'}</b> (${ch?.snippet?.customUrl || ch?.id || ''})</p>` +
            `<p>Pode fechar esta aba e voltar ao terminal/chat.</p></body></html>`
        );
        console.log('[Auth] Autenticado com sucesso!');
        if (ch) {
          console.log(`[Auth] Canal conectado: ${ch.snippet?.title} (${ch.snippet?.customUrl || ch.id})`);
        }
        server.close(() => resolve());
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Erro interno OAuth: ' + e.message);
        server.close();
        reject(e);
      }
    });

    server.listen(REDIRECT_PORT, REDIRECT_HOST, () => {
      console.log(`[Auth] Aguardando autorizacao Google em ${REDIRECT_URI} ...`);
      console.log(`[Auth] URL OAuth:\n${authUrl.toString()}\n`);
      if (!args['no-open']) {
        openUrlInBrowser(authUrl.toString());
      }
    });
  });
}

async function postTopLevelComment(accessToken, videoId, text) {
  const res = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        videoId,
        topLevelComment: {
          snippet: { textOriginal: text },
        },
      },
    }),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Erro ao postar comentario: ${JSON.stringify(json)}`);
  }
  return json.id;
}

async function cmdUpload(args) {
  const kitData = args.kit ? parseYouTubeKit(args.kit, args.variant || 'A') : null;
  const videoPath = resolveVideoPath(args.video, kitData?.filename);
  if (!videoPath) {
    throw new Error(
      `Arquivo de video MP4 nao encontrado. Informe --video <caminho.mp4>. Checked: ${args.video || kitData?.filename || '(vazio)'}`
    );
  }

  const title = (args.title || kitData?.title || '').trim();
  const description = (args.description || kitData?.description || '').trim();
  const tags = args.tags ? sanitizeTags(args.tags) : kitData?.tags || [];
  const commentText = (args.comment || kitData?.comment || '').trim();
  const schedule = args.schedule ? String(args.schedule).trim() : null;
  const privacy = schedule ? 'private' : String(args.privacy || 'private').trim();
  const categoryId = String(args.category || '23'); // 23 = Comedy

  if (!title) throw new Error('Titulo obrigatorio (--title ou via --kit).');
  if (schedule && isNaN(Date.parse(schedule))) {
    throw new Error(`Data/hora --schedule invalida (use ISO 8601, ex: 2026-11-26T12:00:00-03:00): ${schedule}`);
  }

  const stat = fs.statSync(videoPath);
  const metadata = {
    snippet: {
      title: title.slice(0, 100),
      description,
      tags,
      categoryId,
      defaultLanguage: 'pt-BR',
      defaultAudioLanguage: 'pt-BR',
    },
    status: {
      privacyStatus: privacy,
      ...(schedule ? { publishAt: schedule } : {}),
      selfDeclaredMadeForKids: false,
      embeddable: true,
      publicStatsViewable: true,
    },
  };

  if (args['dry-run']) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          videoPath,
          sizeMB: +(stat.size / (1024 * 1024)).toFixed(2),
          metadata,
          pendingComment: commentText || null,
        },
        null,
        2
      )
    );
    return;
  }

  const oauthCfg = readOAuthClientConfig(args.credentials);
  if (!oauthCfg) {
    throw new Error('client_secret.json ausente. Baixe no Google Cloud Console e rode auth.');
  }
  const accessToken = await ensureValidAccessToken(oauthCfg);

  console.log(`[Upload] Iniciando Resumable Upload (${(stat.size / (1024 * 1024)).toFixed(2)} MB): ${path.basename(videoPath)}`);
  const initRes = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Length': String(stat.size),
        'X-Upload-Content-Type': 'video/mp4',
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Falha ao iniciar upload resumable (${initRes.status}): ${errText}`);
  }
  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) {
    throw new Error('Header Location ausente na resposta do YouTube upload.');
  }

  const videoBuffer = fs.readFileSync(videoPath);
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Length': String(videoBuffer.length),
      'Content-Type': 'video/mp4',
    },
    body: videoBuffer,
  });
  const uploaded = await putRes.json();
  if (!putRes.ok || uploaded.error) {
    throw new Error(`Falha no envio do arquivo MP4 (${putRes.status}): ${JSON.stringify(uploaded)}`);
  }

  const videoId = uploaded.id;
  const studioUrl = `https://studio.youtube.com/video/${videoId}/edit`;
  const shortsUrl = `https://youtube.com/shorts/${videoId}`;

  let commentId = null;
  let commentNote = null;
  if (args['post-comment'] && commentText) {
    const effectivePrivacy = uploaded.status?.privacyStatus || privacy;
    if (effectivePrivacy === 'public' || effectivePrivacy === 'unlisted') {
      commentId = await postTopLevelComment(accessToken, videoId, commentText);
    } else {
      commentNote =
        'Video enviado como privado/agendado: o YouTube so permite postar comentarios pela API depois que estiver publico ou nao-listado.';
    }
  }

  const result = {
    uploadedAt: new Date().toISOString(),
    videoId,
    title: uploaded.snippet?.title || title,
    privacyStatus: uploaded.status?.privacyStatus || privacy,
    publishAt: uploaded.status?.publishAt || schedule || null,
    studioUrl,
    shortsUrl,
    commentId,
    commentNote,
  };
  appendUploadLog(result);
  console.log('[Upload] Concluido com sucesso!');
  console.log(JSON.stringify(result, null, 2));
}

async function cmdComment(args) {
  const videoId = String(args['video-id'] || '').trim();
  if (!videoId) throw new Error('Informe --video-id <ID_DO_VIDEO>.');
  const kitData = args.kit ? parseYouTubeKit(args.kit, args.variant || 'A') : null;
  const text = String(args.text || kitData?.comment || '').trim();
  if (!text) throw new Error('Informe --text "..." ou --kit <arquivo.md>.');

  const oauthCfg = readOAuthClientConfig(args.credentials);
  if (!oauthCfg) throw new Error('client_secret.json ausente.');
  const accessToken = await ensureValidAccessToken(oauthCfg);
  const commentId = await postTopLevelComment(accessToken, videoId, text);
  console.log(JSON.stringify({ ok: true, videoId, commentId, text }, null, 2));
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const cmd = args._[0] || 'status';

  if (cmd === 'status') return cmdStatus(args);
  if (cmd === 'auth') return cmdAuth(args);
  if (cmd === 'parse-kit') {
    if (!args.kit) throw new Error('Informe --kit <caminho.md>');
    const parsed = parseYouTubeKit(args.kit, args.variant || 'A');
    console.log(
      JSON.stringify(
        {
          ...parsed,
          titleChars: parsed.title.length,
          tagCount: parsed.tags.length,
        },
        null,
        2
      )
    );
    return;
  }
  if (cmd === 'upload') return cmdUpload(args);
  if (cmd === 'comment') return cmdComment(args);

  console.error(`Comando desconhecido: ${cmd}. Use: status | auth | parse-kit | upload | comment`);
  process.exit(1);
}

main().catch((err) => {
  console.error('[Erro]', err.message);
  process.exit(1);
});
