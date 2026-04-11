import { quizData } from './quiz-data.js';

let currentQuestions = [];
let currentQuestionIndex = 0;
let sessionTokens = 0; // 本次遊玩獲得的代幣

const questionEl = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const chanceEl = document.getElementById('chance');
const tokensEl = document.getElementById('tokens');

function initGame() {
    const status = getPlayerStatus();
    updateUI();

    if (!canPlay()) {
        questionEl.innerText = "今日遊玩次數已用盡，明天再來吧！";
        optionsContainer.innerHTML = "";
        submitBtn.style.display = "none";
        return;
    }

    // 隨機抽 5 題
    const shuffledPool = [...quizData].sort(() => 0.5 - Math.random());
    currentQuestions = shuffledPool.slice(0, 5);
    
    // 進入第一題
    currentQuestionIndex = 0;
    sessionTokens = 0;
    showQuestion();
}

function showQuestion() {
    const q = currentQuestions[currentQuestionIndex];
    questionEl.innerText = `第 ${currentQuestionIndex + 1} 題：${q.question}`;
    
    // 打亂選項順序並渲染
    const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
    optionsContainer.innerHTML = "";
    
    shuffledOptions.forEach((opt, index) => {
        const btn = document.createElement('div');
        btn.className = 'option-item';
        btn.innerText = opt.text;
        btn.onclick = () => btn.classList.toggle('selected'); // 支援複選
        btn.dataset.isCorrect = opt.isCorrect;
        optionsContainer.appendChild(btn);
    });
}

submitBtn.onclick = () => {
    // 檢查答案邏輯... (略過，判斷正確後累加 sessionTokens)
    
    if (currentQuestionIndex < 4) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        // 五題結束
        finishSession();
    }
};

function finishSession() {
    consumeChance(); // 玩完這局，消耗一次機會
    const status = getPlayerStatus();
    status.totalTokens += sessionTokens;
    saveStatus(status);
    
    alert(`遊戲結束！本次獲得 ${sessionTokens} 個代幣。`);
    initGame();
}

function updateUI() {
    const status = getPlayerStatus();
    chanceEl.innerText = MAX_CHANCES - status.chancesUsed;
    tokensEl.innerText = status.totalTokens;
}

initGame();
