class WebSocketService {
  constructor() {
    this.ws = null;
    const defaultWsUrl = import.meta.env.PROD
      ? 'wss://smart-livestock-backend-98l7.onrender.com/ws/telemetry'
      : 'ws://localhost:8085/ws/telemetry';
    this.url = import.meta.env.VITE_WS_URL || defaultWsUrl;
    this.reconnectInterval = 5000;
    this.shouldReconnect = true;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    console.log('Connecting to WebSocket server:', this.url);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Successfully connected to real-time WebSocket server!');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach((listener) => listener(data));
      } catch (e) {
        console.warn('Received invalid WebSocket payload:', event.data, e);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed.');
      if (this.shouldReconnect) {
        console.log(`Attempting to reconnect in ${this.reconnectInterval / 1000}s...`);
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket connection encountered an error:', error);
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
