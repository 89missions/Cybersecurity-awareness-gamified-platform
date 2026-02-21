//your own
const config = {
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://cybersecurity-awareness-gamified-platform.onrender.com'
};
window.appConfig = config;