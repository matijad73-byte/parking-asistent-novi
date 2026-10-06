import React, { ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07111e] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0c192c] border border-blue-900/60 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Došlo je do greške pri učitavanju</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aplikacija je naišla na problem sa lokalnim podacima ili kešom u pretraživaču.
              </p>
              {this.state.error?.message && (
                <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-left text-[11px] text-red-200 font-mono overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Osveži aplikaciju</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-98 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/60 transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Resetuj keš i otvori ponovo</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
