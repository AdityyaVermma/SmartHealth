const isLocal = window.location.hostname === 'localhost';
export const API_URL = isLocal ? 'http://localhost:5000' : 'https://smart-health-api.onrender.com'; // Adjust prod URL as needed
