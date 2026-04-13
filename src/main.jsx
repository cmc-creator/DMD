import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Root-level safety net: catches any crash in App and shows a recovery screen
// instead of a completely blank page.
class AppErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[AppError]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: '#C9A84C', marginBottom: '1rem', fontSize: '1.5rem' }}>Dashboard failed to load</h1>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>An unexpected error occurred. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#C9A84C', color: '#0f172a', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
          >Refresh Page</button>
          <details style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.75rem', maxWidth: '600px', width: '100%' }}>
            <summary style={{ cursor: 'pointer' }}>Error details</summary>
            <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>{this.state.error.toString()}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
