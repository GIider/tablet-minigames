import { showVictoryScreen } from '../Shared/victoryScreen.js';
import { currentLang, loadTranslations, translateUI } from '../Shared/language.js';
import { saveConfig, loadConfig } from '../Shared/configStore.js';

let words = [];
let allCategories = {};
let translations = {};
let gridWidth = 10;
let gridHeight = 10;
let wordCount = 4;
let grid = [];
let positions = {};
let selected = [];
let isDragging = false;

const directionBias = {
  easy: { horizontalVertical: 0.8, diagonal: 0.2 },
  medium: { horizontalVertical: 0.6, diagonal: 0.4 },
  hard: { horizontalVertical: 0.3, diagonal: 0.7 }
};

const straightDirs = [[0, 1], [1, 0]];
const diagonalDirs = [[1, 1], [-1, 1]];

async function loadCategories() {
  const res = await fetch('wordlists.json');
  allCategories = await res.json();
  populateCategorySelect();
  translateUI();
}

function populateCategorySelect() {
  const select = document.getElementById("categorySelect");
  const categories = Object.keys(allCategories[currentLang]);

  select.innerHTML = `
    <option value="__RANDOM__">${translations[currentLang].random}</option>
    ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join("")}
  `;
}

function wordFitsGrid(word) {
  return word.length <= gridWidth - 2 && word.length <= gridHeight - 2;
}

function placeWords() {
  grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(""));
  positions = {};

  const difficulty = document.getElementById("difficultySelect").value;
  const bias = directionBias[difficulty] || directionBias.easy;

  let dirPool = [];
  dirPool.push(...Array(Math.round(bias.horizontalVertical * 10)).fill(straightDirs).flat());
  dirPool.push(...Array(Math.round(bias.diagonal * 10)).fill(diagonalDirs).flat());

  const placedWords = [];
  const usedWords = new Set();
  let availableWords = [...words];

  while (placedWords.length < wordCount && availableWords.length > 0) {
    const word = availableWords.pop();
    if (!word) break;

    let placed = false;
    for (let attempts = 0; attempts < 100 && !placed; attempts++) {
      const [dx, dy] = dirPool[Math.floor(Math.random() * dirPool.length)];

      const maxX = dx === 1 ? gridWidth - word.length : dx === -1 ? word.length - 1 : gridWidth - 1;
      const maxY = dy === 1 ? gridHeight - word.length : gridHeight - 1;
      const minX = dx === -1 ? word.length - 1 : 0;

      const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      const y = Math.floor(Math.random() * (maxY + 1));

      if (canPlace(word, x, y, dx, dy)) {
        for (let i = 0; i < word.length; i++) {
          grid[y + i * dy][x + i * dx] = word[i];
        }
        positions[word] = Array.from({ length: word.length }, (_, i) => `${y + i * dy}-${x + i * dx}`);
        placedWords.push(word);
        placed = true;
      }
    }

    if (!placed) {
      const allWords = Object.values(allCategories[currentLang]).flat();
      const unused = allWords
        .filter(w => !usedWords.has(w.toUpperCase()))
        .filter(w => wordFitsGrid(w.toUpperCase()));

      if (unused.length) {
        const newWord = unused[Math.floor(Math.random() * unused.length)].toUpperCase();
        availableWords.unshift(newWord);
        usedWords.add(newWord);
      }
    }
  }

  words = placedWords;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (!grid[y][x]) grid[y][x] = randomLetter();
    }
  }
}

function canPlace(word, x, y, dx, dy) {
  for (let i = 0; i < word.length; i++) {
    const nx = x + i * dx, ny = y + i * dy;
    if (nx < 0 || ny < 0 || nx >= gridWidth || ny >= gridHeight) return false;
    if (grid[ny][nx] && grid[ny][nx] !== word[i]) return false;
  }
  return true;
}

function randomLetter() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function drawGrid() {
  const gridDiv = document.getElementById("grid");
  gridDiv.style.gridTemplateColumns = `repeat(${gridWidth}, 35px)`;
  gridDiv.innerHTML = "";

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const div = document.createElement("div");
      div.className = "cell";
      div.textContent = grid[y][x];
      div.dataset.pos = `${y}-${x}`;
      gridDiv.appendChild(div);
    }
  }
}

function drawWordList() {
  const toFind = document.getElementById("wordListToFind");
  toFind.innerHTML = "";

  words.forEach(word => {
    const div = document.createElement("div");
    div.id = "word-" + word;
    div.className = "word-entry";
    div.textContent = word;
    toFind.appendChild(div);
  });
}

function giveHint() {
  const unfound = words.filter(w => {
    const el = document.getElementById("word-" + w);
    return el && !el.classList.contains("found");
  });

  if (unfound.length === 0) return;

  const randomWord = unfound[Math.floor(Math.random() * unfound.length)];
  const wordCells = positions[randomWord] || [];

  const unmarkedCells = wordCells.filter(pos => {
    const cell = document.querySelector(`[data-pos="${pos}"]`);
    return cell && !cell.classList.contains("found-cell");
  });

  if (unmarkedCells.length === 0) return;

  const randomPos = unmarkedCells[Math.floor(Math.random() * unmarkedCells.length)];
  const cell = document.querySelector(`[data-pos="${randomPos}"]`);
  if (cell) {
    cell.classList.add("hinted");
    setTimeout(() => cell.classList.remove("hinted"), 1500);
  }
}

function initGame() {
  const categorySelect = document.getElementById("categorySelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const widthInput = document.getElementById("gridWidth");
  const heightInput = document.getElementById("gridHeight");
  const wordCountInput = document.getElementById("wordCount");

  const settings = {
    category: categorySelect.value,
    difficulty: difficultySelect.value,
    width: parseInt(widthInput.value),
    height: parseInt(heightInput.value),
    count: parseInt(wordCountInput.value)
  };

  saveConfig("wordsearch", settings);

  gridWidth = settings.width;
  gridHeight = settings.height;
  wordCount = settings.count;

  document.getElementById("hintControls").style.display = "block";

  let categoryWords = settings.category === "__RANDOM__"
    ? [...new Set(Object.values(allCategories[currentLang]).flat())]
    : allCategories[currentLang][settings.category] || [];

  words = categoryWords
    .filter(word => wordFitsGrid(word.toUpperCase()))
    .sort(() => 0.5 - Math.random())
    .slice(0, wordCount)
    .map(w => w.toUpperCase());

  placeWords();
  drawGrid();
  drawWordList();
}

let startPos = null;
let currentDirection = null;

document.addEventListener("pointerdown", e => {
  const cell = document.elementFromPoint(e.clientX, e.clientY);
  if (cell?.classList.contains("cell")) {
    isDragging = true;
    selected = [cell.dataset.pos];
    startPos = cell.dataset.pos.split('-').map(Number);
    currentDirection = null;
    cell.classList.add("highlight");
  }
});

document.addEventListener("pointermove", e => {
  if (!isDragging || !startPos) return;

  const cell = document.elementFromPoint(e.clientX, e.clientY);
  if (!cell?.classList.contains("cell")) return;

  const pos = cell.dataset.pos.split('-').map(Number);
  if (selected.includes(cell.dataset.pos)) return;

  if (selected.length === 1) {
    // Determine direction after second cell
    currentDirection = [pos[0] - startPos[0], pos[1] - startPos[1]];
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const norm = Math.abs(gcd(currentDirection[0], currentDirection[1]));
    currentDirection = currentDirection.map(n => n / norm);
  }

  // Check direction consistency
  const lastPos = selected[selected.length - 1].split('-').map(Number);
  const delta = [pos[0] - lastPos[0], pos[1] - lastPos[1]];
  if (
    currentDirection &&
    delta[0] === currentDirection[0] &&
    delta[1] === currentDirection[1]
  ) {
    selected.push(cell.dataset.pos);
    cell.classList.add("highlight");
  }
});

document.addEventListener("pointerup", () => {
  if (!isDragging) return;
  isDragging = false;

  for (const word of words) {
    const wordPositions = positions[word];
    if (arraysEqual(wordPositions, selected) || arraysEqual(wordPositions.slice().reverse(), selected)) {
      const wordElement = document.getElementById("word-" + word);
      wordElement.classList.add("found", "animated");
      setTimeout(() => {
        wordElement.style.textDecoration = "line-through";
        wordElement.classList.remove("animated");
      }, 300);

      wordPositions.forEach(pos => {
        const cell = document.querySelector(`[data-pos="${pos}"]`);
        if (cell) {
          cell.classList.add("found-cell", "animated");
          setTimeout(() => cell.classList.remove("animated"), 500);
        }
      });
    }
  }

  selected = [];
  document.querySelectorAll(".cell").forEach(c => c.classList.remove("highlight"));

  const foundCount = words.filter(w => document.getElementById("word-" + w).classList.contains("found")).length;
  if (foundCount === words.length) {
    setTimeout(() => {
      showVictoryScreen({
        message: translations[currentLang].completed,
        duration: 3000,
        onComplete: () => initGame()
      });
    }, 300);
  }
});

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function toggleAdvancedSettings() {
  const panel = document.getElementById("advancedSettings");
  panel.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", async () => {
  translations = await loadTranslations('translations.json');
  await loadCategories();
  translateUI();

  const defaults = {
    category: "__RANDOM__",
    difficulty: "easy",
    width: 10,
    height: 10,
    count: 4
  };

  const restored = loadConfig("wordsearch", defaults);
  document.getElementById("categorySelect").value = restored.category;
  document.getElementById("difficultySelect").value = restored.difficulty;
  document.getElementById("gridWidth").value = restored.width;
  document.getElementById("gridHeight").value = restored.height;
  document.getElementById("wordCount").value = restored.count;

  document.getElementById("startButton")?.addEventListener("click", initGame);
  document.getElementById("toggleAdvanced")?.addEventListener("click", toggleAdvancedSettings);
  document.getElementById("hintButton")?.addEventListener("click", giveHint);
});
