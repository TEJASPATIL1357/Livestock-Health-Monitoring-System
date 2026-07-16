import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global crash intercepted:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#020617',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '64px', marginBottom: '16px' }}>🚜</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#ef4444' }}>
            System Recovery Mode
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '400px', marginBottom: '24px', lineHeight: '1.6' }}>
            The cooperative livestock database encountered a temporary loading error. Tap below to refresh and clear cache.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 28px',
              backgroundColor: '#22c55e',
              color: '#020617',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            Clear Cache & Restart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
