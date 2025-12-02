import { Component } from 'react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1>Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-primary">
                Try Again
              </button>
              <button onClick={() => window.location.href = '/'} className="btn-secondary">
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
