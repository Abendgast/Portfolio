const methods = [
    { method: 'string.to_uppercase()', definition: 'Перетворює всі символи рядка на великі літери.' },
    { method: 'vector.len()', definition: 'Повертає кількість елементів у векторі.' },
    { method: 'vector.push()', definition: 'Додає елемент у вектор.' },
    { method: 'vector.pop()', definition: 'Видаляє останній елемент з вектора і повертає його (як Option).' },
    { method: 'option.unwrap()', definition: 'Повертає значення, якщо це Some, і викликає panic, якщо це None.' },
    { method: 'result.unwrap()', definition: 'Повертає успішне значення або панікує у випадку помилки.' },
    { method: 'string.len()', definition: 'Повертає довжину рядка в байтах.' },
    { method: 'string.push()', definition: 'Додає символ у кінець рядка.' },
    { method: 'vector.is_empty()', definition: 'Перевіряє, чи є вектор порожнім.' },
    { method: 'option.is_some()', definition: 'Перевіряє, чи є значення Some.' },
];

let availableQuestions = [...methods];
let correctAnswers = 0;
let totalQuestions = 0;
let blurApplied = false;

// Секундомір
let timerInterval;
let elapsedTime = 0;
let timerRunning = false;
let timerUsed = false;

const questionContainer = document.getElementById('question-container');
const timerValue = document.getElementById('timer-value');
const useTimerCheckbox = document.getElementById('use-timer');
const startStopTimerBtn = document.getElementById('start-stop-timer');
const nextQuestionBtn = document.getElementById('next-question');

// Увімкнення та вимкнення секундоміра
useTimerCheckbox.addEventListener('change', () => {
    const timer = document.getElementById('timer');
    if (useTimerCheckbox.checked) {
        timer.classList.remove('disabled');
        startStopTimerBtn.style.display = 'block';
        resetTimer();

        // Застосовуємо блюр лише один раз за весь тест
        if (!blurApplied) {
            questionContainer.classList.add('blurred');
            blurApplied = true;
        }
    } else {
        timer.classList.add('disabled');
        startStopTimerBtn.style.display = 'none';
        stopTimer();

        // Прибираємо блюр, якщо секундомір деактивовано
        questionContainer.classList.remove('blurred');
        blurApplied = false;
    }
});

startStopTimerBtn.addEventListener('click', () => {
    if (!timerRunning) {
        startTimer();
        startStopTimerBtn.textContent = 'Стоп';

        // Прибираємо блюр при старті секундоміра
        questionContainer.classList.remove('blurred');
    } else {
        stopTimer();
        startStopTimerBtn.textContent = 'Старт';
        completeTest(true);
    }
});

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

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

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

    const options = shuffle(
        isMethodToDefinition
            ? [currentQuestion.definition, ...methods.map(m => m.definition).filter(d => d !== currentQuestion.definition).slice(0, 3)]
            : [currentQuestion.method, ...methods.map(m => m.method).filter(m => m !== currentQuestion.method).slice(0, 3)]
    );

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

    // Застосовуємо блюр, якщо секундомір увімкнено
    if (useTimerCheckbox.checked && !timerRunning && blurApplied) {
        questionContainer.classList.add('blurred');
    } else {
        questionContainer.classList.remove('blurred');
    }
}

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

displayQuestion();