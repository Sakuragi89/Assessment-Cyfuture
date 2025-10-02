// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    loadAllResults();
    setupModal();
});

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
    
    // Sort by most recent first
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    resultsBody.innerHTML = results.map((result, index) => `
        <tr>
            <td>${result.employeeId}</td>
            <td>${result.employeeName}</td>
            <td>${result.score}/${result.total}</td>
            <td>${result.percentage}%</td>
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
                const isCorrect = answer === question.correct;
                const answerText = answer === null ? 'Skipped' : question.options[answer];
                const correctAnswer = question.options[question.correct];
                
                return `
                    <div class="question-detail" style="margin-bottom: 15px; padding: 10px; border-left: 4px solid ${isCorrect ? '#28a745' : '#dc3545'}; background: #f8f9fa;">
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
    
    let csv = 'Employee ID,Name,Score,Percentage,Status,Date\n';
    
    results.forEach(result => {
        const status = result.percentage >= 60 ? 'PASS' : 'FAIL';
        const date = new Date(result.timestamp).toLocaleString();
        csv += `"${result.employeeId}","${result.employeeName}","${result.score}/${result.total}","${result.percentage}%","${status}","${date}"\n`;
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

// Define quizData for the admin panel (same as in script.js)
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