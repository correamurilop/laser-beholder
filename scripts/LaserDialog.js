// ============================================================
// LaserDialog.js — Laser Beholder
// Diálogos de configuração para emissor e espelho
// ============================================================

class LaserDialog {
  // ----------------------------------------------------------
  // Diálogo: criar/configurar Emissor de Laser
  // ----------------------------------------------------------
  static async openEmitterConfig(token) {
    const current = token?.document.getFlag(MODULE_ID, "config") ?? {};

    const rayOptions = Object.entries(BEHOLDER_RAYS)
      .map(([k, v]) => `<option value="${k}" ${current.rayType === k ? "selected" : ""}>${v.label}</option>`)
      .join("");

    const dirOptions = ["N", "S", "E", "W"]
      .map((d) => `<option value="${d}" ${current.direction === d ? "selected" : ""}>${d}</option>`)
      .join("");

    const content = `
      <form class="laser-form">
        <fieldset>
          <legend>🔴 Emissor de Laser — Beholder</legend>

          <div class="form-group">
            <label>Tipo de Raio</label>
            <select name="rayType">${rayOptions}</select>
          </div>

          <div class="form-group">
            <label>Direção Inicial</label>
            <select name="direction">${dirOptions}</select>
          </div>

          <div class="form-group">
            <label>Velocidade — X <small>(quadrados por ativação)</small></label>
            <input type="number" name="speed" value="${current.speed ?? 3}" min="1" max="30"/>
          </div>

          <div class="form-group">
            <label>Comprimento — Y <small>(tamanho total da cobra)</small></label>
            <input type="number" name="length" value="${current.length ?? 6}" min="1" max="60"/>
          </div>

          <div class="form-group">
            <label>Frequência — Z <small>(dispara a cada Z turnos)</small></label>
            <input type="number" name="frequency" value="${current.frequency ?? 1}" min="1" max="20"/>
          </div>

          <div class="form-group">
            <label>Fórmula de Dano</label>
            <input type="text" name="damage" value="${current.damage ?? "3d6"}" placeholder="ex: 2d10+5"/>
          </div>

          <div class="form-group">
            <label>Tipo de Dano</label>
            <input type="text" name="damageType" value="${current.damageType ?? "radiante"}" placeholder="ex: fogo, radiante"/>
          </div>

          <div class="form-group">
            <label>Ativo?</label>
            <input type="checkbox" name="active" ${current.active !== false ? "checked" : ""}/>
          </div>
        </fieldset>
      </form>`;

    return new Promise((resolve) => {
      new Dialog({
        title: "Configurar Emissor de Laser",
        content,
        buttons: {
          ok: {
            label: "Salvar",
            icon: '<i class="fas fa-save"></i>',
            callback: async (html) => {
              const fd = new FormDataExtended(html[0].querySelector("form"));
              const data = fd.object;

              const config = {
                rayType:    data.rayType,
                direction:  data.direction,
                speed:      parseInt(data.speed) || 3,
                length:     parseInt(data.length) || 6,
                frequency:  parseInt(data.frequency) || 1,
                damage:     data.damage || "3d6",
                damageType: data.damageType || "radiante",
                active:     !!data.active,
              };

              await token.document.setFlag(MODULE_ID, "isEmitter", true);
              await token.document.setFlag(MODULE_ID, "config", config);
              await token.document.setFlag(MODULE_ID, "segments", []);
              await token.document.setFlag(MODULE_ID, "turnCount", 0);

              ui.notifications.info(`Emissor configurado! Velocidade:${config.speed} Comprimento:${config.length} Freq.:${config.frequency}`);
              resolve(config);
            },
          },
          reset: {
            label: "Resetar Laser",
            icon: '<i class="fas fa-undo"></i>',
            callback: async () => {
              await LaserSystem.reset(token);
              ui.notifications.info("Laser resetado.");
              resolve(null);
            },
          },
          cancel: {
            label: "Cancelar",
            icon: '<i class="fas fa-times"></i>',
            callback: () => resolve(null),
          },
        },
        default: "ok",
      }).render(true);
    });
  }

  // ----------------------------------------------------------
  // Diálogo: criar/configurar Espelho Mágico
  // ----------------------------------------------------------
  static async openMirrorConfig(token) {
    const currentAngle = token?.document.getFlag(MODULE_ID, "mirrorAngle") ?? 45;

    const content = `
      <form class="laser-form">
        <fieldset>
          <legend>🪞 Espelho Mágico</legend>

          <div class="form-group">
            <label>Ângulo do Espelho</label>
            <select name="angle">
              <option value="45"  ${currentAngle === 45  ? "selected" : ""}>45° — \\ (NW-SE)</option>
              <option value="135" ${currentAngle === 135 ? "selected" : ""}>135° — / (NE-SW)</option>
            </select>
          </div>

          <p style="font-size:0.85em;color:#aaa;margin-top:8px;">
            <strong>45° (\\ ):</strong> E→S, W→N, N→W, S→E<br>
            <strong>135° (/):</strong> E→N, W→S, N→E, S→W
          </p>
        </fieldset>
      </form>`;

    return new Promise((resolve) => {
      new Dialog({
        title: "Configurar Espelho Mágico",
        content,
        buttons: {
          ok: {
            label: "Salvar",
            icon: '<i class="fas fa-save"></i>',
            callback: async (html) => {
              const fd = new FormDataExtended(html[0].querySelector("form"));
              const angle = parseInt(fd.object.angle);
              await token.document.setFlag(MODULE_ID, "isMirror", true);
              await token.document.setFlag(MODULE_ID, "mirrorAngle", angle);
              ui.notifications.info(`Espelho configurado em ${angle}°`);
              resolve(angle);
            },
          },
          cancel: {
            label: "Cancelar",
            icon: '<i class="fas fa-times"></i>',
            callback: () => resolve(null),
          },
        },
        default: "ok",
      }).render(true);
    });
  }
}
