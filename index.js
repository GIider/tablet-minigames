// index.js
import { loadTranslations, translateUI } from './Shared/language.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadTranslations('translations.json');
  translateUI();
});
