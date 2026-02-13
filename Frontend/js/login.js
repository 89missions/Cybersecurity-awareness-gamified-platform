const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

// Password Visibility Toggle
togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.textContent = type === 'password' ? 'Show' : 'Hide';
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.classList.add('hidden');

    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, password }),
            credentials: 'include' // cookie is here, this contains the tokens
        });
        messageDiv.classList.remove('hidden');

        if (response.ok) {
            messageDiv.textContent = "Access Granted. Redirecting...";
            messageDiv.className = "success";

            setTimeout(() => {
                window.location.href = './dashboard.html';
            }, 1500);
        } else {
            messageDiv.textContent = "Invalid username or password."; 
            messageDiv.className = "error";
        }
    } catch (error) {
        messageDiv.classList.remove('hidden');
        messageDiv.textContent = "Server offline.";
        messageDiv.className = "error";
    }
});