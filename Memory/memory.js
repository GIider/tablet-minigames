import { showVictoryScreen } from '../Shared/victoryScreen.js';
import { currentLang, loadTranslations, translateUI } from '../Shared/language.js';

document.addEventListener("DOMContentLoaded", async () => {
  // Load header
  const header = await fetch('../Shared/header.html').then(res => res.text());
  document.getElementById('sharedHeader').innerHTML = header;

  // Load translations
  const translations = await loadTranslations('translations.json');
  translateUI();

  const board = document.getElementById("gameBoard");
  const status = document.getElementById("status");
  const missesDisplay = document.getElementById("misses");
  const startBtn = document.getElementById("startBtn");
  const themeSelect = document.getElementById("themeSelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const peekToggle = document.getElementById("peekToggle");

  let flippedCards = [];
  let lockBoard = false;
  let missCount = 0;
  let currentSettings = {};

  const emojiThemes = {
    animals: ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐸", "🐨", "🐯", "🦁", "🐷", "🦝", "🦓", "🦍", "🐵"],
    food: ["🍕", "🍔", "🍟", "🍩", "🍓", "🍇", "🍎", "🍰", "🍪", "🥦", "🍉", "🍣", "🍜", "🥞", "🌮", "🍌"],
    faces: ["😀", "😍", "😜", "🤔", "😎", "🥶", "😱", "😡", "😭", "🤪", "🥳", "😴", "😇", "🤯", "😷", "😈"],
    travel: ["✈️", "🚗", "🚢", "🚀", "🏝️", "🗽", "🗻", "⛺", "🚂", "🚌", "🚉", "🛶", "🚁", "🚲", "🚤", "🛫"],
    spooky: ["🎃", "👻", "☠️", "🧛", "🕷️", "🕸️", "🦇", "🧟", "🪦", "🧙", "🩸", "🧞", "🫥", "🫣", "🫧", "🕯️"]
  };

  const difficultyMap = {
    easy: 4,
    medium: 8,
    hard: 12,
    extreme: 16
  };

  const columnMap = {
    easy: 4,
    medium: 4,
    hard: 6,
    extreme: 8
  };

  startBtn.addEventListener("click", () => {
    currentSettings = {
      theme: themeSelect.value,
      difficulty: difficultySelect.value,
      peekAtStart: peekToggle.checked
    };
    initGame();
  });

  function initGame() {
    const { theme, difficulty, peekAtStart } = currentSettings;
    const numPairs = difficultyMap[difficulty];
    const columns = columnMap[difficulty];
    const selectedEmojis = emojiThemes[theme].slice(0, numPairs);

    missCount = 0;
    updateMissDisplay();
    resetBoard();
    createBoard(selectedEmojis, columns, peekAtStart);
  }

  function handleWin() {
    showVictoryScreen({
      message: translations[currentLang].victory,
      duration: 3000,
      onComplete: () => initGame()
    });
  }

  function resetBoard() {
    board.innerHTML = "";
    flippedCards = [];
    lockBoard = false;
    status.textContent = "";
  }

  function updateMissDisplay() {
    missesDisplay.textContent = `${translations[currentLang].misses}: ${missCount}`;
  }

  function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
  }

  function createBoard(emojiPairs, columns, peekAtStart) {
    const emojis = shuffle([...emojiPairs, ...emojiPairs]);

    emojis.forEach((emoji, index) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.emoji = emoji;
      card.dataset.index = index;

      const front = document.createElement("div");
      front.classList.add("cardFace", "front");
      front.textContent = emoji;

      const back = document.createElement("div");
      back.classList.add("cardFace", "back");
      back.textContent = "❓";

      card.appendChild(front);
      card.appendChild(back);

      card.addEventListener("click", () => flipCard(card));
      board.appendChild(card);
    });

    board.style.gridTemplateColumns = `repeat(${columns}, 100px)`;

    if (peekAtStart) {
      const allCards = document.querySelectorAll(".card");
      allCards.forEach(card => card.classList.add("flipped"));
      lockBoard = true;
      setTimeout(() => {
        allCards.forEach(card => card.classList.remove("flipped"));
        lockBoard = false;
      }, 2000);
    }
  }

  function flipCard(card) {
    if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) return;

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      checkMatch();
    }
  }

  function checkMatch() {
    const [first, second] = flippedCards;
    lockBoard = true;

    if (first.dataset.emoji === second.dataset.emoji) {
      first.classList.add("matched");
      second.classList.add("matched");
      flippedCards = [];
      lockBoard = false;
      status.textContent = translations[currentLang].match;
      checkWin();
    } else {
      missCount++;
      updateMissDisplay();
      status.textContent = translations[currentLang].noMatch;
      setTimeout(() => {
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        flippedCards = [];
        lockBoard = false;
        status.textContent = "";
      }, 1000);
    }
  }

  function checkWin() {
    const matched = document.querySelectorAll(".matched").length;
    const total = document.querySelectorAll(".card").length;
    if (matched === total) {
      setTimeout(handleWin, 300);
    }
  }
});
