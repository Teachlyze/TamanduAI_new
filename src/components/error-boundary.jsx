import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado!</h2>
          <p className="text-gray-600 mb-6">{this.state.error?.message || 'Ocorreu um erro inesperado.'}</p>
          <button onClick={this.handleReset} className="px-4 py-2 rounded border">Tentar novamente</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
