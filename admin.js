// Combined Admin and Employee Quiz Functionality with Password Protection
let allQuizzes = JSON.parse(localStorage.getItem('allQuizzes')) || {};
let currentQuizData = [];
let currentEmployee = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let isAdminLoggedIn = false;

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
    }
];

// Admin credentials (you can change these)
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123" // Change this to your preferred password
};

// Initialize portal
document.addEventListener('DOMContentLoaded', function() {
    checkAdminLogin();
    setupAdminLogin();
    initializeQuizzes();
    setupEmployeeQuiz();
});

function checkAdminLogin() {
    const savedLogin = localStorage.getItem('adminLoggedIn');
    if (savedLogin === 'true') {
        isAdminLoggedIn = true;
        showMainPortal();
    } else {
        showAdminLogin();
    }
}

function setupAdminLogin() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        showMainPortal();
    } else {
        alert('Invalid admin credentials! Please try again.');
        document.getElementById('adminLoginForm').reset();
    }
}

function showAdminLogin() {
    document.getElementById('adminLoginScreen').classList.remove('hidden');
    document.getElementById('mainPortal').classList.add('hidden');
}

function showMainPortal() {
    document.getElementById('adminLoginScreen').classList.add('hidden');
    document.getElementById('mainPortal').classList.remove('hidden');
    
    // Initialize admin functionality
    loadAllResults();
    setupModal();
    setupUploadFunctionality();
    
    // Show employee tab by default
    openTab('employeeTab');
}

function showEmployeePortal() {
    showMainPortal();
    openTab('employeeTab');
}

function logout() {
    isAdminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    showAdminLogin();
}

function initializeQuizzes() {
    if (Object.keys(allQuizzes).length === 0) {
        allQuizzes = {
            'Technical': defaultQuizData
        };
        localStorage.setItem('allQuizzes', JSON.stringify(allQuizzes));
    }
    
    const activeQuiz = localStorage.getItem('activeQuiz') || 'Technical';
    if (allQuizzes[activeQuiz]) {
        currentQuizData = allQuizzes[activeQuiz];
        localStorage.setItem('currentQuiz', JSON.stringify(currentQuizData));
    }
    
    loadQuizList();
    updateActiveQuizDisplay();
}

function setupEmployeeQuiz() {
    const employeeLoginForm = document.getElementById('employeeLoginForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (employeeLoginForm) {
        employeeLoginForm.addEventListener('submit', handleEmployeeLogin);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', previousQuestion);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    if (submitBtn) {
        submitBtn.addEventListener('click', submitEmployeeQuiz);
    }
}

function handleEmployeeLogin(e) {
    e.preventDefault();
    const employeeId = document.getElementById('employeeId').value;
    const employeeName = document.getElementById('employeeName').value;
    
    if (!employeeId || !employeeName) {
        alert('Please enter both Employee ID and Name');
        return;
    }
    
    currentEmployee = { id: employeeId, name: employeeName };
    
    // Load current quiz data
    const activeQuiz = localStorage.getItem('activeQuiz') || 'Technical';
    if (allQuizzes[activeQuiz]) {
        currentQuizData = allQuizzes[activeQuiz];
    }
    
    // Reset quiz state
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuizData.length).fill(null);
    
    // Show quiz screen
    document.getElementById('employeeLoginScreen').classList.add('hidden');
    document.getElementById('employeeQuizScreen').classList.remove('hidden');
    
    document.getElementById('currentEmployeeName').textContent = employeeName;
    document.getElementById('currentEmployeeId').textContent = employeeId;
    document.getElementById('currentQuizName').textContent = activeQuiz;
    
    loadQuestion();
}

function loadQuestion() {
    if (currentQuizData.length === 0) {
        console.error('No quiz data available');
        return;
    }
    
    const question = currentQuizData[currentQuestionIndex];
    const questionContainer = document.getElementById('questionContainer');
    
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
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').classList.toggle('hidden', currentQuestionIndex === currentQuizData.length - 1);
    document.getElementById('submitBtn').classList.toggle('hidden', currentQuestionIndex !== currentQuizData.length - 1);
    
    // Update progress
    document.getElementById('quizProgress').textContent = `${currentQuestionIndex + 1}/${currentQuizData.length}`;
}

function selectOption(index) {
    userAnswers[currentQuestionIndex] = index;
    loadQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuizData.length - 1) {
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

function submitEmployeeQuiz() {
    if (currentQuizData.length === 0) {
        console.error('No quiz data available for submission');
        return;
    }
    
    let score = 0;
    currentQuizData.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            score++;
        }
    });
    
    const percentage = Math.round((score / currentQuizData.length) * 100);
    
    // Save the result with complete quiz data
    saveQuizResult(
        currentEmployee.id, 
        currentEmployee.name, 
        score, 
        percentage, 
        [...userAnswers],
        currentQuizData[0]?.category || 'Default',
        JSON.parse(JSON.stringify(currentQuizData))
    );
    
    // Switch to result screen
    document.getElementById('employeeQuizScreen').classList.add('hidden');
    document.getElementById('employeeResultScreen').classList.remove('hidden');
}

function saveQuizResult(employeeId, employeeName, score, percentage, answers, quizCategory, quizDataCopy) {
    const result = {
        employeeId: employeeId,
        employeeName: employeeName,
        score: score,
        total: quizDataCopy.length,
        percentage: percentage,
        answers: answers,
        timestamp: new Date().toISOString(),
        quiz: quizCategory,
        quizData: quizDataCopy
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

function restartEmployeeQuiz() {
    document.getElementById('employeeResultScreen').classList.add('hidden');
    document.getElementById('employeeLoginScreen').classList.remove('hidden');
    document.getElementById('employeeLoginForm').reset();
    currentEmployee = null;
    currentQuestionIndex = 0;
    userAnswers = [];
}

// Tab Management
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Show the specific tab content and activate the button
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Reload data when switching to admin tab
    if (tabName === 'adminTab') {
        loadAllResults();
    }
}

function updateActiveQuizDisplay() {
    const activeQuiz = localStorage.getItem('activeQuiz') || 'Technical';
    document.getElementById('currentActiveQuiz').textContent = activeQuiz;
}

// Admin functionality
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
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                parseExcelFile(e.target.result, file);
            } else if (file.name.endsWith('.csv')) {
                const content = e.target.result;
                const questions = parseCSVContent(content);
                processQuestions(questions);
            } else {
                showUploadStatus('Unsupported file format. Please upload CSV or Excel files.', 'error');
            }
        } catch (error) {
            showUploadStatus('Error reading file: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showUploadStatus('Error reading file.', 'error');
    };
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
}

function parseExcelFile(arrayBuffer, file) {
    try {
        if (typeof XLSX === 'undefined') {
            showUploadStatus('Excel support requires SheetJS library. Please use CSV format.', 'error');
            return;
        }
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length < 2) {
            showUploadStatus('Excel file must have at least a header row and one data row.', 'error');
            return;
        }
        
        const questions = parseExcelData(data);
        processQuestions(questions);
        
    } catch (error) {
        showUploadStatus('Error parsing Excel file: ' + error.message, 'error');
    }
}

function parseExcelData(data) {
    const questions = [];
    const headers = data[0].map(h => h ? h.toString().toLowerCase().trim() : '');
    
    const questionIndex = headers.findIndex(h => h.includes('question'));
    const option1Index = headers.findIndex(h => h.includes('option1'));
    const option2Index = headers.findIndex(h => h.includes('option2'));
    const option3Index = headers.findIndex(h => h.includes('option3'));
    const option4Index = headers.findIndex(h => h.includes('option4'));
    const correctIndex = headers.findIndex(h => h.includes('correct'));
    const categoryIndex = headers.findIndex(h => h.includes('category'));
    
    if (questionIndex === -1 || option1Index === -1 || correctIndex === -1) {
        throw new Error('Required columns (question, option1, correct_answer) not found.');
    }
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        try {
            const question = {
                question: (row[questionIndex] || '').toString().trim(),
                options: [
                    (row[option1Index] || '').toString().trim(),
                    (row[option2Index] || '').toString().trim(),
                    (row[option3Index] || '').toString().trim(),
                    (row[option4Index] || '').toString().trim()
                ],
                correct: parseInt(row[correctIndex]) - 1,
                category: (row[categoryIndex] || 'General').toString().trim()
            };
            
            if (question.question && 
                question.options[0] &&
                !isNaN(question.correct) && 
                question.correct >= 0 && question.correct <= 3) {
                questions.push(question);
            }
        } catch (error) {
            console.warn('Skipping invalid Excel row:', row);
        }
    }
    
    return questions;
}

function processQuestions(questions) {
    if (questions.length > 0) {
        saveQuestionsAsSeparateSet(questions);
        showUploadStatus(`Successfully uploaded ${questions.length} questions!`, 'success');
        loadQuizList();
        document.getElementById('questionsFile').value = '';
        document.getElementById('fileName').textContent = '';
    } else {
        showUploadStatus('No valid questions found.', 'error');
    }
}

function parseCSVContent(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const questions = [];
    
    if (lines.length < 2) {
        throw new Error('File must have at least a header row and one data row');
    }
    
    const header = lines[0].toLowerCase();
    if (!header.includes('question') || !header.includes('option1') || !header.includes('correct')) {
        throw new Error('Invalid file format. Required columns: question, option1, correct_answer');
    }
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = parseCSVLine(line);
        
        if (columns.length >= 3) {
            try {
                const question = {
                    question: columns[0].replace(/^"|"$/g, '').trim(),
                    options: [
                        columns[1].replace(/^"|"$/g, '').trim(),
                        (columns[2] || '').replace(/^"|"$/g, '').trim(),
                        (columns[3] || '').replace(/^"|"$/g, '').trim(),
                        (columns[4] || '').replace(/^"|"$/g, '').trim()
                    ],
                    correct: parseInt(columns[5]) - 1,
                    category: (columns[6] || 'General').replace(/^"|"$/g, '').trim()
                };
                
                if (question.question && 
                    question.options[0] &&
                    !isNaN(question.correct) && 
                    question.correct >= 0 && question.correct <= 3) {
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

function saveQuestionsAsSeparateSet(questions) {
    const questionsByCategory = {};
    
    questions.forEach(q => {
        if (!questionsByCategory[q.category]) {
            questionsByCategory[q.category] = [];
        }
        questionsByCategory[q.category].push(q);
    });
    
    Object.keys(questionsByCategory).forEach(category => {
        let uniqueCategoryName = category;
        let counter = 1;
        
        while (allQuizzes[uniqueCategoryName]) {
            uniqueCategoryName = `${category}_${counter}`;
            counter++;
        }
        
        allQuizzes[uniqueCategoryName] = questionsByCategory[category];
    });
    
    localStorage.setItem('allQuizzes', JSON.stringify(allQuizzes));
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
                <button class="btn btn-warning" onclick="exportQuiz('${category}')">Export Quiz</button>
                <button class="btn btn-danger" onclick="deleteQuiz('${category}')">Delete</button>
            </div>
        `;
        
        quizList.appendChild(quizCard);
    });
    
    document.getElementById('activeQuiz').textContent = activeQuiz;
    updateActiveQuizDisplay();
}

function setActiveQuiz(category) {
    if (allQuizzes[category]) {
        localStorage.setItem('activeQuiz', category);
        currentQuizData = allQuizzes[category];
        localStorage.setItem('currentQuiz', JSON.stringify(currentQuizData));
        showUploadStatus(`"${category}" quiz is now active!`, 'success');
        loadQuizList();
    }
}

function deleteQuiz(category) {
    if (Object.keys(allQuizzes).length <= 1) {
        showUploadStatus('Cannot delete the only quiz.', 'error');
        return;
    }
    
    if (confirm(`Delete the "${category}" quiz?`)) {
        delete allQuizzes[category];
        localStorage.setItem('allQuizzes', JSON.stringify(allQuizzes));
        
        const activeQuiz = localStorage.getItem('activeQuiz');
        if (activeQuiz === category) {
            const newActive = Object.keys(allQuizzes)[0];
            setActiveQuiz(newActive);
        }
        
        loadQuizList();
        showUploadStatus(`"${category}" quiz deleted.`, 'info');
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
    
    downloadCSV(csv, `quiz_${category}_${getCurrentDate()}.csv`);
}

function exportDetailedResults() {
    const results = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
    
    if (results.length === 0) {
        alert('No results to export.');
        return;
    }
    
    if (typeof XLSX !== 'undefined') {
        exportExcelWithFormatting(results);
    } else {
        exportCSVWithFormatting(results);
    }
}

function exportExcelWithFormatting(results) {
    try {
        const wb = XLSX.utils.book_new();
        const ws_data = [];
        
        const headers = ['Timestamp', 'Score', 'Employee ID', 'Employee Name', 'Score %'];
        
        if (results.length > 0) {
            const firstResult = results[0];
            const quizData = getQuizDataForResult(firstResult);
            quizData.forEach((q, index) => {
                headers.push(q.question);
            });
        }
        
        ws_data.push(headers);
        
        results.forEach(result => {
            const quizData = getQuizDataForResult(result);
            const scorePercent = Math.round(result.percentage);
            
            const row = [
                new Date(result.timestamp).toLocaleString(),
                `${result.score}/${result.total}`,
                result.employeeId,
                result.employeeName,
                `${scorePercent}%`
            ];
            
            result.answers.forEach((answer, index) => {
                const question = quizData[index];
                if (question) {
                    const answerText = answer === null ? 'Skipped' : question.options[answer];
                    const isWrong = answer !== null && answer !== question.correct;
                    row.push(isWrong ? `*${answerText}` : answerText);
                } else {
                    row.push('N/A');
                }
            });
            
            ws_data.push(row);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        
        if (!ws['!conditionalFormats']) ws['!conditionalFormats'] = [];
        
        if (results.length > 0) {
            const firstResult = results[0];
            const quizData = getQuizDataForResult(firstResult);
            quizData.forEach((_, index) => {
                const col = XLSX.utils.encode_col(5 + index);
                ws['!conditionalFormats'].push({
                    ref: `${col}2:${col}${results.length + 1}`,
                    rules: [
                        {
                            type: 'containsText',
                            operator: 'containsText',
                            text: '*',
                            style: { fill: { fgColor: { rgb: 'FFCCCC' } }, font: { color: { rgb: 'FF0000' } } }
                        }
                    ]
                });
            });
        }
        
        XLSX.utils.book_append_sheet(wb, ws, 'Results');
        XLSX.writeFile(wb, `detailed_results_${getCurrentDate()}.xlsx`);
        
    } catch (error) {
        console.error('Excel export failed:', error);
        exportCSVWithFormatting(results);
    }
}

function exportCSVWithFormatting(results) {
    let csv = 'Timestamp,Score,Employee ID,Employee Name';
    
    if (results.length > 0) {
        const firstResult = results[0];
        const quizData = getQuizDataForResult(firstResult);
        quizData.forEach((q, index) => {
            csv += `,"${q.question}"`;
        });
    }
    
    csv += ',Score %\n';
    
    results.forEach(result => {
        const quizData = getQuizDataForResult(result);
        const scorePercent = Math.round(result.percentage);
        
        let row = `"${new Date(result.timestamp).toLocaleString()}","${result.score}/${result.total}","${result.employeeId}","${result.employeeName}"`;
        
        result.answers.forEach((answer, index) => {
            const question = quizData[index];
            if (question) {
                const answerText = answer === null ? 'Skipped' : question.options[answer];
                const isWrong = answer !== null && answer !== question.correct;
                row += `,"${isWrong ? 'WRONG: ' + answerText : answerText}"`;
            } else {
                row += ',"N/A"';
            }
        });
        
        row += `,"${scorePercent}%"`;
        csv += row + '\n';
    });
    
    downloadCSV(csv, `detailed_results_${getCurrentDate()}.csv`);
}

function getQuizDataForResult(result) {
    if (result.quizData && result.quizData.length > 0) {
        return result.quizData;
    } else if (result.quiz && allQuizzes[result.quiz]) {
        return allQuizzes[result.quiz];
    } else if (currentQuizData && currentQuizData.length > 0) {
        return currentQuizData;
    } else {
        return defaultQuizData;
    }
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

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
    
    if (index >= results.length) {
        console.error('Invalid result index:', index);
        return;
    }
    
    const result = results[index];
    const quizData = getQuizDataForResult(result);
    
    const modalContent = document.getElementById('modalContent');
    
    let detailsHTML = `
        <div class="result-details">
            <div class="detail-item"><strong>Employee ID:</strong> ${result.employeeId || 'N/A'}</div>
            <div class="detail-item"><strong>Name:</strong> ${result.employeeName || 'N/A'}</div>
            <div class="detail-item"><strong>Score:</strong> ${result.score || 0}/${result.total || 0}</div>
            <div class="detail-item"><strong>Percentage:</strong> ${result.percentage || 0}%</div>
            <div class="detail-item"><strong>Quiz Category:</strong> ${result.quiz || 'Not specified'}</div>
            <div class="detail-item"><strong>Date:</strong> ${result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}</div>
            <div class="detail-item"><strong>Status:</strong> <span class="${(result.percentage || 0) >= 60 ? 'status-pass' : 'status-fail'}">${(result.percentage || 0) >= 60 ? 'PASSED' : 'FAILED'}</span></div>
    `;
    
    if (result.answers && Array.isArray(result.answers) && quizData.length > 0) {
        detailsHTML += `<h3 style="margin-top: 20px;">Question-wise Analysis:</h3>`;
        
        result.answers.forEach((answer, qIndex) => {
            const question = quizData[qIndex];
            
            if (!question) {
                detailsHTML += `
                    <div class="question-detail" style="border-left-color: #6c757d">
                        <strong>Q${qIndex + 1}:</strong> Question data not available<br>
                        <span class="answer-skipped"><strong>Selected:</strong> ${answer === null ? 'Skipped' : 'Option ' + (answer + 1)}</span><br>
                        <strong>Status:</strong> <span class="status-skipped">DATA UNAVAILABLE</span>
                    </div>
                `;
                return;
            }
            
            const isCorrect = answer === question.correct;
            const answerText = answer === null ? 'Skipped' : question.options[answer];
            const correctAnswer = question.options[question.correct];
            const status = answer === null ? 'skipped' : (isCorrect ? 'correct' : 'wrong');
            
            detailsHTML += `
                <div class="question-detail" style="border-left-color: ${getStatusColor(status)}">
                    <strong>Q${qIndex + 1}:</strong> ${question.question}<br>
                    <span class="answer-${status}"><strong>Selected:</strong> ${answerText}</span><br>
                    <span class="answer-correct"><strong>Correct Answer:</strong> ${correctAnswer}</span><br>
                    <strong>Status:</strong> <span class="status-${status}">${status.toUpperCase()}</span>
                </div>
            `;
        });
    } else {
        detailsHTML += `
            <div style="margin-top: 20px; padding: 15px; background: #f8d7da; color: #721c24; border-radius: 5px;">
                <strong>Data Issue:</strong> Quiz data is missing for this result.
            </div>
        `;
    }
    
    detailsHTML += `</div>`;
    modalContent.innerHTML = detailsHTML;
    document.getElementById('resultModal').style.display = 'block';
}

function getStatusColor(status) {
    switch(status) {
        case 'correct': return '#28a745';
        case 'wrong': return '#dc3545';
        case 'skipped': return '#6c757d';
        default: return '#667eea';
    }
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
    if (confirm('Delete this result?')) {
        const results = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
        results.splice(index, 1);
        localStorage.setItem('allQuizResults', JSON.stringify(results));
        loadAllResults();
    }
}

function clearAllResults() {
    if (confirm('Delete ALL results?')) {
        localStorage.removeItem('allQuizResults');
        loadAllResults();
    }
}

function exportToCSV() {
    exportDetailedResults();
}
