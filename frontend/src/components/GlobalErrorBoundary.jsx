import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    color: '#ff6b6b',
                    background: '#0a0e17',
                    height: '100vh',
                    fontFamily: 'monospace',
                    overflow: 'auto'
                }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Application Crashed</h1>
                    <div style={{ background: 'rgba(255,0,0,0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #ff6b6b' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>{this.state.error && this.state.error.toString()}</h2>
                        <pre style={{ whiteSpace: 'pre-wrap', opacity: 0.8 }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
