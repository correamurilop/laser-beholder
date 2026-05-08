// ============================================================
// MirrorSystem.js — Laser Beholder
// Espelhos mágicos que redirecionam lasers
// ============================================================

class MirrorSystem {
  // ----------------------------------------------------------
  // Retorna o token de espelho em determinada posição de grade
  // ----------------------------------------------------------
  static getMirrorAt(gridX, gridY) {
    const gs = canvas.grid.size;
    return canvas.tokens.placeables.find((t) => {
      if (!t.document.getFlag(MODULE_ID, "isMirror")) return false;
      const tx = Math.floor(t.document.x / gs);
      const ty = Math.floor(t.document.y / gs);
      return tx === gridX && ty === gridY;
    }) ?? null;
  }

  // ----------------------------------------------------------
  // Aplica reflexão: dado ângulo do espelho e direção de entrada,
  // retorna a nova direção de saída.
  // ----------------------------------------------------------
  static reflect(incomingDir, mirrorAngle) {
    return MIRROR_REFLECTIONS[mirrorAngle]?.[incomingDir] ?? incomingDir;
  }

  // ----------------------------------------------------------
  // Utilitário: converte graus em ícone visual para o chat
  // ----------------------------------------------------------
  static angleIcon(angle) {
    return angle === 45 ? "\\" : "/";
  }
}
