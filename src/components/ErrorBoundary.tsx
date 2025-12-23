import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
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
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center text-center">
                    <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-xl text-white mb-4">We encountered an error loading the game.</p>
                    <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto max-w-2xl border border-red-900">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                        Reload Game
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
