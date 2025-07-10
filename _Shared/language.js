// Set default language if none is set
if (!localStorage.getItem('lang')) {
  const browserLang = navigator.language.startsWith('de') ? 'de' : 'en';
  localStorage.setItem('lang', browserLang);
}
export let currentLang = localStorage.getItem('lang') || 'en';

let translations = {};

export async function loadTranslations(path = 'translations.json') {
  const res = await fetch(path);
  translations = await res.json();
  return translations;
}

export function translateUI() {
  if (!translations[currentLang]) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.innerText = translations[currentLang][key];
    }
  });

  // Translate select options if matching keys exist
  document.querySelectorAll('option[value]').forEach(opt => {
    const val = opt.value;
    if (translations[currentLang][val]) {
      opt.innerText = translations[currentLang][val];
    }
  });

  updateLangButton(); // only affects if button exists
}

export function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'de' : 'en';
  localStorage.setItem('lang', currentLang);
  location.reload();
}

export function updateLangButton() {
  const btn = document.getElementById('languageButton');
  if (btn) btn.textContent = currentLang === 'en' ? '🇬🇧' : '🇩🇪';
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadTranslations();
  translateUI(); // 🚀 translate immediately

  const langBtn = document.getElementById('languageButton');
  if (langBtn) {
    langBtn.addEventListener('click', toggleLanguage);
    updateLangButton();
  }
});
