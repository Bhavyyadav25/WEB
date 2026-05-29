/**
 * API Configuration
 * Update BACKEND_URL after deploying to Railway
 */
const CONFIG = {
  // RENDER backend URL
  BACKEND_URL: "https://bhavyyadav25-github-io.onrender.com",

  // API endpoints
  API: {
    contact: "/api/contact",
    chat: "/api/chat",
    health: "/api/health",
  },
}

// Helper to get full API URL
function getApiUrl(endpoint) {
    return CONFIG.BACKEND_URL + CONFIG.API[endpoint];
}
