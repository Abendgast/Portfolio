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
const timerValue = document.getElementById('timer-value');
const useTimerCheckbox = document.getElementById('use-timer');
const startStopTimerBtn = document.getElementById('start-stop-timer');
const nextQuestionBtn = document.getElementById('next-question');

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
    const answersContainer = document.getElementById('answers-container');

    if (availableQuestions.length === 0) {
        completeTest();
        return;
    }

    const currentQuestion = availableQuestions.pop();
    const isMethodToDefinition = Math.random() < 0.5;

    totalQuestions++;

    const correctAnswer = isMethodToDefinition
        ? currentQuestion.definition
        : currentQuestion.method;

    const options = generateUniqueOptions(currentQuestion, methods, isMethodToDefinition);

    document.getElementById('question-title').textContent = isMethodToDefinition
        ? `Метод: ${currentQuestion.method}`
        : `Опис: ${currentQuestion.definition}`;

    answersContainer.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(button, option === correctAnswer);
        answersContainer.appendChild(button);
    });

    if (useTimerCheckbox.checked && !timerRunning && blurApplied) {
        questionContainer.classList.add('blurred');
    } else {
        questionContainer.classList.remove('blurred');
    }
}

// Решта функцій залишаються незмінними як в оригінальному скрипті
function checkAnswer(button, isCorrect) {
    const buttons = document.querySelectorAll('#answers-container button');
    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        correctAnswers++;
        button.classList.add('correct');
    } else {
        button.classList.add('incorrect');
        const correctButton = Array.from(buttons).find(btn => btn.textContent === (document.getElementById('question-title').textContent.includes('Метод')
            ? methods.find(m => m.method === document.getElementById('question-title').textContent.replace('Метод: ', '')).definition
            : methods.find(m => m.definition === document.getElementById('question-title').textContent.replace('Опис: ', '')).method));
        correctButton.classList.add('correct');
    }
}

function completeTest(manualStop = false) {
    if (timerRunning) {
        stopTimer();
    }

    document.getElementById('test-area').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('total-questions').textContent = totalQuestions;

    if (timerUsed) {
        document.getElementById('test-time').style.display = 'block';
        document.getElementById('total-time').textContent = formatTime(elapsedTime);
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
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
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

// Події для кнопок
useTimerCheckbox.addEventListener('change', () => {
    const timer = document.getElementById('timer');
    if (useTimerCheckbox.checked) {
        timer.classList.remove('disabled');
        startStopTimerBtn.style.display = 'block';
        resetTimer();

        if (!blurApplied) {
            questionContainer.classList.add('blurred');
            blurApplied = true;
        }
    } else {
        timer.classList.add('disabled');
        startStopTimerBtn.style.display = 'none';
        stopTimer();

        questionContainer.classList.remove('blurred');
        blurApplied = false;
    }
});

startStopTimerBtn.addEventListener('click', () => {
    if (!timerRunning) {
        startTimer();
        startStopTimerBtn.textContent = 'Стоп';
        questionContainer.classList.remove('blurred');
    } else {
        stopTimer();
        startStopTimerBtn.textContent = 'Старт';
        completeTest(true);
    }
});

nextQuestionBtn.addEventListener('click', displayQuestion);

document.getElementById('restart-test').addEventListener('click', () => {
    availableQuestions = [...methods];
    correctAnswers = 0;
    totalQuestions = 0;
    blurApplied = false;
    resetTimer();

    document.getElementById('results').style.display = 'none';
    document.getElementById('test-time').style.display = 'none';
    document.getElementById('test-area').style.display = 'block';
    displayQuestion();
});

// Ініціалізація
async function initializeQuiz() {
    methods = await loadMethodsFromFile();
    if (methods.length === 0) {
        alert('Не вдалося завантажити методи. Перевірте modules.txt');
        return;
    }
    availableQuestions = [...methods];
    displayQuestion();
}

document.addEventListener('DOMContentLoaded', initializeQuiz);
