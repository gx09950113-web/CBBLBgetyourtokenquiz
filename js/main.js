import { quizData } from './quiz-data.js';

// --- 配置與變數 ---
const MAX_CHANCES = 3; // 每日遊玩次數上限
let currentSessionQuestions = []; // 本次遊戲抽出的 5 題
let currentQuestionIndex = 0; // 當前題號
let sessionTokens = 0; // 本次遊戲獲得的代幣

// --- DOM 元素 ---
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const chanceEl = document.getElementById('chance');
const tokensEl = document.getElementById('tokens');
const questionNumEl = document.getElementById('question-number');
const rewardTagEl = document.getElementById('reward-tag');

// --- 1. 玩家狀態管理 (localStorage) ---
function getPlayerStatus() {
    const today = new Date().toLocaleDateString(); 
    let status = JSON.parse(localStorage.getItem('quiz_player_status'));

    // 若為新玩家或新的一天，重置次數
    if (!status || status.lastDate !== today) {
        status = {
            lastDate: today,
            chancesUsed: 0,
            totalTokens: status ? status.totalTokens : 0
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

// --- 2. 遊戲核心邏輯 ---
function initGame() {
    const status = getPlayerStatus();
    updateUI();

    if (status.chancesUsed >= MAX_CHANCES) {
        questionText.innerText = "今日遊玩次數已用盡，請明天再來！";
        optionsContainer.innerHTML = "";
        submitBtn.style.display = "none";
        return;
    }

    // 從題庫隨機抽出 5 題
    currentSessionQuestions = [...quizData]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
    
    currentQuestionIndex = 0;
    sessionTokens = 0;
    showQuestion();
}

function showQuestion() {
    const q = currentSessionQuestions[currentQuestionIndex];
    
    // 更新 UI 文字
    questionNumEl.innerText = `第 ${currentQuestionIndex + 1} / 5 題`;
    rewardTagEl.innerText = `代幣獎勵: ${q.reward}`;
    questionText.innerText = q.question;
    
    // 選項隨機打亂並渲染
    const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
    optionsContainer.innerHTML = "";
    
    shuffledOptions.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerText = opt.text;
        // 點擊切換選取狀態 (支援複選)
        div.onclick = () => div.classList.toggle('selected');
        div.dataset.correct = opt.isCorrect;
        optionsContainer.appendChild(div);
    });
}

// --- 3. 判定邏輯 ---
submitBtn.onclick = () => {
    const selectedOptions = document.querySelectorAll('.option-item.selected');
    const allOptions = document.querySelectorAll('.option-item');
    
    if (selectedOptions.length === 0) {
        alert("請至少選擇一個答案！");
        return;
    }

    // 檢查判定：是否「所有選中的都是正確的」且「所有正確的都被選中」
    let isCorrect = true;
    allOptions.forEach(opt => {
        const shouldBeSelected = opt.dataset.correct === "true";
        const isActuallySelected = opt.classList.contains('selected');
        if (shouldBeSelected !== isActuallySelected) {
            isCorrect = false;
        }
    });

    if (isCorrect) {
        const reward = currentSessionQuestions[currentQuestionIndex].reward;
        sessionTokens += reward; // 累加代幣權重
        alert(`正確！獲得 ${reward} 個代幣`);
    } else {
        alert("答案錯誤，再接再厲！");
    }

    // 進入下一題或結算
    if (currentQuestionIndex < 4) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        finishGame();
    }
};

function finishGame() {
    const status = getPlayerStatus();
    status.chancesUsed++; // 增加使用次數
    status.totalTokens += sessionTokens;
    saveStatus(status);
    
    alert(`修煉結束！本次總共獲得 ${sessionTokens} 個代幣。`);
    initGame(); // 重新整理狀態
}

// 啟動遊戲
initGame();
