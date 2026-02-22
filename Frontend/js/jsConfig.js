const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const config = {
  API_BASE_URL: isLocal
    ? 'http://localhost:3000'
    : 'https://cybersecurity-awareness-gamified-platform.onrender.com'
};

// Make it available globally
window.appConfig = config;