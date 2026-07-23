export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Generate corresponding WebSocket URL automatically (ws:// or wss://)
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');
