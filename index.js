// index.js
import { loadTranslations, translateUI } from './_Shared/language.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadTranslations('translations.json');
  translateUI();
});
