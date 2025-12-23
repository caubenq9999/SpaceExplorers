import { RefreshCw, Home, Trophy } from "lucide-react";

interface GameOverProps {
    score: number;
    onRetry: () => void;
    onMenu: () => void;
}

export function GameOver({ score, onRetry, onMenu }: GameOverProps) {
    return (
        <div className="min-h-screen bg-black/90 flex items-center justify-center p-4 z-50 absolute inset-0">
            <div className="bg-slate-900 border-4 border-red-600 p-10 rounded-xl shadow-2xl shadow-red-900/50 max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-300">

                <div className="space-y-2">
                    <h2 className="pixel-text-title text-5xl text-red-500 tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">GAME OVER</h2>
                </div>

                <div className="py-6 space-y-4">
                    <p className="text-gray-400 pixel-text-medium text-lg">FINAL SCORE</p>
                    <div className="flex items-center justify-center gap-3 text-yellow-400">
                        <Trophy className="w-8 h-8" />
                        <span className="pixel-text-large text-4xl">{score}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={onRetry}
                        className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-500 border-2 border-purple-300 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                        <span className="pixel-text-button text-lg">TRY AGAIN</span>
                    </button>

                    <button
                        onClick={onMenu}
                        className="w-full px-6 py-4 bg-gray-700 hover:bg-gray-600 border-2 border-gray-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        <span className="pixel-text-button text-lg">MAIN MENU</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
