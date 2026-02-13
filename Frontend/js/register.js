const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

// 1. Password Visibility Toggle Logic
togglePassword.addEventListener('click', () => {
    // Toggle the type attribute
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle the button text
    togglePassword.textContent = type === 'password' ? 'Show' : 'Hide';
});

// 2. Registration Form Submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset message state
    messageDiv.classList.add('hidden');
    messageDiv.textContent = "";

    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;

    try {
        // Updated to port 3500 as per your server config
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, password })
        });

        const data = await response.json();

        // Show the message div
        messageDiv.classList.remove('hidden');

        if (response.ok) {
            messageDiv.textContent = data.message || "Registration Successful! Enlisting...";
            messageDiv.className = "success";
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = './login.html';
            }, 2000);
        } else {
            messageDiv.textContent = data.message || "Registration Failed";
            messageDiv.className = "error";
        }
    } catch (error) {
        messageDiv.classList.remove('hidden');
        messageDiv.textContent = "Cannot connect to server. Is it running on port 3500?";
        messageDiv.className = "error";
    }
});