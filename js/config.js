/**
 * API Configuration
 * Update BACKEND_URL after deploying to Railway
 */
const CONFIG = {
    // Replace with your Railway backend URL after deployment
    // Example: https://your-app-name.up.railway.app
    BACKEND_URL: 'https://web-production-XXXX.up.railway.app',

    // API endpoints
    API: {
        contact: '/api/contact',
        chat: '/api/chat',
        health: '/api/health'
    }
};

// Helper to get full API URL
function getApiUrl(endpoint) {
    return CONFIG.BACKEND_URL + CONFIG.API[endpoint];
}
