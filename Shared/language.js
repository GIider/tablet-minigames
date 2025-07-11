// language.js

// Set default language if none is set
if (!localStorage.getItem('lang')) {
  const browserLang = navigator.language.startsWith('de') ? 'de' : 'en';
  localStorage.setItem('lang', browserLang);
}
export let currentLang = localStorage.getItem('lang') || 'en';

let translations = {};

export async function loadTranslations(path = 'translations.json') {
  console.log("[i18n] Loading translations from", path);
  const res = await fetch(path);
  translations = await res.json();
  return translations;
}

export function translateUI() {
  if (!translations[currentLang]) {
    console.warn("[i18n] No translations found for", currentLang);
    return;
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.innerText = translations[currentLang][key];
    }
  });

  // Translate <option> elements
  document.querySelectorAll('option[value]').forEach(opt => {
    const val = opt.value;
    if (translations[currentLang][val]) {
      opt.innerText = translations[currentLang][val];
    }
  });

  updateLangButton();
}

export function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'de' : 'en';
  localStorage.setItem('lang', currentLang);
  console.log("[i18n] Language toggled to:", currentLang);
  location.reload();
}

export function updateLangButton() {
  const btn = document.getElementById('languageButton');
  if (btn) {
    btn.textContent = currentLang === 'en' ? '🇬🇧' : '🇩🇪';
    console.log("[i18n] Language button updated:", btn.textContent);
  } else {
    console.warn("[i18n] Language button not found");
  }
}

(async () => {
  console.log("[i18n] language.js loaded ");

  if (document.readyState === "loading") {
    await new Promise(resolve => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  console.log("[i18n] DOM fully loaded");

  await loadTranslations();
  translateUI();

  const langBtn = document.getElementById('languageButton');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      console.log("[i18n] Language button clicked");
      toggleLanguage();
    });
    console.log("[i18n] Language button registered");
  } else {
    console.warn("[i18n] Language button not found on page load");
  }
})();

