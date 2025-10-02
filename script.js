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

// Event Listeners - FIXED: Wait for DOM to load properly
document.addEventListener('DOMContentLoaded', function() {
    // Initialize screens - hide quiz and result screens
    const quizScreen = document.getElementById('quizScreen');
    const resultScreen = document.getElementById('resultScreen');
    
    if (quizScreen) quizScreen.classList.add('hidden');
    if (resultScreen) resultScreen.classList.add('hidden');
    
    // Add event listeners
    const loginForm = document.getElementById('loginForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
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
    
    // Hide login, show quiz
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    
    // Update employee info
    document.getElementById('currentEmployeeName').textContent = employeeName;
    document.getElementById('currentEmployeeId').textContent = employeeId;
    
    // Reset quiz state
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData.length).fill(null);
    
    loadQuestion();
}

function loadQuestion() {
    const question = quizData[currentQuestionIndex];
    const questionContainer = document.getElementById('questionContainer');
    
    if (!questionContainer) return;
    
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
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) nextBtn.classList.toggle('hidden', currentQuestionIndex === quizData.length - 1);
    if (submitBtn) submitBtn.classList.toggle('hidden', currentQuestionIndex !== quizData.length - 1);
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
    
    // Save the result silently
    saveQuizResult(
        currentEmployee.id, 
        currentEmployee.name, 
        score, 
        percentage, 
        [...userAnswers]
    );
    
    // Switch to result screen
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
}

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
