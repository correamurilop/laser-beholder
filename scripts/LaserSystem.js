// ============================================================
// LaserSystem.js — Laser Beholder
// Lógica central: movimento snake, colisão de paredes e hits
// ============================================================

class LaserSystem {
  // ----------------------------------------------------------
  // Inicialização
  // ----------------------------------------------------------
  static initialize() {
    // Avança lasers a cada mudança de turno/rodada no combate
    Hooks.on("updateCombat", async (combat, updateData) => {
      if (!game.user.isGM) return;
      if (!("turn" in updateData) && !("round" in updateData)) return;
      await LaserSystem.tickAll(combat);
    });

    // Limpa lasers quando o combate termina
    Hooks.on("deleteCombat", async () => {
      if (!game.user.isGM) return;
      await LaserSystem.clearAll();
    });

    console.log(`${MODULE_ID} | LaserSystem pronto`);
  }

  // ----------------------------------------------------------
  // Tick geral — percorre todos os emissores ativos
  // ----------------------------------------------------------
  static async tickAll(combat) {
    const emitters = canvas.tokens.placeables.filter((t) =>
      t.document.getFlag(MODULE_ID, "isEmitter")
    );
    for (const emitter of emitters) {
      await LaserSystem.tick(emitter, combat);
    }
  }

  // ----------------------------------------------------------
  // Tick individual de um emissor
  // ----------------------------------------------------------
  static async tick(emitterToken, combat) {
    const cfg = emitterToken.document.getFlag(MODULE_ID, "config");
    if (!cfg || !cfg.active) return;

    // Contador de turnos desde o último disparo
    let counter = emitterToken.document.getFlag(MODULE_ID, "turnCount") ?? 0;
    counter++;

    if (counter < cfg.frequency) {
      await emitterToken.document.setFlag(MODULE_ID, "turnCount", counter);
      return;
    }

    // Hora de avançar o laser
    await emitterToken.document.setFlag(MODULE_ID, "turnCount", 0);
    await LaserSystem.advance(emitterToken);
  }

  // ----------------------------------------------------------
  // Avança a "cobra" — cresce na cabeça, encolhe na cauda
  // ----------------------------------------------------------
  static async advance(emitterToken) {
    const cfg = emitterToken.document.getFlag(MODULE_ID, "config");
    let segments = foundry.utils.deepClone(
      emitterToken.document.getFlag(MODULE_ID, "segments") ?? []
    );

    // Posição e direção da cabeça
    let { headX, headY, headDir } = LaserSystem._getHead(emitterToken, segments, cfg);

    // Tenta crescer `speed` quadrados pela frente
    const newCells = [];
    for (let i = 0; i < cfg.speed; i++) {
      const dir = DIRECTIONS[headDir];
      const nx = headX + dir.dx;
      const ny = headY + dir.dy;

      // Parede? Para aqui
      if (LaserSystem._hasWall(headX, headY, nx, ny)) break;

      // Espelho? Redireciona e adiciona a célula do espelho
      const mirror = MirrorSystem.getMirrorAt(nx, ny);
      if (mirror) {
        const angle = mirror.document.getFlag(MODULE_ID, "mirrorAngle") ?? 45;
        headDir = MIRROR_REFLECTIONS[angle][headDir];
        newCells.push({ x: nx, y: ny, direction: headDir });
        headX = nx;
        headY = ny;
        continue;
      }

      newCells.push({ x: nx, y: ny, direction: headDir });
      headX = nx;
      headY = ny;
    }

    // Concatena e trunca pelo comprimento máximo (Y = cauda some pelo início)
    segments = [...segments, ...newCells];
    while (segments.length > cfg.length) segments.shift();

    // Persiste estado
    await emitterToken.document.setFlag(MODULE_ID, "segments", segments);

    // Dano em tokens atingidos
    await LaserSystem._applyHits(segments, cfg);

    // Atualiza visual
    await LaserVisual.update(emitterToken, segments, cfg);
  }

  // ----------------------------------------------------------
  // Reseta e limpa o laser de um emissor
  // ----------------------------------------------------------
  static async reset(emitterToken) {
    await emitterToken.document.setFlag(MODULE_ID, "segments", []);
    await emitterToken.document.setFlag(MODULE_ID, "turnCount", 0);
    await LaserVisual.clear(emitterToken);
  }

  // ----------------------------------------------------------
  // Limpa todos os lasers (fim de combate)
  // ----------------------------------------------------------
  static async clearAll() {
    const emitters = canvas.tokens.placeables.filter((t) =>
      t.document.getFlag(MODULE_ID, "isEmitter")
    );
    for (const e of emitters) await LaserSystem.reset(e);
  }

  // ----------------------------------------------------------
  // Helpers internos
  // ----------------------------------------------------------

  /** Retorna posição e direção atuais da cabeça */
  static _getHead(emitterToken, segments, cfg) {
    if (segments.length === 0) {
      // Começa do centro do token emissor
      const gs = canvas.grid.size;
      return {
        headX: Math.floor(emitterToken.document.x / gs),
        headY: Math.floor(emitterToken.document.y / gs),
        headDir: cfg.direction,
      };
    }
    const head = segments[segments.length - 1];
    return { headX: head.x, headY: head.y, headDir: head.direction };
  }

  /** Verifica colisão de parede entre dois quadrados da grade */
  static _hasWall(x1, y1, x2, y2) {
    const gs = canvas.grid.size;
    const from = { x: x1 * gs + gs / 2, y: y1 * gs + gs / 2 };
    const to   = { x: x2 * gs + gs / 2, y: y2 * gs + gs / 2 };
    const ray  = new Ray(from, to);
    return canvas.walls.checkCollision(ray, { type: "move", mode: "any" });
  }

  /** Aplica dano/efeito a tokens sobre os segmentos */
  static async _applyHits(segments, cfg) {
    const gs = canvas.grid.size;
    const hitSet = new Set(segments.map((s) => `${s.x},${s.y}`));

    for (const token of canvas.tokens.placeables) {
      if (token.document.getFlag(MODULE_ID, "isEmitter")) continue;
      if (token.document.getFlag(MODULE_ID, "isMirror")) continue;

      const tx = Math.floor(token.document.x / gs);
      const ty = Math.floor(token.document.y / gs);
      if (!hitSet.has(`${tx},${ty}`)) continue;

      // Evita spam de dano — registra turno do último hit
      const lastHit = token.document.getFlag(MODULE_ID, "lastLaserHit") ?? -99;
      const currentTurn = game.combat?.turn ?? 0;
      if (lastHit === currentTurn) continue;

      await token.document.setFlag(MODULE_ID, "lastLaserHit", currentTurn);

      // Rola o dano
      const roll = new Roll(cfg.damage || "3d6");
      await roll.evaluate();

      const rayInfo = BEHOLDER_RAYS[cfg.rayType] ?? BEHOLDER_RAYS.death;

      await ChatMessage.create({
        speaker: { alias: "☢ Emissor de Beholder" },
        flavor: `Raio de ${rayInfo.label}`,
        content: `
          <div style="border-left:4px solid ${rayInfo.color};padding:6px 10px;background:#1a1a2e;border-radius:4px;color:#eee;">
            <strong>${token.name}</strong> foi atingido pelo laser!<br>
            Dano: <strong>${roll.total}</strong> (${cfg.damageType ?? "radiante"})
          </div>`,
        rolls: [roll],
        type: CONST.CHAT_MESSAGE_TYPES?.ROLL ?? 5,
      });
    }
  }
}
