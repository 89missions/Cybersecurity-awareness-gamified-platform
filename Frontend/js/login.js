document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('message');
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;

    // Start Loading State
    btn.classList.add('loading');
    btn.disabled = true;
    msg.classList.add('hidden');

    try {
        const response = await fetch(`${window.appConfig.API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: user, password: pass }),
            credentials:'include'
        });

        btn.classList.remove('loading');
        msg.classList.remove('hidden');

        if (response.ok) {
            msg.className = 'success';
            msg.textContent = "Access Granted! Synchronizing...";
            // Redirect to the dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            btn.disabled = false;
            msg.className = 'error';
            msg.textContent = data.message || "Invalid credentials.";
        }
    } catch (error) {
        btn.classList.remove('loading');
        btn.disabled = false;
        msg.classList.remove('hidden');
        msg.className = 'error';
        msg.textContent = "Authentication server offline.";
    }
});