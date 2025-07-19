// LSAT Solo Leveling XP System & Dashboard

// Elements
const usernameEl = document.getElementById('username');
const xpEl = document.getElementById('xp');
const xpNeededEl = document.getElementById('xp-needed');
const levelEl = document.getElementById('level');
const progressBar = document.getElementById('progress-bar');
const alertEl = document.getElementById('alert');

const testDateInput = document.getElementById('test-date');
const testScoreInput = document.getElementById('test-score');
const addTestBtn = document.getElementById('add-test');

const drillDateInput = document.getElementById('drill-date');
const drillHoursInput = document.getElementById('drill-hours');
const addDrillBtn = document.getElementById('add-drill');

const sectionDateInput = document.getElementById('section-date');
const sectionRightInput = document.getElementById('section-right');
const sectionWrongInput = document.getElementById('section-wrong');
const addSectionBtn = document.getElementById('add-section');

const recordsList = document.getElementById('records-list');

const levelupAnimation = document.getElementById('levelup-animation');
const levelupNumber = document.getElementById('levelup-number');

const THEMES = [1,5,10,20,40,60,80,100];

// Initial state or load from localStorage
let state = {
  username: 'User',
  xp: 0,
  level: 0,
  records: [],
  lastStudyDate: null,
  themeLevel: 0,
};

// Utility: save/load state
function saveState() {
  localStorage.setItem('lsatSoloState', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('lsatSoloState');
  if(saved) {
    state = JSON.parse(saved);
  }
}
loadState();

// Set username from localStorage or prompt once
if(state.username === 'User') {
  const name = prompt('Enter your name for LSAT Solo Leveling:')?.trim();
  if(name) {
    state.username = name;
    saveState();
  }
}
usernameEl.textContent = state.username;

// Calculate XP needed for next level (linear growth)
function xpForNextLevel(level) {
  return 100 + (level) * 50;
}

// Check inactivity and deduct XP if missed day(s)
function checkInactivity() {
  if(!state.lastStudyDate) return;
  const lastDate = new Date(state.lastStudyDate);
  const now = new Date();
  // Difference in full days
  const diffDays = Math.floor((now - lastDate) / (1000*60*60*24));
  if(diffDays >= 1) {
    // Deduct 10 XP per missed day
    const deduction = 10 * diffDays;
    if(state.xp > 0) {
      state.xp = Math.max(0, state.xp - deduction);
      showAlert(`You missed ${diffDays} day(s). -${deduction} XP deducted.`);
      saveState();
    }
  }
}

// Update XP display and progress bar
function updateXPDisplay() {
  const needed = xpForNextLevel(state.level);
  xpNeededEl.textContent = needed;
  xpEl.textContent = state.xp;

  let progressPercent = (state.xp / needed) * 100;
  if(progressPercent > 100) progressPercent = 100;
  progressBar.style.width = progressPercent + '%';

  levelEl.textContent = state.level;
}

// Show alert message
let alertTimeout;
function showAlert(msg) {
  alertEl.textContent = msg;
  alertEl.classList.remove('hidden');
  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    alertEl.classList.add('hidden');
  }, 5000);
}

// Add XP and handle level up
function addXP(amount) {
  state.xp += amount;
  checkLevelUp();
  saveState();
  updateXPDisplay();
}

function checkLevelUp() {
  let needed = xpForNextLevel(state.level);
  while(state.xp >= needed && state.level < 100) {
    state.xp -= needed;
    state.level++;
    needed = xpForNextLevel(state.level);
    triggerLevelUp(state.level);
  }
}

// Animate and theme switch on level up
function triggerLevelUp(newLevel) {
  // Show animation
  levelupNumber.textContent = newLevel;
  levelupAnimation.classList.remove('hidden');
  setTimeout(() => {
    levelupAnimation.classList.add('hidden');
  }, 4000);

  // Change theme if level milestone hit
  if(THEMES.includes(newLevel)) {
    state.themeLevel = newLevel;
    applyTheme(newLevel);
  }
  saveState();
}

// Apply theme by adding class to body
function applyTheme(level) {
  document.body.className = ''; // reset all theme classes
  const themeClass = 'theme-' + level;
  document.body.classList.add(themeClass);
}

// Initialize theme on page load
if(state.themeLevel && THEMES.includes(state.themeLevel)) {
  applyTheme(state.themeLevel);
} else {
  applyTheme(0); // default
}

// Render records
function renderRecords() {
  recordsList.innerHTML = '';
  if(state.records.length === 0) {
    recordsList.textContent = 'No records yet.';
    return;
  }
  state.records.forEach((rec, i) => {
    const div = document.createElement('div');
    div.className = 'record-item';
    div.textContent = `[${rec.type.toUpperCase()}] Date: ${rec.date} | Details: ${rec.details} | XP Earned: ${rec.xp}`;
    recordsList.appendChild(div);
  });
}

// Add record helper
function addRecord(type, date, details, xp) {
  state.records.unshift({ type, date, details, xp });
  saveState();
  renderRecords();
}

// Update last study date
function updateLastStudyDate(dateStr) {
  const oldDate = state.lastStudyDate ? new Date(state.lastStudyDate) : null;
  const newDate = new Date(dateStr);
  if(!oldDate || newDate > oldDate) {
    state.lastStudyDate = dateStr;
    saveState();
  }
}

// Event listeners for logging

addTestBtn.addEventListener('click', () => {
  const date = testDateInput.value;
  const score = parseInt(testScoreInput.value);
  if(!date || !score || score < 120 || score > 180) {
    showAlert('Please enter a valid date and LSAT score (120-180).');
    return;
  }

  // XP: 3 for score >165, 5 for >170
  let xpEarned = 0;
  if(score > 170) xpEarned = 5;
  else if(score > 165) xpEarned = 3;

  if(xpEarned === 0) {
    showAlert('Score too low for XP. No XP awarded.');
    return;
  }

  addXP(xpEarned);
  addRecord('test', date, `Score: ${score}`, xpEarned);
  updateLastStudyDate(date);

  // Clear inputs
  testDateInput.value = '';
  testScoreInput.value = '';
});

addDrillBtn.addEventListener('click', () => {
  const date = drillDateInput.value;
  const hours = parseFloat(drillHoursInput.value);
  if(!date || isNaN(hours) || hours <= 0) {
    showAlert('Please enter a valid date and hours.');
    return;
  }

  // XP: 5 XP per hour drilling
  const xpEarned = 5 * hours;

  addXP(xpEarned);
  addRecord('drill', date, `Hours: ${hours}`, xpEarned);
  updateLastStudyDate(date);

  drillDateInput.value = '';
  drillHoursInput.value = '';
});

addSectionBtn.addEventListener('click', () => {
  const date = sectionDateInput.value;
  const right = parseInt(sectionRightInput.value);
  const wrong = parseInt(sectionWrongInput.value);
  if(!date || isNaN(right) || isNaN(wrong) || right < 0 || wrong < 0) {
    showAlert('Please enter a valid date and number of questions.');
    return;
  }

  // XP: 5 XP per practice section logged
  const xpEarned = 5;

  addXP(xpEarned);
  addRecord('section', date, `Right: ${right}, Wrong: ${wrong}`, xpEarned);
  updateLastStudyDate(date);

  sectionDateInput.value = '';
  sectionRightInput.value = '';
  sectionWrongInput.value = '';
});

// Check inactivity on load
checkInactivity();

// Initial render
updateXPDisplay();
renderRecords();
