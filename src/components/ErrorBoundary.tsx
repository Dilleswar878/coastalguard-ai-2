import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CoastalGuard UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030a16] text-white flex items-center justify-center p-6 font-mono">
          <div className="max-w-md w-full bg-[#051428] border-2 border-pink-500 rounded p-6 text-center space-y-4 shadow-[0_0_30px_rgba(255,0,127,0.4)]">
            <div className="w-14 h-14 rounded-full bg-pink-950 border border-pink-500 flex items-center justify-center text-pink-400 mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-pink-400 font-bold uppercase tracking-widest">
                TELEMETRY RECOVERY EXCEPTION
              </div>
              <h1 className="font-display font-black text-xl text-white uppercase">
                SYSTEM SUBSYSTEM INTERRUPTED
              </h1>
              <p className="text-xs text-slate-300">
                A localized client interface error occurred. Incident data stored in browser memory remains intact.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/60 border border-slate-800 rounded text-left text-[11px] text-rose-300 overflow-x-auto max-h-32">
                <code>{this.state.error.message || 'Unknown error'}</code>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTORE SENTRY HUB</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
