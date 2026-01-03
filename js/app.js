// ================= SELECTORS =================
const moodBar = document.querySelector(".mood");
const energyBar = document.querySelector(".energy");
const stressBar = document.querySelector(".stress");
const productivityBar = document.querySelector(".productivity");

const moodLabel = document.querySelector(".moodLabel");
const energyLabel = document.querySelector(".energyLabel");
const stressLabel = document.querySelector(".stressLabel");
const productivityLabel = document.querySelector(".productivityLabel");

const showTime = document.querySelector(".timer");
const coffeeBtn = document.querySelector(".coffee");
const breakBtn = document.querySelector(".break");
const distractBtn = document.querySelector(".distraction");
const endDayBtn = document.querySelector(".end-day");
const finalScore = document.querySelector(".score");

const startBtn = document.getElementById("startGame");
const pauseBtn = document.getElementById("pauseGame");
const resumeBtn = document.getElementById("resumeGame");
const restartBtn = document.getElementById("restartGame");
const officeApp = document.querySelector(".office-app");

// ================= GAME STATE =================
let state = {
  time: 10 * 60, // 10:00 AM
  mood: 80,
  energy: 80,
  stress: 20,
  productivity: 70,
  score: 0,
  isDistracted: false,
  eventCooldown: false,
  dayOver: false,
  distractionCount: 0
};

// Track coffee/break usage sequentially
let coffeeUsed = 0;
let breakUsed = 0;
let gameInterval; // store interval
let isPaused = false;

// ================= BUTTON TEXT =================
const COFFEE_LIMIT = 3;
const BREAK_LIMIT = 2;

function updateButtonText() {
  coffeeBtn.textContent = `☕ Coffee (${coffeeUsed} / ${COFFEE_LIMIT})`;
  breakBtn.textContent = `🧘 Break (${breakUsed} / ${BREAK_LIMIT})`;
}

// ================= EVENTS =================
const events = [
  {
    text: "😈 Boss suddenly asks for update! (Stress +10 | Productivity -5)",
    effect: () => {
      state.stress = clamp(state.stress + 10);
      state.productivity = clamp(state.productivity - 5);
    }
  },
  {
    text: "☕ Free office coffee! (Energy +10 | Stress -5)",
    effect: () => {
      state.energy = clamp(state.energy + 10);
      state.stress = clamp(state.stress - 5);
    }
  },
  {
    text: "🧑‍💻 Team meeting wasted time (Productivity -10)",
    effect: () => {
      state.productivity = clamp(state.productivity - 10);
    }
  },
  {
    text: "🎉 Client appreciated your work! (Energy +10 | Stress -10)",
    effect: () => {
      state.energy = clamp(state.energy + 10);
      state.stress = clamp(state.stress - 10);
    }
  },
  {
    text: "🍩 Someone brought snacks to office (Energy +8 | Stress -5)",
    effect: () => {
      state.energy = clamp(state.energy + 8);
      state.stress = clamp(state.stress - 5);
    }
  },
  {
    text: "🎧 Music time – working smoothly (Productivity +10 | Energy +5)",
    effect: () => {
      state.productivity = clamp(state.productivity + 10);
      state.energy = clamp(state.energy + 5);
    }
  }
];

// ================= GAME LOGIC =================
function gameLoop() {
  if (isPaused || state.dayOver) return;

  state.time++;

  state.productivity = clamp(state.productivity - 0.15);

  if (state.isDistracted) state.productivity = clamp(state.productivity - 0.2);

  if (state.mood < 10) state.productivity = clamp(state.productivity - 0.5);

  state.stress = clamp(state.stress + 0.3);
  state.energy = clamp(state.energy - 0.3);

  if (!state.eventCooldown && Math.random() < 0.05) {
    triggerEvent();
    state.eventCooldown = true;
    setTimeout(() => (state.eventCooldown = false), 5000);
  }

  moodCalculator();
  updateScore();
  renderUi();
  checkShiftEnd();
  checkCriticalConditions();
}

function startGame() {
  officeApp.classList.add("started"); 
  updateButtonText();
  gameInterval = setInterval(gameLoop, 100);
  startBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
}

function pauseGame() {
  isPaused = true;
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "inline-block";
}

function resumeGame() {
  isPaused = false;
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
}

// ================= MOOD =================
function moodCalculator() {
  const energyFactor = state.energy / 100;
  const stressFactor = 1 - state.stress / 100;
  let mood = (energyFactor * 0.3 + stressFactor * 0.6) * 100;
  if (state.energy < 20 && state.stress > 80) {
    const energyPenalty = state.energy / 20;
    const stressPenalty = (100 - state.stress) / 20;
    mood *= Math.min(energyPenalty, stressPenalty);
  }
  state.mood = clamp(Math.round(mood));
}

// ================= UI =================
function renderUi() {
  moodBar.style.width = state.mood + "%";
  energyBar.style.width = state.energy + "%";
  stressBar.style.width = state.stress + "%";
  productivityBar.style.width = state.productivity + "%";

  moodLabel.textContent = `Mood ${Math.floor(state.mood)}`;
  energyLabel.textContent = `Energy ${Math.floor(state.energy)}`;
  stressLabel.textContent = `Stress ${Math.floor(state.stress)}`;
  productivityLabel.textContent = `Productivity ${Math.floor(state.productivity)}`;

  finalScore.textContent = `Performance Score: ${state.score}`;
  showTime.textContent = `⏰ ${formatTime(state.time)}`;
}

// ================= TIME =================
function formatTime(time) {
  let hours = Math.floor(time / 60) % 12 || 12;
  const minutes = time % 60;
  return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}${time<720?"am":"pm"}`;
}

// ================= BUTTONS =================
coffeeBtn.addEventListener("click", () => {
  if (coffeeUsed >= COFFEE_LIMIT) return;
  coffeeUsed++;
  state.energy = clamp(state.energy + 20);
  state.productivity = clamp(state.productivity + 10);
  state.stress = clamp(state.stress - 10);
  if (coffeeUsed === COFFEE_LIMIT) coffeeBtn.disabled = true;
  updateButtonText();
});

breakBtn.addEventListener("click", () => {
  if (breakUsed >= BREAK_LIMIT) return;
  breakUsed++;
  state.energy = clamp(state.energy + 10);
  state.productivity = clamp(state.productivity + 10);
  state.stress = clamp(state.stress - 20);
  if (breakUsed === BREAK_LIMIT) breakBtn.disabled = true;
  updateButtonText();
});

distractBtn.addEventListener("click", () => {
  state.distractionCount++;
  state.productivity = clamp(state.productivity - 5);
  state.stress = clamp(state.stress - 5);
  state.isDistracted = true;
  setTimeout(() => state.isDistracted = false, 5000);
  if (state.distractionCount > 2) endGame("📱 Fired! Overuse of mobile phone during office hours!");
});

endDayBtn.addEventListener("click", endShiftEarly);

// Start / Pause / Resume
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);

// Restart Button
restartBtn.addEventListener("click", () => {
  clearInterval(gameInterval);
  state = {
    time: 10*60, mood: 80, energy: 80, stress: 20, productivity: 70,
    score: 0, isDistracted: false, eventCooldown: false, dayOver: false,
    distractionCount: 0
  };
  coffeeUsed = 0;
  breakUsed = 0;
  coffeeBtn.disabled = false;
  breakBtn.disabled = false;
  distractBtn.disabled = false;
  endDayBtn.disabled = false;
  updateButtonText();
  renderUi();
  officeApp.style.display = "block";
  restartBtn.style.display = "none";
  startBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
    officeApp.classList.remove("started"); 
  document.querySelectorAll(".popup").forEach(p => p.remove());
});

// ================= EVENTS =================
function triggerEvent() {
  const event = events[Math.floor(Math.random() * events.length)];
  const text = document.querySelector(".event-log p");
  event.effect();
  moodCalculator();
  renderUi();
  text.textContent = event.text;
  text.style.opacity = 1;
  setTimeout(() => {
    text.style.opacity = 0;
    text.textContent = "";
  }, 5000);
}

// ================= SHIFT END =================
function checkShiftEnd() {
  if (state.time >= 19*60 && !state.dayOver) endShift();
}

function endShift() {
  state.dayOver = true;
  clearInterval(gameInterval);
  disableButtons();
  showPopup(`🏁 Shift Over!\n⭐ Final Score: ${state.score}`);
  restartBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
   officeApp.classList.remove("started");
}

function endShiftEarly() {
  if (state.dayOver) return;
  state.dayOver = true;
  clearInterval(gameInterval);
  disableButtons();
  showPopup(`⏰ You are early out!\n🏃 Half Day Applied\n⭐ Final Score: ${Math.floor(state.score/2)}`);
  restartBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  officeApp.classList.remove("started");
}

// ================= GAME OVER =================
function checkCriticalConditions() {
  if (state.dayOver) return;
  if (state.productivity <= 0) endGame("💀 Fired! Productivity hit 0");
  else if (state.stress >= 95) endGame("🏥 Hospitalized! Stress too high");
  else if (state.energy <= 5) endGame("😴 Collapsed from exhaustion");
  else if (state.mood <= 5) endGame("😢 Quit due to depression");
}

function endGame(message) {
  if (state.dayOver) return;
  state.dayOver = true;
  clearInterval(gameInterval);
  disableButtons();
  showPopup(message);
  restartBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
}

function disableButtons() {
  coffeeBtn.disabled = true;
  breakBtn.disabled = true;
  distractBtn.disabled = true;
  endDayBtn.disabled = true;
}

// ================= SCORE =================
function updateScore() {
  if (state.dayOver) return;
  let gain = state.productivity*0.05 + state.mood*0.03;
  if (state.stress<40) gain += 2;
  if (state.energy<20) gain *= 0.5;
  state.score += Math.max(0, Math.round(gain));
}

// ================= UTILS =================
function clamp(value, min=0, max=100) {
  return Math.max(min, Math.min(max, value));
}

function showPopup(message) {
  // Remove existing popups
  document.querySelectorAll(".popup").forEach(p => p.remove());

  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <p>${message}</p>
    <button id="popupRestart">Restart</button>
  `;

  document.body.appendChild(popup);

  // Add restart functionality to this popup button
  document.getElementById("popupRestart").addEventListener("click", () => {
    restartGame();
    officeApp.classList.remove("started");
    popup.remove(); // remove the popup after restarting
  });
}

// Restart function used by popup
function restartGame() {
  clearInterval(gameInterval);

  state = {
    time: 10*60, 
    mood: 80, 
    energy: 80, 
    stress: 20, 
    productivity: 70,
    score: 0, 
    isDistracted: false, 
    eventCooldown: false, 
    dayOver: false,
    distractionCount: 0
  };

  coffeeUsed = 0;
  breakUsed = 0;

  coffeeBtn.disabled = false;
  breakBtn.disabled = false;
  distractBtn.disabled = false;
  endDayBtn.disabled = false;

  updateButtonText();
  renderUi();

  startBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";

  officeApp.style.display = "block";
}

