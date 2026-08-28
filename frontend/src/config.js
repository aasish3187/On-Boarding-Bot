export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : 'https://on-boarding-bot-1.onrender.com')
).replace(/\/+$/, '');

// Generate corresponding WebSocket URL automatically (ws:// or wss://)
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

