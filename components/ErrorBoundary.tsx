
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            const isEnvError = this.state.error?.message.includes('API key') ||
                this.state.error?.message.includes('Supabase');

            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>

                        {isEnvError ? (
                            <div className="space-y-4">
                                <p className="text-zinc-400">
                                    It looks like there's a configuration issue with the application environment.
                                </p>
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-left text-xs font-mono text-yellow-400 overflow-auto">
                                    MISSING ENVIRONMENT VARIABLES
                                </div>
                                <p className="text-sm text-zinc-500">
                                    If you are the developer, please check your Vercel Project Settings and ensure all variables from .env are added.
                                </p>
                            </div>
                        ) : (
                            <p className="text-zinc-400 mb-6">
                                An unexpected error occurred while loading the application.
                            </p>
                        )}

                        {this.state.error && (
                            <div className="mt-6 p-4 bg-black/50 rounded-xl border border-zinc-800 text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-400">{this.state.error.toString()}</p>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-8 flex items-center justify-center w-full px-4 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
