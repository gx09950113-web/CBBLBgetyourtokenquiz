import { quizData } from './quiz-data.js';

// --- 配置與變數 ---
const MAX_CHANCES = 3; 
let currentSessionQuestions = []; 
let currentQuestionIndex = 0; 
let sessionTokens = 0; 

// --- DOM 元素 ---
const startScreen = document.getElementById('start-screen');
const quizCard = document.getElementById('quiz-card');
const resultOverlay = document.getElementById('result-overlay');
const startGameBtn = document.getElementById('start-game-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const chanceEl = document.getElementById('chance');
const tokensEl = document.getElementById('tokens');
const questionNumEl = document.getElementById('question-number');
const rewardTagEl = document.getElementById('reward-tag');
const resultMsg = document.getElementById('result-msg');

// --- 狀態管理 ---
function getPlayerStatus() {
    const today = new Date().toLocaleDateString(); 
    let status = JSON.parse(localStorage.getItem('quiz_player_status'));

    // 【核心修改點】如果不存在紀錄，或是日期與今天不同，則重置所有數據
    if (!status || status.lastDate !== today) {
        status = { 
            lastDate: today, 
            chancesUsed: 0, 
            totalTokens: 0 // 這裡改為 0，確保代幣每天重置
        };
        saveStatus(status);
    }
    return status;
}

function saveStatus(status) {
    localStorage.setItem('quiz_player_status', JSON.stringify(status));
}

function updateUI() {
    const status = getPlayerStatus();
    chanceEl.innerText = MAX_CHANCES - status.chancesUsed;
    tokensEl.innerText = status.totalTokens;
}

// --- 遊戲切換邏輯 ---
function showElement(el) {
    [startScreen, quizCard, resultOverlay].forEach(item => item.classList.add('hidden'));
    el.classList.remove('hidden');
}

startGameBtn.onclick = () => {
    const status = getPlayerStatus();
    if (status.chancesUsed >= MAX_CHANCES) {
        alert("今日次數已用盡！請明天再來。");
        return;
    }
    startNewSession();
};

function startNewSession() {
    currentSessionQuestions = [...quizData].sort(() => 0.5 - Math.random()).slice(0, 5);
    currentQuestionIndex = 0;
    sessionTokens = 0;
    showElement(quizCard);
    showQuestion();
}

function showQuestion() {
    const q = currentSessionQuestions[currentQuestionIndex];
    questionNumEl.innerText = `第 ${currentQuestionIndex + 1} / 5 題`;
    rewardTagEl.innerText = `代幣獎勵: ${q.reward}`;
    questionText.innerText = q.question;
    
    const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
    optionsContainer.innerHTML = "";
    
    shuffledOptions.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerText = opt.text;
        div.onclick = () => div.classList.toggle('selected');
        div.dataset.correct = opt.isCorrect;
        optionsContainer.appendChild(div);
    });
}

submitBtn.onclick = () => {
    const selected = document.querySelectorAll('.option-item.selected');
    if (selected.length === 0) return alert("請選取答案！");

    let isCorrect = true;
    document.querySelectorAll('.option-item').forEach(opt => {
        // 判定邏輯：正確選項必須被選中，錯誤選項必須不被選中
        if ((opt.dataset.correct === "true") !== opt.classList.contains('selected')) isCorrect = false;
    });

    if (isCorrect) {
        const reward = currentSessionQuestions[currentQuestionIndex].reward;
        sessionTokens += reward;
        alert(`正確！獲得 ${reward} 代幣`);
    } else {
        alert("回答錯誤！");
    }

    if (currentQuestionIndex < 4) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        finishGame();
    }
};

function finishGame() {
    const status = getPlayerStatus();
    status.chancesUsed++;
    status.totalTokens += sessionTokens;
    saveStatus(status);
    updateUI();
    
    resultMsg.innerText = `本次獲得：${sessionTokens} 代幣`;
    showElement(resultOverlay);
}

restartBtn.onclick = () => {
    updateUI();
    showElement(startScreen);
};

// 初始化
updateUI();
