import { quizData } from './quiz-data.js';

let currentQuestions = []; // 存放本次抽出的 5 題
let userScore = 0;        // 累計代幣

// 1. 初始化遊戲：隨機抽出 5 題
function initGame() {
    // 洗牌原始題庫並取前 5 題
    const shuffledPool = [...quizData].sort(() => 0.5 - Math.random());
    currentQuestions = shuffledPool.slice(0, 5);
    
    // 針對每一題，再打亂其選項順序
    currentQuestions.forEach(q => {
        q.options.sort(() => 0.5 - Math.random());
    });

    console.log("今日考題已就緒:", currentQuestions);
}

// 2. 判定答案 (支援複選)
// selectedIndices: 玩家選取的選項索引陣列，例如 [0, 2]
function checkAnswer(questionIndex, selectedIndices) {
    const question = currentQuestions[questionIndex];
    const correctIndices = question.options
        .map((opt, idx) => opt.isCorrect ? idx : null)
        .filter(idx => idx !== null);

    // 比對兩個陣列是否完全相同
    const isCorrect = JSON.stringify(selectedIndices.sort()) === JSON.stringify(correctIndices.sort());

    if (isCorrect) {
        userScore += question.reward;
        return { success: true, reward: question.reward };
    }
    return { success: false, reward: 0 };
}

initGame();
