// Завантаження методів з файлу modules.txt
async function loadMethodsFromFile() {
    try {
        const response = await fetch('modules.txt');
        const fileContent = await response.text();
        const lines = fileContent.trim().split('\n');

        return lines.map(line => {
            const [method, definition] = line.split(':').map(s => s.trim());
            return { method, definition };
        }).filter(item => item.method && item.definition);
    } catch (error) {
        console.error('Помилка читання modules.txt:', error);
        return [];
    }
}

// Глобальні змінні
let methods = [];
let availableQuestions = [];
let correctAnswers = 0;
let totalQuestions = 0;
let blurApplied = false;

// Секундомір
let timerInterval;
let elapsedTime = 0;
let timerRunning = false;
let timerUsed = false;

// DOM елементи
const questionContainer = document.getElementById('question-container');
const answersContainer = document.getElementById('answers-container');
const questionTitle = document.getElementById('question-title');
const timerValue = document.getElementById('timer-value');
const useTimerCheckbox = document.getElementById('use-timer');
const startStopTimerBtn = document.getElementById('start-stop-timer');
const nextQuestionBtn = document.getElementById('next-question');
const resultsSection = document.getElementById('results');
const testAreaSection = document.getElementById('test-area');
const correctCountSpan = document.getElementById('correct-count');
const totalQuestionsSpan = document.getElementById('total-questions');
const totalTimeSpan = document.getElementById('total-time');
const testTimeSection = document.getElementById('test-time');
const restartTestBtn = document.getElementById('restart-test');

// Shuffle функція
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Генерація унікальних варіантів
function generateUniqueOptions(correctQuestion, allMethods, isMethodToDefinition) {
    const uniqueOptions = new Set([
        isMethodToDefinition ? correctQuestion.definition : correctQuestion.method
    ]);

    while (uniqueOptions.size < 4) {
        const randomMethod = allMethods[Math.floor(Math.random() * allMethods.length)];
        const option = isMethodToDefinition ? randomMethod.definition : randomMethod.method;
        uniqueOptions.add(option);
    }

    return shuffle(Array.from(uniqueOptions));
}

// Відображення питання
function displayQuestion() {
    if (availableQuestions.length === 0) {
        completeTest();
        return;
    }

    // Видаляємо випадковий метод зі списку доступних питань
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentQuestion = availableQuestions.splice(randomIndex, 1)[0];

    const isMethodToDefinition = Math.random() < 0.5;

    totalQuestions++;

    const correctAnswer = isMethodToDefinition
        ? currentQuestion.definition
        : currentQuestion.method;

    const options = generateUniqueOptions(currentQuestion, methods, isMethodToDefinition);

    questionTitle.textContent = isMethodToDefinition
        ? `Метод: ${currentQuestion.method}`
        : `Опис: ${currentQuestion.definition}`;

    answersContainer.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(button, option === correctAnswer);
        answersContainer.appendChild(button);
    });

    // Логіка розмиття питання при активованому таймері
    if (useTimerCheckbox.checked && !timerRunning && blurApplied) {
        questionContainer.classList.add('blurred');
    } else {
        questionContainer.classList.remove('blurred');
    }
}

// Перевірка відповіді
function checkAnswer(button, isCorrect) {
    const buttons = document.querySelectorAll('#answers-container button');
    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        correctAnswers++;
        button.classList.add('correct');
    } else {
        button.classList.add('incorrect');
        const correctButton = Array.from(buttons).find(btn => btn.textContent === (
            questionTitle.textContent.includes('Метод')
                ? methods.find(m => m.method === questionTitle.textContent.replace('Метод: ', '')).definition
                : methods.find(m => m.definition === questionTitle.textContent.replace('Опис: ', '')).method
        ));
        correctButton.classList.add('correct');
    }
}

// Завершення тесту
function completeTest() {
    if (timerRunning) {
        stopTimer();
    }

    testAreaSection.style.display = 'none';
    resultsSection.style.display = 'block';
    correctCountSpan.textContent = correctAnswers;
    totalQuestionsSpan.textContent = totalQuestions;

    if (timerUsed) {
        testTimeSection.style.display = 'block';
        totalTimeSpan.textContent = formatTime(elapsedTime);
    }

    if (useTimerCheckbox.checked) {
        useTimerCheckbox.checked = false;
        document.getElementById('timer').classList.add('disabled');
        startStopTimerBtn.style.display = 'none';
    }
}

// Функції секундоміра
function startTimer() {
    if (timerRunning) return;
    timerUsed = true;
    timerRunning = true;
    const startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        timerValue.textContent = formatTime(elapsedTime);
    }, 10);
    startStopTimerBtn.textContent = 'Стоп';
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    startStopTimerBtn.textContent = 'Продовжити';
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    timerUsed = false;
    timerValue.textContent = '00:00:000';
    startStopTimerBtn.textContent = 'Старт';
}

function formatTime(ms) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${millis.toString().padStart(3, '0')}`;
}

// Скидання тесту
function restartTest() {
    // Скидаємо всі глобальні змінні
    methods = [];
    availableQuestions = [];
    correctAnswers = 0;
    totalQuestions = 0;
    blurApplied = false;

    // Скидаємо таймер
    resetTimer();

    // Повертаємо інтерфейс до початкового стану
    resultsSection.style.display = 'none';
    testAreaSection.style.display = 'block';

    // Ініціалізуємо тест знову
    initializeQuiz();
}

// Додаємо обробники подій
document.addEventListener('DOMContentLoaded', () => {
    // Ініціалізація квізу
    initializeQuiz();

    // Обробник для кнопки "Наступне питання"
    nextQuestionBtn.addEventListener('click', () => {
        const buttons = document.querySelectorAll('#answers-container button');
        buttons.forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
            btn.disabled = false;
        });
        displayQuestion();
    });

    // Обробник для прапорця використання секундоміра
    useTimerCheckbox.addEventListener('change', () => {
        const timerDisplay = document.getElementById('timer');
        startStopTimerBtn.style.display = useTimerCheckbox.checked ? 'block' : 'none';

        if (useTimerCheckbox.checked) {
            timerDisplay.classList.remove('disabled');
            resetTimer();
        } else {
            timerDisplay.classList.add('disabled');
            stopTimer();
        }
    });

    // Обробник для кнопки старту/зупинки таймера
    startStopTimerBtn.addEventListener('click', () => {
        if (timerRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    // Обробник для перезапуску тесту
    restartTestBtn.addEventListener('click', restartTest);
});

// Ініціалізація квізу
async function initializeQuiz() {
    methods = await loadMethodsFromFile();
    if (methods.length === 0) {
        alert('Не вдалося завантажити методи. Перевірте modules.txt');
        return;
    }
    availableQuestions = [...methods];
    displayQuestion();
}
