import { Play, Home } from "lucide-react";

interface PauseMenuProps {
    onResume: () => void;
    onQuit: () => void;
}

export function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-slate-900 border-4 border-cyan-500 p-8 rounded-lg shadow-2xl shadow-cyan-500/20 max-w-sm w-full text-center space-y-6">
                <h2 className="pixel-text-title text-3xl text-cyan-400 tracking-wider">PAUSED</h2>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={onResume}
                        className="group relative px-6 py-3 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-300 transition-all active:scale-95 text-white"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Play className="w-5 h-5 fill-current" />
                            <span className="pixel-text-button">RESUME</span>
                        </div>
                    </button>

                    <button
                        onClick={onQuit}
                        className="group relative px-6 py-3 bg-red-600 hover:bg-red-500 border-2 border-red-300 transition-all active:scale-95 text-white"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Home className="w-5 h-5" />
                            <span className="pixel-text-button">MAIN MENU</span>
                        </div>
                    </button>
                </div>

                <p className="text-gray-400 text-sm pixel-text">Press 'P' or 'ESC' to Resume</p>
            </div>
        </div>
    );
}
