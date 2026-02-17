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
        answers: [null, null, null, null, null],
        totalPoints: 0,
        username: '',
        moduleId: new URLSearchParams(window.location.search).get('moduleId')
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
        
        // 3. Load questions
        await loadQuestions(state, elements);
        
        // 4. Start quiz
        renderQuestion(state, elements);
        
    } catch (error) {
        handleError(error, elements);
    }
});

// ========== HELPER FUNCTIONS ==========

async function loadUserData(elements, state) {
    const response = await fetch('http://localhost:3000/user-stats', {
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

async function loadQuestions(state, elements) {
    elements.log.innerHTML += `<p class="log-entry">> Loading questions...</p>`;
    
    const questionsResponse = await fetch(`http://localhost:3000/questions/${state.moduleId}`, {
        method: 'GET',
        credentials: 'include'
    });

    if (!questionsResponse.ok) {
        throw new Error('Failed to load questions');
    }

    const questionsData = await questionsResponse.json();
    state.questions = questionsData.allQuestions || []; 
    
    elements.log.innerHTML += `<p class="log-entry success">> ${state.questions.length} questions loaded</p>`;
    return state.questions;
}

function renderQuestion(state, elements) {
    const { questions, currentBatch, currentQIndex, answers } = state;
    const startIdx = currentBatch * 5;
    const batchQuestions = questions.slice(startIdx, startIdx + 5);
    
    if (batchQuestions.length === 0) {
        showCompletion(state, elements);
        return;
    }

    const question = batchQuestions[currentQIndex];
    const qNumber = startIdx + currentQIndex + 1;
    const totalQs = Math.min(questions.length, 10);

    // Update progress
    elements.progressText.textContent = `${qNumber}/${totalQs}`;
    elements.progressBar.style.width = `${(qNumber / totalQs) * 100}%`;

    // Build HTML
    elements.questionArea.innerHTML = getQuestionHTML(question, currentQIndex, answers, currentBatch);
    elements.navButtons.innerHTML = getNavButtonsHTML(state);

    // Attach option listeners
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.answers[currentQIndex] = parseInt(btn.dataset.index);
            renderQuestion(state, elements);
        });
    });
}

function getQuestionHTML(question, qIndex, answers, batchNum) {
    const letters = ['A', 'B', 'C', 'D'];
    const options = question.options || {};
    const selected = answers[qIndex];
    
    let optionsHtml = '';
    for (let i = 0; i < 4; i++) {
        const letter = letters[i];
        const optionText = options[letter]?.text || options[i]?.text || options[letter] || options[i] || '';
        const isSelected = selected === i ? 'selected' : '';
        
        optionsHtml += `
            <button class="option-btn ${isSelected}" data-index="${i}">
                <span class="option-prefix">${letter}</span>
                ${optionText}
            </button>
        `;
    }

    let explanationHtml = '';
    if (selected !== null) {
        const isCorrect = options[letters[selected]]?.isCorrect || options[selected]?.isCorrect;
        const reason = options[letters[selected]]?.reason || options[selected]?.reason || 'No explanation';
        
        explanationHtml = `
            <div class="explanation-box">
                <strong>${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}</strong>
                ${reason}
            </div>
        `;
    }

    return `
        <div class="batch-indicator">BATCH ${batchNum + 1}/2 • Q${qIndex + 1}/5</div>
        <div class="question-card">
            <div class="question-text">${question.question}</div>
            <div class="options-grid">${optionsHtml}</div>
            ${explanationHtml}
        </div>
    `;
}

function getNavButtonsHTML(state) {
    const { currentBatch, currentQIndex, answers } = state;
    const isLastInBatch = currentQIndex === 4;
    const isLastBatch = currentBatch === 1;

    let buttons = `
        <button class="quiz-nav-btn" 
            onclick="window.prevQuestion()" 
            ${currentQIndex === 0 ? 'disabled' : ''}>
            ← PREVIOUS
        </button>
    `;

    if (isLastInBatch) {
        buttons += `
            <button class="quiz-nav-btn primary" onclick="window.submitBatch()">
                ${isLastBatch ? 'COMPLETE' : 'SUBMIT BATCH →'}
            </button>
        `;
    } else {
        buttons += `
            <button class="quiz-nav-btn primary" 
                onclick="window.nextQuestion()" 
                ${answers[currentQIndex] === null ? 'disabled' : ''}>
                NEXT →
            </button>
        `;
    }

    return buttons;
}

// Global navigation functions
window.nextQuestion = function() {
    console.log('Next question clicked');
    const state = window.quizState;
    const elements = window.quizElements;
    
    if (state && state.currentQIndex < 4) {
        state.currentQIndex++;
        renderQuestion(state, elements);
    }
};

window.prevQuestion = function() {
    console.log('Previous question clicked');
    const state = window.quizState;
    const elements = window.quizElements;
    
    if (state && state.currentQIndex > 0) {
        state.currentQIndex--;
        renderQuestion(state, elements);
    }
};

window.submitBatch = async function() {
    console.log('Submit batch clicked');
    const state = window.quizState;
    const elements = window.quizElements;
    
    if (!state) {
        console.error('No quiz state found');
        return;
    }

    // Calculate points
    const startIdx = state.currentBatch * 5;
    const batchQuestions = state.questions.slice(startIdx, startIdx + 5);
    let points = 0;
    
    for (let i = 0; i < 5; i++) {
        if (state.answers[i] === null) continue;
        
        const q = batchQuestions[i];
        const options = q.options || {};
        const letters = ['A', 'B', 'C', 'D'];
        const selected = state.answers[i];
        
        const isCorrect = options[letters[selected]]?.isCorrect || options[selected]?.isCorrect;
        if (isCorrect) points += 50;
    }

    try {
        const response = await fetch('http://localhost:3000/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ points })
        });

        if (!response.ok) throw new Error('Submission failed');

        const result = await response.json();
        state.totalPoints += points;
        elements.log.innerHTML += `<p class="log-entry success">> +${points} points earned</p>`;
        console.log('Submission successful:', result);

        if (state.currentBatch === 0 && state.questions.length >= 10) {
            // Next batch
            state.currentBatch = 1;
            state.currentQIndex = 0;
            state.answers = [null, null, null, null, null];
            renderQuestion(state, elements);
        } else {
            // Complete
            showCompletion(state, elements);
        }
    } catch (error) {
        console.error('Submit error:', error);
        elements.log.innerHTML += `<p class="log-entry error">> Submission failed: ${error.message}</p>`;
    }
};

function showCompletion(state, elements) {
    elements.progressText.textContent = '10/10';
    elements.progressBar.style.width = '100%';
    
    elements.questionArea.innerHTML = `
        <div class="score-summary">
            <div class="score-value">+${state.totalPoints}</div>
            <div class="score-message">Module Complete!</div>
            <button class="quiz-nav-btn primary" onclick="window.location.href='dashboard.html'">
                RETURN TO DASHBOARD
            </button>
        </div>
    `;
    
    elements.navButtons.innerHTML = '';
    elements.log.innerHTML += `<p class="log-entry success">> Total earned: ${state.totalPoints}</p>`;
}

function handleError(error, elements) {
    console.error('Quiz error:', error);
    elements.log.innerHTML += `<p class="log-entry error">> Error: ${error.message}</p>`;
    elements.questionArea.innerHTML = `
        <div class="panel" style="text-align: center; padding: 2rem;">
            <h3>⚠️ Failed to Load</h3>
            <button onclick="window.location.href='dashboard.html'" class="quiz-nav-btn primary">
                BACK TO DASHBOARD
            </button>
        </div>
    `;
}