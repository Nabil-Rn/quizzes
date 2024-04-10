//auto start the quiz? nah!
//document.addEventListener("DOMContentLoaded", function() {
document.getElementById('startQuiz').addEventListener('click', function() {
    //fetch the selected quiz!
    const selectedFile = document.getElementById('jsonSelect').value;
    const quizContainer = document.getElementById('quiz');
    const checksBox = document.getElementById('checksBox');
    const submitButton = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('result');
    let quizData = null;
    let trys = 0;

    // Load quiz data from JSON file
    fetch(selectedFile)
        .then(response => response.json())
        .then(data => {
            quizData = data;
            displayQuiz();
        })
        .catch(error => {
            console.error('Error loading quiz data: ', error);
        });

    // Display the quiz questions
    function displayQuiz() {
        let quizHTML = '';
        let checksHTML = '';
        quizData.forEach((question, index) => {
            quizHTML += `<div class="question" id="${index + 1}">${index + 1}. ${question.question}</div>`;
            checksHTML += `
               <input type="checkbox" id="${index+1}" name="scales" /> <a>${index+1}<a\>
                `;
            question.options.forEach(option => {
                quizHTML += `
                <div class="option" data-question="${index}">
                    <input type="radio" id="q${index}option${option}" name="question${index}" value="${option}" required>
                    <label for="q${index}option${option}">${option}</label>
                </div>`;

            });
            quizHTML += '<br>';
        });
        quizContainer.innerHTML = quizHTML;
        checksBox.innerHTML = checksHTML;
        // Add event listener to each option div
        const selectedOption = document.querySelectorAll('.option');
        selectedOption.forEach(optionDiv => {
            optionDiv.addEventListener('click', function() {
                // Remove 'selected' class from all options in the same question
                const questionNumber = optionDiv.getAttribute('data-question');
                const otherOptions = document.querySelectorAll(`.option[data-question="${questionNumber}"]`);
                otherOptions.forEach(otherOption => {
                    otherOption.classList.remove('selected');
                });

                // Add 'selected' class to the clicked option
                optionDiv.classList.add('selected');

                // Find the associated radio button and trigger click event
                const radioButton = optionDiv.querySelector('input[type="radio"]');
                radioButton.click();
            });
        });
    }


    // submit the quiz: Calculate and display quiz results
submitButton.addEventListener('click', function() {
    const userAnswers = document.querySelectorAll('input[type="radio"]:checked');
    let score = 0;
    userAnswers.forEach((answer, index) => {
        const optionDiv = answer.parentElement; // Get the parent div of the selected radio button
        const questionNumber = optionDiv.getAttribute('data-question');
        const correctAnswer = quizData[questionNumber].answer;

        if (answer.value === correctAnswer) {
            score++;
            optionDiv.classList.add('correct');

        } else {
            optionDiv.classList.add('incorrect');
        }
    });
    trys++;
    const totalQuestions = quizData.length;
    const percentage = (score / totalQuestions) * 100;
    resultContainer.innerHTML = `You scored ${score} out of ${totalQuestions}.<br>Your percentage: ${percentage.toFixed(2)}%.<br>Your tried the quiz:${trys}`;
});

});
