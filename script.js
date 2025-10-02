// Quiz Questions
const quizData = [
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
        correct: 0
    },
    {
        question: "Which programming language is known as the 'language of the web'?",
        options: ["Python", "Java", "JavaScript", "C++"],
        correct: 2
    },
    {
        question: "What is the purpose of CSS?",
        options: ["To structure web content", "To add interactivity to websites", "To style and layout web pages", "To manage databases"],
        correct: 2
    }
];

let currentEmployee = null;
let currentQuestionIndex = 0;
let userAnswers = new Array(quizData.length).fill(null);

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const loginForm = document.getElementById('loginForm');
const questionContainer = document.getElementById('questionContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loginForm.addEventListener('submit', handleLogin);
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    submitBtn.addEventListener('click', submitQuiz);
    restartBtn.addEventListener('click', restartQuiz);
});

function handleLogin(e) {
    e.preventDefault();
    const employeeId = document.getElementById('employeeId').value;
    const employeeName = document.getElementById('employeeName').value;
    
    currentEmployee = { id: employeeId, name: employeeName };
    
    loginScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    document.getElementById('currentEmployeeName').textContent = employeeName;
    document.getElementById('currentEmployeeId').textContent = employeeId;
    
    loadQuestion();
}

function loadQuestion() {
    const question = quizData[currentQuestionIndex];
    
    questionContainer.innerHTML = `
        <div class="question">
            <h3>Question ${currentQuestionIndex + 1}: ${question.question}</h3>
            <div class="options">
                ${question.options.map((option, index) => `
                    <div class="option ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" 
                         data-index="${index}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listeners to options
    const options = questionContainer.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const selectedIndex = parseInt(this.getAttribute('data-index'));
            selectOption(selectedIndex);
        });
    });
    
    // Update navigation buttons
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.classList.toggle('hidden', currentQuestionIndex === quizData.length - 1);
    submitBtn.classList.toggle('hidden', currentQuestionIndex !== quizData.length - 1);
}

function selectOption(index) {
    userAnswers[currentQuestionIndex] = index;
    loadQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function submitQuiz() {
    let score = 0;
    quizData.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            score++;
        }
    });
    
    const percentage = Math.round((score / quizData.length) * 100);
    
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    document.getElementById('resultEmployeeName').textContent = currentEmployee.name;
    document.getElementById('resultEmployeeId').textContent = currentEmployee.id;
    document.getElementById('finalScore').textContent = `${score}/${quizData.length} (${percentage}%)`;
    
    const message = document.getElementById('resultMessage');
    if (percentage >= 80) {
        message.textContent = "Excellent work!";
        message.style.color = "green";
    } else if (percentage >= 60) {
        message.textContent = "Good job!";
        message.style.color = "orange";
    } else {
        message.textContent = "Keep learning!";
        message.style.color = "red";
    }
}

function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData.length).fill(null);
    resultScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    loginForm.reset();
}

// Add this function to save results
function saveQuizResult(employeeId, employeeName, score, percentage, answers) {
    const result = {
        employeeId: employeeId,
        employeeName: employeeName,
        score: score,
        total: quizData.length,
        percentage: percentage,
        answers: answers,
        timestamp: new Date().toISOString(),
        quiz: 'Employee Assessment Quiz'
    };
    
    // Get existing results from localStorage
    const allResults = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
    
    // Add new result
    allResults.push(result);
    
    // Save back to localStorage
    localStorage.setItem('allQuizResults', JSON.stringify(allResults));
    
    return result;
}

// Update your submitQuiz function to call saveQuizResult
function submitQuiz() {
    let score = 0;
    quizData.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            score++;
        }
    });
    
    const percentage = Math.round((score / quizData.length) * 100);
    
    // Save the result
    const result = saveQuizResult(
        currentEmployee.id, 
        currentEmployee.name, 
        score, 
        percentage, 
        [...userAnswers]
    );
    
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    document.getElementById('resultEmployeeName').textContent = currentEmployee.name;
    document.getElementById('resultEmployeeId').textContent = currentEmployee.id;
    document.getElementById('finalScore').textContent = `${score}/${quizData.length} (${percentage}%)`;
    
    const message = document.getElementById('resultMessage');
    let performanceClass = '';
    
    if (percentage >= 90) {
        message.innerHTML = '<span class="performance-excellent">Outstanding Performance! 🌟</span><br>You have demonstrated excellent knowledge.';
        performanceClass = 'performance-excellent';
    } else if (percentage >= 75) {
        message.innerHTML = '<span class="performance-excellent">Very Good Performance! 👍</span><br>You have shown strong understanding.';
        performanceClass = 'performance-excellent';
    } else if (percentage >= 60) {
        message.innerHTML = '<span class="performance-good">Good Performance! ✅</span><br>You have good knowledge with room for improvement.';
        performanceClass = 'performance-good';
    } else if (percentage >= 40) {
        message.innerHTML = '<span class="performance-average">Satisfactory Performance 📊</span><br>Consider reviewing the material.';
        performanceClass = 'performance-average';
    } else {
        message.innerHTML = '<span class="performance-poor">Needs Improvement 📚</span><br>We recommend additional training.';
        performanceClass = 'performance-poor';
    }
    
    // Add performance class to score display
    document.getElementById('finalScore').className = `score-display ${performanceClass}`;
}
    
}
