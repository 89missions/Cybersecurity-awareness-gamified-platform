
document.addEventListener('DOMContentLoaded', async () => {
    // DOM elements
    const elements = {
        log: document.getElementById('activityLog'),
        questionArea: document.getElementById('questionArea'),
        navButtons: document.getElementById('navButtons'),
        moduleIcon: document.getElementById('moduleIcon'),
        moduleTitle: document.getElementById('moduleTitle'),
        progressText: document.getElementById('quizProgressText'),
        progressBar: document.getElementById('quizProgressBar'),
        agentName: document.getElementById('agentName'),
        avatarInitials: document.getElementById('avatarInitials')
    };

    // Quiz state
    const state = {
        questions: [],
        currentBatch: 0,
        currentQIndex: 0,
        answers: [],
        totalPoints: 0,
        username: '',
        moduleId: new URLSearchParams(window.location.search).get('moduleId'),
        currentPage: 1,
        totalAvailableQuestions: 0
    };

    // Store globally for event access
    window.quizState = state;
    window.quizElements = elements;

    // Check module ID
    if (!state.moduleId) {
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        // 1. Authenticate and get user data
        await loadUserData(elements, state);
        
        // 2. Set module info
        setModuleInfo(state.moduleId, elements);
        
        // 3. Load questions (first 10 only)
        await loadQuestions(state, elements);
        
        // 4. Start quiz
        renderAllQuestions(state, elements);
        
    } catch (error) {
        handleError(error, elements);
    }
});

// ========== HELPER FUNCTIONS ==========

async function loadUserData(elements, state) {
    const response = await fetch(`${window.appConfig.API_BASE_URL}/user-stats`, {
        method: 'GET',
        credentials: 'include'
    });

    if (!response.ok) {
        window.location.href = 'login.html';
        return;
    }

    const data = await response.json();
    state.username = data.username;
    
    elements.agentName.textContent = data.username;
    elements.avatarInitials.textContent = data.username.substring(0, 2).toUpperCase();
    elements.log.innerHTML += `<p class="log-entry success">> Welcome, Agent ${data.username}</p>`;
}

function setModuleInfo(moduleId, elements) {
    const modules = {
        'Phishing101': { icon: '⚠️', title: 'Phishing Attacks' },
        'malware101': { icon: '🦠', title: 'Malware & Viruses' },
        'prevention101': { icon: '🛡️', title: 'Threat Prevention' }
    };
    
    const module = modules[moduleId] || { icon: '📘', title: 'Training Module' };
    elements.moduleIcon.textContent = module.icon;
    elements.moduleTitle.textContent = module.title;
}

// FIXED: Load only first 10 questions
async function loadQuestions(state, elements) {
    elements.log.innerHTML += `<p class="log-entry">> Loading questions...</p>`;
    
    const questionsResponse = await fetch(`${window.appConfig.API_BASE_URL}/questions/${state.moduleId}?page=1&limit=10`, {
        method: 'GET',
        credentials: 'include'
    });

    if (!questionsResponse.ok) {
        throw new Error('Failed to load questions');
    }

    const questionsData = await questionsResponse.json();
    const allQuestions = questionsData.allQuestions || [];
    
    // FIXED: Only take first 10 questions
    state.questions = allQuestions.slice(0, 10);
    state.answers = new Array(state.questions.length).fill(null);
    state.totalAvailableQuestions = allQuestions.length;
    state.currentPage = 1;
    
    elements.log.innerHTML += `<p class="log-entry success">> Loaded ${state.questions.length} of ${state.totalAvailableQuestions} questions</p>`;
    return state.questions;
}

function renderAllQuestions(state, elements) {
    const { questions, answers } = state;
    
    // Show all 10 questions at once
    let allQuestionsHtml = '';
    
    questions.forEach((question, index) => {
        allQuestionsHtml += renderSingleQuestion(question, index, answers[index]);
    });
    
    elements.questionArea.innerHTML = `
        <div class="all-questions-container">
            ${allQuestionsHtml}
        </div>
        <button class="quiz-nav-btn primary" onclick="window.submitAllAnswers()" id="submitAllBtn">
            SUBMIT ALL ANSWERS
        </button>
    `;
    
    // Progress starts at 0/10
    const answeredCount = answers.filter(a => a !== null).length;
    elements.progressText.textContent = `${answeredCount}/10`;
    elements.progressBar.style.width = `${(answeredCount/10)*100}%`;
    
    // Attach listeners to all option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const qIndex = parseInt(btn.dataset.qIndex);
            const optIndex = parseInt(btn.dataset.optIndex);
            state.answers[qIndex] = optIndex;
            
            // Update UI to show selected
            document.querySelectorAll(`[data-q-index="${qIndex}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
            
            // Update progress as user answers
            const newAnsweredCount = state.answers.filter(a => a !== null).length;
            elements.progressText.textContent = `${newAnsweredCount}/10`;
            elements.progressBar.style.width = `${(newAnsweredCount/10)*100}%`;
        });
    });
}

function renderSingleQuestion(question, index, selectedAnswer) {
    const letters = ['A', 'B', 'C', 'D'];
    const options = question.options || {};
    
    let optionsHtml = '';
    for (let i = 0; i < 4; i++) {
        const letter = letters[i];
        const optionText = options[letter]?.text || '';
        const isSelected = selectedAnswer === i ? 'selected' : '';
        
        optionsHtml += `
            <button class="option-btn ${isSelected}" data-q-index="${index}" data-opt-index="${i}">
                <span class="option-prefix">${letter}</span>
                ${optionText}
            </button>
        `;
    }
    
    return `
        <div class="question-card" data-q-index="${index}">
            <div class="question-header">
                <span class="question-number">Question ${index + 1}/10</span>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="options-grid">${optionsHtml}</div>
        </div>
    `;
}

// Submit function
window.submitAllAnswers = async function() {
    const state = window.quizState;
    const elements = window.quizElements;
    
    // Check if all questions answered
    if (state.answers.includes(null)) {
        alert('Please answer all questions before submitting');
        return;
    }
    
    // Calculate points
    let points = 0;
    const answersData = [];
    
    state.questions.forEach((q, index) => {
        const selected = state.answers[index];
        const letters = ['A', 'B', 'C', 'D'];
        const isCorrect = q.options[letters[selected]]?.isCorrect || false;
        if (isCorrect) points += 50;
        
        // Track for backend
        answersData.push({
            questionId: q.id || q._id,
            wasCorrect: isCorrect
        });
    });
    
    try {
        // Submit to backend
        const response = await fetch(`${window.appConfig.API_BASE_URL}/submit-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ 
                points,
                answers: answersData,
                moduleId: state.moduleId
            })
        });
        
        if (!response.ok) throw new Error('Submission failed');
        
        state.totalPoints += points;
        elements.log.innerHTML += `<p class="log-entry success">> +${points} points earned!</p>`;
        
        // Show results with explanations
        showResultsWithExplanations(state, elements);
        
    } catch (error) {
        console.error('Submit error:', error);
        elements.log.innerHTML += `<p class="log-entry error">> Submission failed: ${error.message}</p>`;
    }
};

function showResultsWithExplanations(state, elements) {
    const questionsWithAnswers = state.questions.map((q, index) => {
        const selected = state.answers[index];
        const letters = ['A', 'B', 'C', 'D'];
        
        // Find which option is correct
        let correctLetter = '';
        let correctText = '';
        let selectedLetter = letters[selected];
        let selectedText = q.options[letters[selected]]?.text || '';
        const isCorrect = q.options[letters[selected]]?.isCorrect || false;
        
        // Loop through options to find the correct one
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            if (q.options[letter]?.isCorrect) {
                correctLetter = letter;
                correctText = q.options[letter]?.text || '';
                break;
            }
        }
        
        const reason = q.options[letters[selected]]?.reason || 'No explanation available';
        
        // Build the result display
        return `
            <div class="question-card result-card ${isCorrect ? 'correct' : 'wrong'}">
                <div class="question-header">
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="result-badge ${isCorrect ? 'correct' : 'wrong'}">
                        ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}
                    </span>
                </div>
                <div class="question-text">${q.question}</div>
                
                <div class="selected-answer">
                    <strong>Your answer:</strong> ${selectedLetter}. ${selectedText}
                </div>
                
                ${!isCorrect ? `
                    <div class="correct-answer">
                        <strong>✅ Correct answer:</strong> ${correctLetter}. ${correctText}
                    </div>
                ` : ''}
                
                <div class="explanation-box">
                    <strong>Explanation:</strong> ${reason}
                </div>
            </div>
        `;
    }).join('');
    
    // Check if there are more questions available
    const hasMoreQuestions = (state.currentPage * 10) < state.totalAvailableQuestions;
    
    elements.questionArea.innerHTML = `
        <div class="results-container">
            <div class="score-banner">
                🎯 YOU EARNED ${state.totalPoints} POINTS
            </div>
            ${questionsWithAnswers}
            <div class="load-more-container">
                ${hasMoreQuestions ? 
                    `<button class="quiz-nav-btn primary" onclick="window.loadMoreQuestions()">
                        LOAD NEXT 10 QUESTIONS →
                    </button>` : 
                    `<p style="color: var(--text-dim);">You've completed all available questions!</p>`
                }
                <button class="quiz-nav-btn" onclick="window.location.href='dashboard.html'" style="margin-left: 1rem;">
                    BACK TO DASHBOARD
                </button>
            </div>
        </div>
    `;
}
// FIXED: Load next set of questions with pagination
window.loadMoreQuestions = async function() {
    const state = window.quizState;
    const elements = window.quizElements;
    
    elements.log.innerHTML += `<p class="log-entry">> Loading next questions...</p>`;
    
    try {
        const nextPage = state.currentPage + 1;
        const response = await fetch(`${window.appConfig.API_BASE_URL}/questions/${state.moduleId}?page=${nextPage}&limit=10`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to load more questions');
        
        const data = await response.json();
        const newQuestions = data.allQuestions || [];
        
        if (newQuestions.length === 0) {
            elements.log.innerHTML += `<p class="log-entry">> No more questions available.</p>`;
            return;
        }
        
        // Update state with new questions (only take first 10)
        state.questions = newQuestions.slice(0, 10);
        state.answers = new Array(state.questions.length).fill(null);
        state.currentPage = nextPage;
        
        // Re-render
        renderAllQuestions(state, elements);
        
        elements.log.innerHTML += `<p class="log-entry success">> Loaded ${state.questions.length} new questions</p>`;
        
    } catch (error) {
        console.error('Error loading more questions:', error);
        elements.log.innerHTML += `<p class="log-entry error">> Failed to load more questions: ${error.message}</p>`;
    }
};

function handleError(error, elements) {
    console.error('Quiz error:', error);
    elements.log.innerHTML += `<p class="log-entry error">> Error: ${error.message}</p>`;
    elements.questionArea.innerHTML = `
        <div class="panel" style="text-align: center; padding: 2rem;">
            <h3>⚠️ Failed to Load</h3>
            <p>${error.message}</p>
            <button onclick="window.location.href='dashboard.html'" class="quiz-nav-btn primary">
                BACK TO DASHBOARD
            </button>
        </div>
    `;
}