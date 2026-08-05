import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
    console.error("Uncaught error in ASTER MD:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-slate-950 text-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-rose-300">Rendering Exception Caught</h2>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            A component encountered an unexpected error while processing this document. You can try refreshing the canvas.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-left font-mono text-[11px] text-slate-400 max-w-lg overflow-x-auto mb-6 w-full">
            {this.state.error?.toString() || "Unknown error"}
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-rose-950/40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Renderer</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
