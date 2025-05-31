// == 常量 ==
const colors = ['color-0', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7'];

// 游戏状态
let sequence = [];
let playerSequence = [];
let score = 0;
let acceptingInput = false;
let countdownTimer;
let countdownSeconds = 20;

let currentLanguage = 'en';
let currentDifficulty = 'easy';
let colorCount = 4;

// DOM
const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const buttonGrid = document.getElementById('button-grid');
const scoreValue = document.getElementById('score-value');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverDiv = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const leaderboardOl = document.getElementById('leaderboard');
const leaderboardTitle = document.getElementById('leaderboard-title');
const gameoverTitle = document.getElementById('gameover-title');
const languageSelect = document.getElementById('language-select');
const difficultySelect = document.getElementById('difficulty-select');
const langToggleBtn = document.getElementById('lang-toggle');
const themeToggleBtn = document.getElementById('theme-toggle');
const descEn = document.getElementById('desc-en');
const descZh = document.getElementById('desc-zh');
const gameTitle = document.getElementById('game-title');
const scoreLabel = document.getElementById('score-label');
const timerLabel = document.getElementById('timer-label');

// 音频上下文（全局仅创建一次）
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 初始化按钮
function createButtons() {
  buttonGrid.innerHTML = '';
  buttonGrid.className = 'button-grid ' + currentDifficulty;
  for (let i = 0; i < colorCount; i++) {
    const btn = document.createElement('button');
    btn.classList.add('btn-tile', colors[i]);
    btn.dataset.index = i;
    btn.addEventListener('click', () => {
      if (!acceptingInput) return;
      handlePlayerInput(i);
    });
    buttonGrid.appendChild(btn);
  }
}

// 按钮闪烁
function lightButton(index) {
  const btn = buttonGrid.querySelector(`button[data-index="${index}"]`);
  if (!btn) return;
  btn.classList.add('btn-lit');
  playSound(index);
  setTimeout(() => {
    btn.classList.remove('btn-lit');
  }, 600);
}

// 正常音效
function playSound(index) {
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(200 + index * 100, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
}

// 错误音效
function playErrorSound() {
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(110, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.4);
}

// 下一步
function nextSequenceStep() {
  const nextIndex = Math.floor(Math.random() * colorCount);
  sequence.push(nextIndex);
  score++;
  scoreValue.textContent = score;
  playSequence();
}

// 播放当前序列
async function playSequence() {
  acceptingInput = false;
  for (const index of sequence) {
    await new Promise(r => setTimeout(r, 400));
    lightButton(index);
    await new Promise(r => setTimeout(r, 700));
  }
  playerSequence = [];
  acceptingInput = true;
  resetCountdown();
}

// 处理点击
function handlePlayerInput(index) {
  if (!acceptingInput) return;
  lightButton(index);
  playerSequence.push(index);

  const currentStep = playerSequence.length - 1;
  if (playerSequence[currentStep] !== sequence[currentStep]) {
    playErrorSound();
    gameOver();
    return;
  }

  if (playerSequence.length === sequence.length) {
    acceptingInput = false;
    setTimeout(() => {
      nextSequenceStep();
    }, 800);
  }
}

// 游戏结束
function gameOver() {
  acceptingInput = false;
  clearInterval(countdownTimer);
  saveScore(score);
  finalScoreEl.textContent = score;
  updateLeaderboard(currentLanguage);
  showGameOver(true);
}

// 显示/隐藏游戏结束界面
function showGameOver(show) {
  gameOverDiv.style.display = show ? 'block' : 'none';
}

// 重启游戏
function restartGame() {
  score = 0;
  sequence = [];
  playerSequence = [];
  scoreValue.textContent = 0;
  gameOverDiv.style.display = 'none';
  countdownSeconds = 20;
  timerEl.textContent = countdownSeconds;
  nextSequenceStep();
  resetCountdown();
  acceptingInput = false;
}

// 倒计时
function resetCountdown() {
  clearInterval(countdownTimer);
  countdownSeconds = 20;
  timerEl.textContent = countdownSeconds;
  countdownTimer = setInterval(() => {
    countdownSeconds--;
    timerEl.textContent = countdownSeconds;
    if (countdownSeconds <= 0) {
      clearInterval(countdownTimer);
      gameOver();
    }
  }, 1000);
}

// 保存分数
function saveScore(newScore) {
  let leaderboard = JSON.parse(localStorage.getItem('simonLeaderboard')) || [];

  // ✅ 确保 newScore 是数字
  newScore = parseInt(newScore);

  // ✅ 过滤掉非数字或旧格式（如 "1. 1"）
  leaderboard = leaderboard
    .map(item => parseInt(item))       // 转换为数字
    .filter(n => !isNaN(n) && n >= 0); // 保留有效数字

  leaderboard.push(newScore);
  leaderboard.sort((a, b) => b - a);
  if (leaderboard.length > 10) {
    leaderboard = leaderboard.slice(0, 10);
  }
  localStorage.setItem('simonLeaderboard', JSON.stringify(leaderboard));
}


// 更新排行榜
function updateLeaderboard(lang = 'en') {
  const leaderboard = JSON.parse(localStorage.getItem('simonLeaderboard')) || [];
  leaderboardOl.innerHTML = '';

  if (leaderboard.length === 0) {
    const li = document.createElement('li');
    li.textContent = lang === 'zh' ? '暂无记录' : 'No records yet';
    leaderboardOl.appendChild(li);
    return;
  }

  leaderboard.forEach(score => {
    const li = document.createElement('li');
    li.textContent = `${score}`;  // ✅ 只显示得分，由 <ol> 自动编号
    leaderboardOl.appendChild(li);
  });

  leaderboardTitle.textContent = lang === 'zh' ? '排行榜' : 'Leaderboard';
}




// 切换语言
function setLanguage(lang) {
  currentLanguage = lang;
  if (lang === 'zh') {
    descEn.style.display = 'none';
    descZh.style.display = 'block';
    gameTitle.textContent = 'Simon 记忆游戏';
    startBtn.textContent = '开始';
    restartBtn.textContent = '重新开始';
    scoreLabel.textContent = '得分:';
    timerLabel.textContent = '时间:';
    gameoverTitle.textContent = '游戏结束！';
    langToggleBtn.textContent = '🌐 English';
    languageSelect.value = 'zh';
    difficultySelect.options[0].text = '简单 (4按钮)';
    difficultySelect.options[1].text = '中等 (6按钮)';
    difficultySelect.options[2].text = '困难 (8按钮)';
  } else {
    descEn.style.display = 'block';
    descZh.style.display = 'none';
    gameTitle.textContent = 'Simon Memory Game';
    startBtn.textContent = 'START';
    restartBtn.textContent = 'Restart';
    scoreLabel.textContent = 'Score:';
    timerLabel.textContent = 'Time:';
    gameoverTitle.textContent = 'Game Over!';
    langToggleBtn.textContent = '🌐 中文';
    languageSelect.value = 'en';
    difficultySelect.options[0].text = 'Easy (4 buttons)';
    difficultySelect.options[1].text = 'Medium (6 buttons)';
    difficultySelect.options[2].text = 'Hard (8 buttons)';
  }
  updateLeaderboard(lang);
}

// 难度切换
function setDifficulty(diff) {
  currentDifficulty = diff;
  switch(diff) {
    case 'easy': colorCount = 4; break;
    case 'medium': colorCount = 6; break;
    case 'hard': colorCount = 8; break;
    default: colorCount = 4;
  }
  createButtons();
}

// 切换主题
function toggleTheme() {
  document.body.classList.toggle('dark');
  themeToggleBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
}

// ========== 事件绑定 ==========
startBtn.addEventListener('click', () => {
  homeScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  restartGame();
});

restartBtn.addEventListener('click', () => restartGame());
languageSelect.addEventListener('change', (e) => setLanguage(e.target.value));
difficultySelect.addEventListener('change', (e) => setDifficulty(e.target.value));
langToggleBtn.addEventListener('click', () => setLanguage(currentLanguage === 'en' ? 'zh' : 'en'));
themeToggleBtn.addEventListener('click', toggleTheme);

// 初始设置
setLanguage('en');
setDifficulty('easy');
createButtons();
updateLeaderboard('en');
