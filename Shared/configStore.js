export function saveConfig(gameKey, config) {
  try {
    localStorage.setItem(`config_${gameKey}`, JSON.stringify(config));
  } catch (e) {
    console.warn("Could not save config:", e);
  }
}

export function loadConfig(gameKey, defaults = {}) {
  try {
    const stored = localStorage.getItem(`config_${gameKey}`);
    return stored ? { ...defaults, ...JSON.parse(stored) } : { ...defaults };
  } catch (e) {
    console.warn("Could not load config:", e);
    return { ...defaults };
  }
}
