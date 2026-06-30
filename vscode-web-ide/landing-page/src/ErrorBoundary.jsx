import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#222', color: '#fff', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>React App Crashed!</h2>
          <p style={{ color: '#ff5555' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ background: '#000', padding: '20px', overflowX: 'auto' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
