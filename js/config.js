/**
 * API Configuration
 * Update BACKEND_URL after deploying to Railway
 */
const CONFIG = {
    // Railway backend URL
    BACKEND_URL: 'https://web-production-f618.up.railway.app',

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
