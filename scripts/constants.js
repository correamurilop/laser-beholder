// ============================================================
// constants.js — Laser Beholder
// Constantes globais do módulo
// ============================================================

const MODULE_ID = "laser-beholder";

// Vetores de deslocamento por direção cardinal
const DIRECTIONS = {
  N: { dx: 0, dy: -1 },
  S: { dx: 0, dy: 1 },
  E: { dx: 1, dy: 0 },
  W: { dx: -1, dy: 0 },
};

/**
 * Tabelas de reflexão dos espelhos.
 *
 * Espelho 45°  (\) — face NW-SE
 *   Laser vindo de E bate na face → vai para S
 *   Laser vindo de W bate na face → vai para N
 *   Laser vindo de N bate na face → vai para W
 *   Laser vindo de S bate na face → vai para E
 *
 * Espelho 135° (/) — face NE-SW
 *   Laser vindo de E → vai para N
 *   Laser vindo de W → vai para S
 *   Laser vindo de N → vai para E
 *   Laser vindo de S → vai para W
 */
const MIRROR_REFLECTIONS = {
  45:  { E: "S", W: "N", N: "W", S: "E" }, // espelho "\"
  135: { E: "N", W: "S", N: "E", S: "W" }, // espelho "/"
};

// Raios do Beholder — nome, cor hex e arquivo JB2A sugerido
const BEHOLDER_RAYS = {
  charm:       { label: "Charme",        color: "#FF69B4", tint: "#FF69B4", file: "jb2a.energy_beam.normal.bluepurple" },
  paralyze:    { label: "Paralisia",     color: "#FFD700", tint: "#FFD700", file: "jb2a.energy_beam.normal.yellow" },
  fear:        { label: "Medo",          color: "#FF6600", tint: "#FF6600", file: "jb2a.energy_beam.normal.orange" },
  slow:        { label: "Lentidão",      color: "#00CC44", tint: "#00CC44", file: "jb2a.energy_beam.normal.green" },
  enervate:    { label: "Enervação",     color: "#9900FF", tint: "#9900FF", file: "jb2a.energy_beam.normal.purple" },
  telekinesis: { label: "Telecinese",    color: "#0088FF", tint: "#0088FF", file: "jb2a.energy_beam.normal.blue" },
  sleep:       { label: "Sono",          color: "#00FFFF", tint: "#00FFFF", file: "jb2a.energy_beam.normal.blueyellow" },
  petrify:     { label: "Petrificação",  color: "#AAAAAA", tint: "#AAAAAA", file: "jb2a.energy_beam.normal.gray" },
  disintegrate:{ label: "Desintegração", color: "#004400", tint: "#00FF00", file: "jb2a.energy_beam.normal.green" },
  death:       { label: "Morte",         color: "#880000", tint: "#FF0000", file: "jb2a.energy_beam.normal.red" },
};

// Fallback de arquivo de beam caso JB2A patreon não esteja disponível
const FALLBACK_BEAM_FILE = "jb2a.scorching_ray";
