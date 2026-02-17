document.addEventListener('DOMContentLoaded', async () => {
    const log = document.getElementById('activityLog');

    try {
        // Fetch user stats
        const response = await fetch('http://localhost:3000/user-stats', {
            method: 'GET',
            credentials: 'include' 
        });

        if (response.ok) {
            const data = await response.json();
            
            // 1. Identity & Initials
            document.getElementById('agentName').textContent = data.username;
            document.getElementById('avatarInitials').textContent = data.username.substring(0, 2).toUpperCase();
            
            // 2. Core Stats
            document.getElementById('scoreVal').textContent = (data.points || 0).toLocaleString();
            document.getElementById('modulesVal').textContent = `${data.completedModules || 0} / ${data.totalModules || 10}`;
            document.getElementById('badgeCount').textContent = data.badges ? data.badges.length : 0;
            
            // 3. XP Progress
            const xpValue = data.xpPercent || 0;
            document.getElementById('xpPercentText').textContent = `${xpValue}%`;
            setTimeout(() => {
                document.getElementById('xpFill').style.width = `${xpValue}%`;
            }, 500);

            // 4. Badge Rendering
            const shelf = document.getElementById('badgeShelf');
            if (data.badges && data.badges.length > 0) {
                shelf.innerHTML = data.badges.map(b => `<div class="badge-item">🏅 ${b}</div>`).join('');
            } else {
                shelf.innerHTML = '<p style="color: #475569; font-size: 0.8rem;">Complete your first training module to earn a badge.</p>';
            }

            // 5. Log welcome message
            log.innerHTML += `<p class="log-entry success">> Welcome, Agent ${data.username}. Status: Operational.</p>`;

            // 6. LOAD MODULES (NEW)
            await loadModules();

        } else {
            log.innerHTML += `<p class="log-entry error">> Authentication Expired. Terminating session...</p>`;
            setTimeout(() => window.location.href = 'login.html', 2000);
        }
    } catch (err) {
        log.innerHTML += `<p class="log-entry error">> Critical Error: Failed to sync with Command Center.</p>`;
        console.error("Dashboard Error:", err);
    }
});

// NEW FUNCTION: Load modules from backend
async function loadModules() {
    const modulesContainer = document.getElementById('modulesContainer');
    const log = document.getElementById('activityLog');
    
    try {
        const response = await fetch('http://localhost:3000/module', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load modules');
        }

        const data = await response.json();
        
        // FIXED: Your backend returns { "allmodules": [...] }
        let modules = [];
        
        if (data.allmodules && Array.isArray(data.allmodules)) {
            modules = data.allmodules;  // ✅ This is your format
        } else if (Array.isArray(data)) {
            modules = data;
        } else {
            console.error('Unexpected modules format:', data);
            modules = [];
        }
        
        if (modules.length === 0) {
            modulesContainer.innerHTML = '<p style="color: var(--text-dim); text-align: center;">No training modules available</p>';
            return;
        }

        // Render modules
        modulesContainer.innerHTML = modules.map(module => {
            const moduleId = module.id || module._id;
            const moduleName = module.name || 'Training Module';
            const moduleDesc = module.description || 'Cybersecurity awareness training module';
            const moduleIcon = module.icon || '📘';
            
            const progress = Math.floor(Math.random() * 100);
            
            return `
            <a href="quiz.html?moduleId=${moduleId}" class="module-card">
                <div class="module-icon">${moduleIcon}</div>
                <div class="module-name">${moduleName}</div>
                <div class="module-desc">${moduleDesc.substring(0, 80)}${moduleDesc.length > 80 ? '...' : ''}</div>
                <div class="module-meta">
                    <span>10 questions</span>
                </div>
            </a>
        `;
        }).join('');

        log.innerHTML += `<p class="log-entry success">> Loaded ${modules.length} training modules</p>`;

    } catch (error) {
        console.error('Error loading modules:', error);
        modulesContainer.innerHTML = `
            <div style="color: #ef4444; text-align: center; padding: 2rem; background: var(--glass); border-radius: 12px;">
                ⚠️ Failed to load modules. Check connection.<br>
                <small style="color: var(--text-dim);">${error.message}</small>
            </div>
        `;
    }
}
   

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    document.cookie = 'accessToken=; Max-Age=0; path=/; domain=localhost';
    document.cookie = 'refreshToken=; Max-Age=0; path=/; domain=localhost';
    window.location.href = 'login.html';
});