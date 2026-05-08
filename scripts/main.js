// ============================================================
// main.js — Laser Beholder
// Ponto de entrada: registra hooks e expõe API global
// ============================================================

Hooks.once("init", () => {
  console.log("Laser Beholder | init");
});

Hooks.once("ready", () => {
  // Inicializa o sistema de laser
  LaserSystem.initialize();

  // Expõe API global para macros
  game.laserBeholder = {
    /**
     * Marca o token selecionado como emissor e abre o diálogo de config.
     * Uso em macro:  game.laserBeholder.configEmitter()
     */
    configEmitter: async (token) => {
      const t = token ?? canvas.tokens.controlled[0];
      if (!t) return ui.notifications.warn("Selecione um token primeiro.");
      await LaserDialog.openEmitterConfig(t);
    },

    /**
     * Marca o token selecionado como espelho e abre o diálogo de config.
     * Uso em macro:  game.laserBeholder.configMirror()
     */
    configMirror: async (token) => {
      const t = token ?? canvas.tokens.controlled[0];
      if (!t) return ui.notifications.warn("Selecione um token primeiro.");
      await LaserDialog.openMirrorConfig(t);
    },

    /** Reseta o laser de um emissor específico */
    reset: async (token) => {
      const t = token ?? canvas.tokens.controlled[0];
      if (!t) return ui.notifications.warn("Selecione o emissor.");
      await LaserSystem.reset(t);
    },

    /** Avança o laser manualmente (útil fora do combate) */
    advance: async (token) => {
      const t = token ?? canvas.tokens.controlled[0];
      if (!t) return ui.notifications.warn("Selecione o emissor.");
      await LaserSystem.advance(t);
    },

    /** Limpa todos os efeitos visuais de laser */
    clearAll: async () => {
      await LaserSystem.clearAll();
    },
  };

  // Adiciona botão no HUD do token para acesso rápido
  Hooks.on("getTokenHUD", (hud, html, data) => {
    const token = canvas.tokens.get(data._id);
    if (!token) return;

    const isEmitter = token.document.getFlag(MODULE_ID, "isEmitter");
    const isMirror  = token.document.getFlag(MODULE_ID, "isMirror");

    if (isEmitter || isMirror) {
      const icon = isEmitter ? "fa-eye" : "fa-diamond";
      const title = isEmitter ? "Configurar Emissor" : "Configurar Espelho";

      const btn = $(`<div class="control-icon" title="${title}">
        <i class="fas ${icon}"></i>
      </div>`);

      btn.on("click", async () => {
        if (isEmitter) await LaserDialog.openEmitterConfig(token);
        else           await LaserDialog.openMirrorConfig(token);
      });

      html.find(".col.right").prepend(btn);
    }
  });

  console.log("Laser Beholder | pronto — use game.laserBeholder para macros");
});
