// ============================================================
// LaserVisual.js — Laser Beholder
// Efeitos visuais via Sequencer + JB2A
// ============================================================

class LaserVisual {
  // ----------------------------------------------------------
  // Atualiza o visual do laser (apaga o antigo, desenha o novo)
  // ----------------------------------------------------------
  static async update(emitterToken, segments, cfg) {
    await LaserVisual.clear(emitterToken);
    if (segments.length === 0) return;

    const rayInfo = BEHOLDER_RAYS[cfg.rayType] ?? BEHOLDER_RAYS.death;
    const gs = canvas.grid.size;

    // Agrupa segmentos consecutivos em "runs" (trechos lineares)
    // para desenhar um beam contínuo por trecho
    const runs = LaserVisual._buildRuns(segments);

    const seq = new Sequence();

    for (let i = 0; i < runs.length; i++) {
      const run = runs[i];
      const from = LaserVisual._gridCenter(run.startX, run.startY, gs);
      const to   = LaserVisual._gridCenter(run.endX,   run.endY,   gs);

      // Tenta usar arquivo do JB2A; cai no fallback se não existir
      const file = await LaserVisual._resolveFile(rayInfo.file);

      seq
        .effect()
        .name(`laser-${emitterToken.id}-run-${i}`)
        .file(file)
        .atLocation(from)
        .stretchTo(to, { tiling: true })
        .tint(rayInfo.tint)
        .opacity(0.9)
        .scaleToObject(1)
        .persist()
        .zIndex(200 + i);
    }

    // Efeito de brilho na cabeça (último segmento)
    const head = segments[segments.length - 1];
    const headPos = LaserVisual._gridCenter(head.x, head.y, gs);
    const glowFile = await LaserVisual._resolveFile("jb2a.impact.004.yellow");

    seq
      .effect()
      .name(`laser-${emitterToken.id}-head`)
      .file(glowFile)
      .atLocation(headPos)
      .scale(0.4)
      .tint(rayInfo.tint)
      .opacity(0.7)
      .duration(400)
      .zIndex(300);

    await seq.play();
  }

  // ----------------------------------------------------------
  // Remove todos os efeitos deste emissor
  // ----------------------------------------------------------
  static async clear(emitterToken) {
    await Sequencer.EffectManager.endEffects({
      name: `laser-${emitterToken.id}`,
    });
  }

  // ----------------------------------------------------------
  // Remove TODOS os efeitos de laser (fim de combate etc.)
  // ----------------------------------------------------------
  static async clearAll() {
    await Sequencer.EffectManager.endEffects({ name: "laser-" });
  }

  // ----------------------------------------------------------
  // Helpers internos
  // ----------------------------------------------------------

  /** Transforma segmentos contíguos em "runs" lineares para beam */
  static _buildRuns(segments) {
    const runs = [];
    if (!segments.length) return runs;

    let runStart = segments[0];
    let prevDir  = segments[0].direction;

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.direction !== prevDir) {
        runs.push({
          startX: runStart.x, startY: runStart.y,
          endX: segments[i - 1].x, endY: segments[i - 1].y,
          direction: prevDir,
        });
        runStart = seg;
        prevDir = seg.direction;
      }
    }
    // Último run
    runs.push({
      startX: runStart.x, startY: runStart.y,
      endX: segments[segments.length - 1].x,
      endY: segments[segments.length - 1].y,
      direction: prevDir,
    });
    return runs;
  }

  /** Centro em pixels de uma célula da grade */
  static _gridCenter(gridX, gridY, gs) {
    return { x: gridX * gs + gs / 2, y: gridY * gs + gs / 2 };
  }

  /**
   * Resolve o arquivo de efeito.
   * Tenta o caminho preferido e cai para o fallback se não existir.
   */
  static async _resolveFile(preferred) {
    try {
      // Sequencer.Database pode não existir se patreon não estiver instalado
      if (Sequencer?.Database?.entryExists(preferred)) return preferred;
    } catch (_) {}
    return FALLBACK_BEAM_FILE;
  }
}
