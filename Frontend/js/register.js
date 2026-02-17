document.getElementById('registerForm').addEventListener('submit', async (e) => {
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
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: user, password: pass })
        });

        const data = await response.json();
        btn.classList.remove('loading');
        msg.classList.remove('hidden');

        if (response.ok) {
            msg.className = 'success';
            msg.textContent = "Registration Successful! Enlisting agent...";
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            btn.disabled = false;
            msg.className = 'error';
            msg.textContent = data.message || "Registration failed.";
        }
    } catch (error) {
        btn.classList.remove('loading');
        btn.disabled = false;
        msg.classList.remove('hidden');
        msg.className = 'error';
        msg.textContent = "Cannot connect to the server terminal.";
    }
});