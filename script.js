// Dynamic Quiz Data - Reads from localStorage
let quizData = [];

// Load quiz data from localStorage
function loadQuizData() {
    const savedQuiz = localStorage.getItem('currentQuiz');
    if (savedQuiz && JSON.parse(savedQuiz).length > 0) {
        quizData = JSON.parse(savedQuiz);
        console.log('Loaded dynamic quiz with', quizData.length, 'questions');
    } else {
        // Fallback to default questions if no dynamic quiz exists
        quizData = [
            {
                question: "What does HTML stand for?",
                options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
                correct: 0,
                category: "Technical"
            },
            {
                question: "Which programming language is known as the 'language of the web'?",
                options: ["Python", "Java", "JavaScript", "C++"],
                correct: 2,
                category: "Technical"
            },
            {
                question: "What is the purpose of CSS?",
                options: ["To structure web content", "To add interactivity to websites", "To style and layout web pages", "To manage databases"],
                correct: 2,
                category: "Technical"
            }
        ];
        console.log('Loaded default quiz with', quizData.length, 'questions');
    }
}

let currentEmployee = null;
let currentQuestionIndex = 0;
let userAnswers = [];

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const loginForm = document.getElementById('loginForm');
const questionContainer = document.getElementById('questionContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load quiz data first
    loadQuizData();
    
    // Initialize screens
    if (quizScreen) quizScreen.classList.add('hidden');
    if (resultScreen) resultScreen.classList.add('hidden');
    
    // Add event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', previousQuestion);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    if (submitBtn) {
        submitBtn.addEventListener('click', submitQuiz);
    }
    
    console.log('Quiz initialized with', quizData.length, 'questions');
});

function handleLogin(e) {
    e.preventDefault();
    const employeeId = document.getElementById('employeeId').value;
    const employeeName = document.getElementById('employeeName').value;
    
    if (!employeeId || !employeeName) {
        alert('Please enter both Employee ID and Name');
        return;
    }
    
    currentEmployee = { id: employeeId, name: employeeName };
    
    // Reload quiz data in case it changed
    loadQuizData();
    
    // Reset quiz state
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData.length).fill(null);
    
    // Show quiz screen
    loginScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    document.getElementById('currentEmployeeName').textContent = employeeName;
    document.getElementById('currentEmployeeId').textContent = employeeId;
    
    loadQuestion();
}

function loadQuestion() {
    if (quizData.length === 0) {
        console.error('No quiz data available');
        return;
    }
    
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
    if (quizData.length === 0) {
        console.error('No quiz data available for submission');
        return;
    }
    
    let score = 0;
    quizData.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            score++;
        }
    });
    
    const percentage = Math.round((score / quizData.length) * 100);
    
    // Save the result silently
    saveQuizResult(
        currentEmployee.id, 
        currentEmployee.name, 
        score, 
        percentage, 
        [...userAnswers],
        quizData[0]?.category || 'Default'
    );
    
    // Switch to result screen
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
}

function saveQuizResult(employeeId, employeeName, score, percentage, answers, quizCategory) {
    const result = {
        employeeId: employeeId,
        employeeName: employeeName,
        score: score,
        total: quizData.length,
        percentage: percentage,
        answers: answers,
        timestamp: new Date().toISOString(),
        quiz: quizCategory || (quizData[0]?.category || 'Default')
    };
    
    // Get existing results from localStorage
    const allResults = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
    
    // Add new result
    allResults.push(result);
    
    // Save back to localStorage
    localStorage.setItem('allQuizResults', JSON.stringify(allResults));
    
    console.log('Result saved for', employeeName, 'in quiz', result.quiz);
    
    return result;
}
