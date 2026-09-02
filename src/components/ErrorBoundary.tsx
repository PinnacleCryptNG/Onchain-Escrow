import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Key, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('onchain_escrow_privy_app_id');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isPrivyError =
        this.state.error?.message?.toLowerCase().includes('privy') ||
        this.state.error?.message?.toLowerCase().includes('app id') ||
        this.state.error?.stack?.toLowerCase().includes('privy');

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Application Recovery</h2>
                <p className="text-xs text-slate-400">
                  {isPrivyError ? 'Privy Authentication Configuration Notice' : 'A runtime error occurred in preview'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-auto max-h-36">
              {this.state.error?.message || 'Unknown error'}
            </div>

            {isPrivyError && (
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-blue-300">
                  <Shield className="w-4 h-4" />
                  <span>Configuring Privy App ID:</span>
                </div>
                <p>
                  To use Privy authentication in your live deployment, grab your free App ID from{' '}
                  <a
                    href="https://dashboard.privy.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-400 hover:text-blue-300"
                  >
                    dashboard.privy.io
                  </a>{' '}
                  and set <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">VITE_PRIVY_APP_ID</code> in <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">.env</code>.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleReset}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Reset Saved State
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
