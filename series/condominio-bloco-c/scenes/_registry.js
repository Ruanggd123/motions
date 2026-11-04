/**
 * BIBLIOTECA DE CENAS DA SÉRIE CONDOMÍNIO SOLARIS · BLOCO C
 * =========================================================
 * Cada cena vive em seu próprio arquivo e se registra aqui. Os episódios
 * consomem `StudioScenes.play(nome, ctx, tempoSec)` em vez de reimplementar
 * desenho no HTML — então toda cena já aprovada vira PADRÃO reutilizável.
 *
 * REGRA DE OURO (não quebrar cenas aprovadas):
 *   1. Uma cena registrada NUNCA é reescrita para "melhorar" — cria-se `_v2`
 *      e o episódio novo aponta para a versão nova. A antiga continua disponível.
 *   2. `meta.pinned === true` protege a cena: o QA recusa sobrescrita.
 *   3. Todo episódio anterior continua funcionando: `play()` só substitui o
 *      desenho de quem já foi migrado; o resto segue o código do HTML.
 *
 * API de uma cena:
 *   StudioScenes.define('portaria_frontal', {
 *     meta: { nome, angulo, profundidade, criadoEm, pinned },
 *     draw(ctx, { W, H, t, S })   // S = estado compartilhado do episódio
 *   });
 */
(function (global) {
  const registry = new Map();

  const REQUIRED_META = ['nome', 'angulo'];

  function define(name, scene) {
    if (!name || typeof name !== 'string') {
      throw new Error('StudioScenes.define: nome da cena é obrigatório.');
    }
    if (!scene || typeof scene.draw !== 'function') {
      throw new Error(`StudioScenes.define("${name}"): a cena precisa de um método draw(ctx, estado).`);
    }
    const meta = scene.meta || {};
    for (const key of REQUIRED_META) {
      if (!meta[key]) {
        throw new Error(`StudioScenes.define("${name}"): meta.${key} é obrigatório.`);
      }
    }

    const existing = registry.get(name);
    if (existing && existing.meta.pinned) {
      console.warn(`[StudioScenes] "${name}" está PINADA e não será sobrescrita.`);
      return existing;
    }

    const entry = {
      name,
      meta: {
        nome: meta.nome,
        angulo: meta.angulo,
        profundidade: meta.profundidade || 'plana',
        criadoEm: meta.criadoEm || '2026-11-04',
        pinned: meta.pinned === true
      },
      draw: scene.draw
    };
    registry.set(name, entry);
    return entry;
  }

  function has(name) {
    return registry.has(name);
  }

  function get(name) {
    return registry.get(name) || null;
  }

  function list() {
    return Array.from(registry.values()).map((s) => ({ name: s.name, ...s.meta }));
  }

  /**
   * Desenha a cena pedida. Devolve `false` quando a cena não está registrada —
   * o chamador então cai no desenho legado do próprio episódio.
   */
  function play(name, ctx, state) {
    const scene = registry.get(name);
    if (!scene) return false;
    scene.draw(ctx, state);
    return true;
  }

  global.StudioScenes = { define, has, get, list, play, _registry: registry };
})(typeof window !== 'undefined' ? window : globalThis);
