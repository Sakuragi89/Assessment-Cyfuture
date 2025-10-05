// Admin Dashboard Functionality
let allQuizzes = JSON.parse(localStorage.getItem('allQuizzes')) || {};
let currentQuizData = [];

// Default quiz data
const defaultQuizData = [
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

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeQuizzes();
    loadAllResults();
    setupModal();
    setupUploadFunctionality();
});

function initializeQuizzes() {
    // Initialize with default quiz if no quizzes exist
    if (Object.keys(allQuizzes).length === 0) {
        allQuizzes = {
            'Technical': defaultQuizData
        };
        localStorage.setItem('allQuizzes', JSON.stringify(allQuizzes));
    }
    
    // Set active quiz if not set
    const activeQuiz = localStorage.getItem('activeQuiz') || 'Technical';
    if (allQuizzes[activeQuiz]) {
        currentQuizData = allQuizzes[activeQuiz];
        localStorage.setItem('currentQuiz', JSON.stringify(currentQuizData));
    }
    
    loadQuizList();
}

function setupUploadFunctionality() {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('questionsFile');
    const fileName = document.getElementById('fileName');
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleFileUpload);
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                fileName.textContent = e.target.files[0].name;
            } else {
                fileName.textContent = '';
            }
        });
    }
}

function handleFileUpload() {
    const fileInput = document.getElementById('questionsFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showUploadStatus('Please select a file first.', 'error');
        return;
    }
    
    // Check file type
    if (!file.name.endsWith('.csv')) {
        showUploadStatus('Please upload a CSV file. Excel support coming soon.', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const questions = parseCSVContent(content);
            
            if (questions.length > 0) {
                saveQuestions(questions);
                showUploadStatus(`Successfully uploaded ${questions.length} questions!`, 'success');
                loadQuizList();
                fileInput.value = '';
                document.getElementById('fileName').textContent = '';
            } else {
                showUploadStatus('No valid questions found in the file.', 'error');
            }
        } catch (error) {
            showUploadStatus('Error reading file: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showUploadStatus('Error reading file.', 'error');
    };
    
    reader.readAsText(file);
}

function parseCSVContent(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const questions = [];
    
    if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
    }
    
    // Validate header
    const header = lines[0].toLowerCase();
    const expectedHeader = 'question,option1,option2,option3,option4,correct_answer,category';
    if (!header.includes('question') || !header.includes('option1') || !header.includes('correct_answer')) {
        throw new Error('Invalid CSV format. Please check the column headers.');
    }
    
    // Process data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = parseCSVLine(line);
        
        if (columns.length >= 7) {
            try {
                const question = {
                    question: columns[0].replace(/^"|"$/g, '').trim(),
                    options: [
                        columns[1].replace(/^"|"$/g, '').trim(),
                        columns[2].replace(/^"|"$/g, '').trim(),
                        columns[3].replace(/^"|"$/g, '').trim(),
                        columns[4].replace(/^"|"$/g, '').trim()
                    ],
                    correct: parseInt(columns[5]) - 1,
                    category: columns[6].replace(/^"|"$/g, '').trim() || 'General'
                };
                
                // Validate question data
                if (question.question && 
                    question.options.every(opt => opt) &&
                    question.correct >= 0 && question.correct <= 3 && 
                    question.category) {
                    questions.push(question);
                }
            } catch (error) {
                console.warn('Skipping invalid row:', line);
            }
        }
    }
    
    return questions;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function saveQuestions(questions) {
    const questionsByCategory = {};
    
    questions.forEach(q => {
        if (!questionsByCategory[q.category]) {
            questionsByCategory[q.category] = [];
        }
        questionsByCategory[q.category].push(q);
    });
    
    Object.keys(questionsByCategory).forEach(category => {
        if (!allQuizzes[category]) {
            allQuizzes[category] = [];
        }
        allQuizzes[category] = [...allQuizzes[category], ...questionsByCategory[category]];
    });
    
    localStorage.setItem('allQuizzes', JSON.stringify(allQuizzes));
    
    // Update active quiz if it's the first category
    const firstCategory = Object.keys(questionsByCategory)[0];
    if (firstCategory && !localStorage.getItem('activeQuiz')) {
        setActiveQuiz(firstCategory);
    }
}

function showUploadStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;
    statusDiv.classList.remove('hidden');
    
    setTimeout(() => {
        statusDiv.classList.add('hidden');
    }, 5000);
}

function loadQuizList() {
    const quizList = document.getElementById('quizList');
    const activeQuiz = localStorage.getItem('activeQuiz') || 'Technical';
    
    if (!quizList) return;
    
    quizList.innerHTML = '';
    
    Object.keys(allQuizzes).forEach(category => {
        const quizCard = document.createElement('div');
        quizCard.className = `quiz-card ${category === activeQuiz ? 'active-quiz' : ''}`;
        
        quizCard.innerHTML = `
            <h4>${category} ${category === activeQuiz ? '⭐' : ''}</h4>
            <p><strong>Questions:</strong> ${allQuizzes[category].length}</p>
            <p><strong>Category:</strong> ${category}</p>
            <div class="quiz-actions">
                <button class="btn btn-primary" onclick="setActiveQuiz('${category}')">
                    ${category === activeQuiz ? 'Active' : 'Set Active'}
                </button>
                <button class="btn btn-warning" onclick="exportQuiz('${category}')">Export</button>
                <button class="btn btn-danger" onclick="deleteQuiz('${category}')">Delete</button>
            </div>
        `;
        
        quizList.appendChild(quizCard);
    });
    
    // Update active quiz display
    document.getElementById('activeQuiz').textContent = activeQuiz;
}

function setActiveQuiz(category) {
    if (allQuizzes[category]) {
        localStorage.setItem('activeQuiz', category);
        currentQuizData = allQuizzes[category];
        localStorage.setItem('currentQuiz', JSON.stringify(currentQuizData));
        showUploadStatus(`"${category}" quiz is now active! Employees will see this quiz.`, 'success');
        loadQuizList();
    }
}

function deleteQuiz(category) {
    if (Object.keys(allQuizzes).length <= 1) {
        showUploadStatus('Cannot delete the only quiz. Create a new quiz first.', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the "${category}" quiz? This action cannot be undone.`)) {
        delete allQuizzes[category];
        localStorage.setItem('allQuizzes', JSON.stringify(allQuizzes));
        
        // If deleting active quiz, set another as active
        const activeQuiz = localStorage.getItem('activeQuiz');
        if (activeQuiz === category) {
            const newActive = Object.keys(allQuizzes)[0];
            setActiveQuiz(newActive);
        }
        
        loadQuizList();
        showUploadStatus(`"${category}" quiz has been deleted.`, 'info');
    }
}

function exportQuiz(category) {
    if (!allQuizzes[category]) return;
    
    const quiz = allQuizzes[category];
    let csv = 'question,option1,option2,option3,option4,correct_answer,category\n';
    
    quiz.forEach(q => {
        const row = [
            `"${q.question}"`,
            `"${q.options[0]}"`,
            `"${q.options[1]}"`,
            `"${q.options[2]}"`,
            `"${q.options[3]}"`,
            q.correct + 1,
            `"${q.category}"`
        ].join(',');
        csv += row + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_${category}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Results Management Functions
function loadAllResults() {
    const results = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
    updateStats(results);
    displayResults(results);
}

function updateStats(results) {
    const totalAttempts = results.length;
    document.getElementById('totalAttempts').textContent = totalAttempts;
    
    if (totalAttempts > 0) {
        const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
        const averageScore = Math.round(totalPercentage / totalAttempts);
        document.getElementById('averageScore').textContent = averageScore + '%';
        
        const passCount = results.filter(result => result.percentage >= 60).length;
        const passRate = Math.round((passCount / totalAttempts) * 100);
        document.getElementById('passRate').textContent = passRate + '%';
    } else {
        document.getElementById('averageScore').textContent = '0%';
        document.getElementById('passRate').textContent = '0%';
    }
}

function displayResults(results) {
    const resultsBody = document.getElementById('resultsBody');
    const noResults = document.getElementById('noResults');
    
    if (results.length === 0) {
        resultsBody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    resultsBody.innerHTML = results.map((result, index) => `
        <tr>
            <td>${result.employeeId}</td>
            <td>${result.employeeName}</td>
            <td>${result.score}/${result.total}</td>
            <td>${result.percentage}%</td>
            <td>${result.quiz || 'Technical'}</td>
            <td>${new Date(result.timestamp).toLocaleString()}</td>
            <td class="${result.percentage >= 60 ? 'status-pass' : 'status-fail'}">
                ${result.percentage >= 60 ? 'PASS' : 'FAIL'}
            </td>
            <td>
                <button class="action-btn" onclick="viewDetails(${index})">View Details</button>
                <button class="action-btn" onclick="deleteResult(${index})" style="background: #dc3545;">Delete</button>
            </td>
        </tr>
    `).join('');
}

function viewDetails(index) {
    const results = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
    const result = results[index];
    const quizData = allQuizzes[result.quiz] || currentQuizData;
    
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="result-details">
            <div class="detail-item">
                <strong>Employee ID:</strong> ${result.employeeId}
            </div>
            <div class="detail-item">
                <strong>Name:</strong> ${result.employeeName}
            </div>
            <div class="detail-item">
                <strong>Score:</strong> ${result.score}/${result.total}
            </div>
            <div class="detail-item">
                <strong>Percentage:</strong> ${result.percentage}%
            </div>
            <div class="detail-item">
                <strong>Quiz:</strong> ${result.quiz || 'Technical'}
            </div>
            <div class="detail-item">
                <strong>Date:</strong> ${new Date(result.timestamp).toLocaleString()}
            </div>
            <div class="detail-item">
                <strong>Status:</strong> <span class="${result.percentage >= 60 ? 'status-pass' : 'status-fail'}">
                    ${result.percentage >= 60 ? 'PASSED' : 'FAILED'}
                </span>
            </div>
            
            <h3 style="margin-top: 20px; margin-bottom: 15px;">Question-wise Answers:</h3>
            ${result.answers.map((answer, qIndex) => {
                const question = quizData[qIndex];
                if (!question) return '';
                
                const isCorrect = answer === question.correct;
                const answerText = answer === null ? 'Skipped' : question.options[answer];
                const correctAnswer = question.options[question.correct];
                
                return `
                    <div class="question-detail" style="border-left-color: ${isCorrect ? '#28a745' : '#dc3545'}">
                        <strong>Q${qIndex + 1}:</strong> ${question.question}<br>
                        <span class="${isCorrect ? 'answer-correct' : 'answer-wrong'}">
                            Selected: ${answerText}
                        </span><br>
                        ${!isCorrect ? `<span class="answer-correct">Correct: ${correctAnswer}</span>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    document.getElementById('resultModal').style.display = 'block';
}

function setupModal() {
    const modal = document.getElementById('resultModal');
    const span = document.getElementsByClassName('close')[0];
    
    span.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function deleteResult(index) {
    if (confirm('Are you sure you want to delete this result?')) {
        const results = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
        results.splice(index, 1);
        localStorage.setItem('allQuizResults', JSON.stringify(results));
        loadAllResults();
    }
}

function clearAllResults() {
    if (confirm('Are you sure you want to delete ALL results? This action cannot be undone.')) {
        localStorage.removeItem('allQuizResults');
        loadAllResults();
    }
}

function exportToCSV() {
    const results = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
    
    if (results.length === 0) {
        alert('No results to export.');
        return;
    }
    
    let csv = 'Employee ID,Name,Score,Percentage,Quiz,Status,Date\n';
    
    results.forEach(result => {
        const status = result.percentage >= 60 ? 'PASS' : 'FAIL';
        const date = new Date(result.timestamp).toLocaleString();
        csv += `"${result.employeeId}","${result.employeeName}","${result.score}/${result.total}","${result.percentage}%","${result.quiz || 'Technical'}","${status}","${date}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
// Force update main quiz data
function refreshMainQuiz() {
    const activeQuiz = localStorage.getItem('activeQuiz');
    const allQuizzes = JSON.parse(localStorage.getItem('allQuizzes') || '{}');
    
    if (activeQuiz && allQuizzes[activeQuiz]) {
        localStorage.setItem('currentQuiz', JSON.stringify(allQuizzes[activeQuiz]));
        console.log('Main quiz refreshed with', allQuizzes[activeQuiz].length, 'questions from', activeQuiz);
    }
}

// Call this when setting active quiz
function setActiveQuiz(category) {
    if (allQuizzes[category]) {
        localStorage.setItem('activeQuiz', category);
        currentQuizData = allQuizzes[category];
        localStorage.setItem('currentQuiz', JSON.stringify(currentQuizData));
        refreshMainQuiz();
        showUploadStatus(`"${category}" quiz is now active!`, 'success');
        loadQuizList();
    }
}
