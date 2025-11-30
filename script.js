const courseButtons = [...document.querySelectorAll('.select-panel button')];
const selects = {
    option1: document.getElementById('1Select'),
    option2: document.getElementById('2Select'),
    option3: document.getElementById('3Select')
};

courseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        courseButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        Object.values(selects).forEach(el => el.style.display = 'none');
        selects[btn.id].style.display = 'block';
    });
});

let quizData = [];
let attempts = 0;

const quiz = document.getElementById('quiz');
const checks = document.getElementById('checksBox');
const resDesk = document.getElementById('result');
const resMob = document.getElementById('resultMobile');
const btnSubDesk = document.getElementById('submitBtn');
const btnShowDesk = document.getElementById('showAnswers');
const btnSubMob = document.getElementById('submitBtnMobile');
const btnShowMob = document.getElementById('showAnswersMobile');

document.getElementById('startQuiz').addEventListener('click', () => {
    const active = courseButtons.find(b => b.classList.contains('active'));
    
    if (!active) {
        quiz.innerHTML = '<p style="color:#ef4444;font-weight:600">Select a course first.</p>';
        return;
    }

    let path = '';
    if (active.id === 'option1') {
        path = document.getElementById('oneJsonSelect').value;
    } else if (active.id === 'option2') {
        path = document.getElementById('twoJsonSelect').value;
    } else {
        path = document.getElementById('threeJsonSelect').value;
    }

    if (!path) {
        quiz.innerHTML = '<p style="color:#ef4444;font-weight:600">Select a quiz first.</p>';
        return;
    }

    reset();
    loadQuiz(path);
});

function reset() {
    quizData = [];
    attempts = 0;
    quiz.innerHTML = '';
    checks.innerHTML = '';
    resDesk.textContent = '';
    resMob.textContent = '';
    document.getElementById('citation').style.display = 'none';
    btnSubDesk.style.display = 'block';
    btnShowDesk.style.display = 'block';
    btnSubMob.style.display = 'none';
    btnShowMob.style.display = 'none';
    resMob.style.display = 'none';
}

async function loadQuiz(path) {
    try {
        const response = await fetch(path);
        const data = await response.json();
        
        quizData = structuredClone(Array.isArray(data) ? data : data.questions || []);
        
        if (!quizData.length) {
            throw new Error('No questions found');
        }

        if (data.citation) {
            const citation = document.getElementById('citation');
            citation.textContent = data.citation;
            citation.style.display = 'block';
        }

        renderQuiz();
    } catch (error) {
        quiz.innerHTML = `<p style="color:#ef4444;font-weight:600">Error: ${error.message}</p>`;
    }
}

function renderQuiz() {
    const questionFragment = document.createDocumentFragment();
    const checksFragment = document.createDocumentFragment();

    quizData.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.textContent = `${index + 1}. ${question.question}`;
        questionFragment.appendChild(questionDiv);

        question.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.dataset.question = index;

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question${index}`;
            radio.value = option;
            radio.id = `q${index}${option.replace(/\s+/g, '')}`;

            const label = document.createElement('label');
            label.textContent = option;
            label.setAttribute('for', radio.id);

            optionDiv.appendChild(radio);
            optionDiv.appendChild(label);

            optionDiv.addEventListener('click', function() {
                const questionIndex = this.dataset.question;
                const sameQuestionOptions = document.querySelectorAll(`.option[data-question='${questionIndex}']`);
                
                sameQuestionOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                radio.checked = true;
                updateBoard();
            });

            questionFragment.appendChild(optionDiv);
        });

        questionFragment.appendChild(document.createElement('br'));

        const checkLink = document.createElement('a');
        checkLink.textContent = `Question ${index + 1}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.disabled = true;
        checkbox.id = `checkbox${index + 1}`;
        
        checksFragment.appendChild(checkLink);
        checksFragment.appendChild(checkbox);
        checksFragment.appendChild(document.createElement('br'));
    });

    quiz.appendChild(questionFragment);
    checks.appendChild(checksFragment);
    
    btnSubMob.style.display = 'block';
    btnShowMob.style.display = 'block';
}

function updateBoard() {
    const checkedRadios = quiz.querySelectorAll('input[type="radio"]:checked');
    
    checkedRadios.forEach(radio => {
        const questionIndex = radio.parentElement.dataset.question;
        const checkbox = document.getElementById(`checkbox${parseInt(questionIndex) + 1}`);
        checkbox.checked = true;
    });
}

function showAnswers() {
    const allOptions = quiz.querySelectorAll('.option');
    
    allOptions.forEach(option => {
        const questionIndex = option.dataset.question;
        const correctAnswer = quizData[questionIndex].answer;
        const radio = option.querySelector('input[type="radio"]');
        
        if (radio.value === correctAnswer) {
            option.classList.add('correct');
        } else {
            option.classList.add('incorrect');
        }
    });
}

function submit() {
    const checkedRadios = quiz.querySelectorAll('input[type="radio"]:checked');
    let score = 0;

    checkedRadios.forEach(radio => {
        const option = radio.parentElement;
        const questionIndex = option.dataset.question;
        const correctAnswer = quizData[questionIndex].answer;
        
        if (radio.value === correctAnswer) {
            score++;
            option.classList.add('correct');
            document.getElementById(`checkbox${parseInt(questionIndex) + 1}`).checked = true;
        } else {
            option.classList.add('incorrect');
            document.getElementById(`checkbox${parseInt(questionIndex) + 1}`).checked = false;
        }
    });

    attempts++;
    const percentage = ((score / quizData.length) * 100).toFixed(2);
    const resultMessage = `You scored ${score} out of ${quizData.length}.<br>Your percentage: ${percentage}%.<br>You tried the quiz ${attempts} times.`;

    resDesk.innerHTML = resultMessage;
    resMob.innerHTML = resultMessage;
    resMob.style.display = 'block';
}

btnShowDesk.addEventListener('click', showAnswers);
btnShowMob.addEventListener('click', () => btnShowDesk.click());
btnSubDesk.addEventListener('click', submit);
btnSubMob.addEventListener('click', () => btnSubDesk.click());
