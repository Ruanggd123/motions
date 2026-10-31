/**
 * SubtitleManager — legendas de até 3 palavras, posicionadas fora da área do rosto
 * (terço inferior seguro). Sincronizadas com a timeline do vídeo.
 * Estrutura narrativa: pergunta abre, resposta fecha.
 */

/**
 * Roteiro de exemplo — curiosidade "Por que o céu é azul?"
 * Cada linha: { start, end (segundos), text (<=3 palavras), beat (pose do boneco) }
 */
export const SAMPLE_SCRIPT = [
  { start: 0.0, end: 2.0, text: 'CÉU AZUL?', beat: 'surprise' },     // pergunta abre
  { start: 2.0, end: 4.0, text: 'LUZ SOLAR', beat: 'point' },
  { start: 4.0, end: 6.0, text: 'TODAS CORES', beat: 'point' },
  { start: 6.0, end: 8.0, text: 'AZUL ESPALHA', beat: 'shrug' },
  { start: 8.0, end: 10.0, text: 'MAIS FORTE', beat: 'point' },
  { start: 10.0, end: 12.0, text: 'POR ISSO!', beat: 'surprise' },  // resposta fecha
];

export class SubtitleManager {
  constructor(element, script = SAMPLE_SCRIPT) {
    this.el = element;
    this.script = script;
    this.totalDuration = script.length > 0
      ? Math.max(...script.map(s => s.end))
      : 0;
    this.currentIndex = -1;
  }

  /** Atualiza a legenda visível baseado no tempo atual (segundos). */
  update(time) {
    const active = this.script.find(s => time >= s.start && time < s.end);
    if (active) {
      if (this.el.textContent !== active.text) {
        this.el.textContent = active.text;
      }
      this.el.classList.add('visible');
      return active.beat;
    }
    this.el.classList.remove('visible');
    return 'idle';
  }

  /** Retorna o beat (pose) ativo no tempo dado, ou 'idle'. */
  beatAt(time) {
    const active = this.script.find(s => time >= s.start && time < s.end);
    return active ? active.beat : 'idle';
  }

  reset() {
    this.el.textContent = '';
    this.el.classList.remove('visible');
    this.currentIndex = -1;
  }
}