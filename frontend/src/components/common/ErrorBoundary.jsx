import React from 'react';
import { RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-warmwhite px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <RefreshCcw size={26} />
            </div>
            <h1 className="text-2xl font-semibold text-charcoal-800">Something went wrong</h1>
            <p className="mt-2 text-charcoal-400">
              An unexpected error interrupted this page. Your data is safe — reloading usually fixes it.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 font-medium text-white shadow-soft transition hover:bg-brand-700"
            >
              Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
