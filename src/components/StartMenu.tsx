import { Rocket, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import instructionImage from "../assets/instruction.png";

interface StartMenuProps {
    onStartGame: () => void;
    onOpenShop: () => void;
}

export function StartMenu({ onStartGame, onOpenShop }: StartMenuProps) {
    const [showInstructions, setShowInstructions] = useState(true);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Scrolling space background - slower for lobby */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(100)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.3,
                            animation: `scrollDown ${40 + Math.random() * 20}s linear infinite`,
                            animationDelay: `${Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>

            {/* Larger animated stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.4 + 0.2,
                            animation: `scrollDown ${30 + Math.random() * 15}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main content - Fixed height container matching game */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-md w-full" style={{ height: '550px' }}>
                {/* Logo/Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-50 animate-pulse" />
                    <Rocket className="w-24 h-24 text-cyan-400 relative z-10" strokeWidth={1.5} />
                </div>

                {/* Title with floating and neon glow animation */}
                <div className="text-center space-y-2" style={{ animation: 'floatTitle 3s ease-in-out infinite' }}>
                    <h1 className="pixel-text-title text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" style={{ animation: 'neonGlow 2s ease-in-out infinite' }}>
                        SPACE
                    </h1>
                    <h1 className="pixel-text-title text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400" style={{ animation: 'neonGlow 2s ease-in-out infinite 0.5s' }}>
                        EXPLORER
                    </h1>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-4 w-full">
                    <button
                        onClick={onStartGame}
                        className="group relative w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 border-4 border-cyan-400 shadow-lg shadow-cyan-400/50 hover:shadow-cyan-400/80 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                        <span className="pixel-text-button text-white relative z-10 text-xl tracking-wider">START GAME</span>
                    </button>

                    <button
                        onClick={onOpenShop}
                        className="group relative w-full py-3 bg-yellow-600 hover:bg-yellow-500 transition-all duration-300 border-4 border-yellow-400 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/50"
                    >
                        <ShoppingBag className="w-5 h-5 text-white" />
                        <span className="pixel-text-button text-white relative z-10 tracking-widest">SHOP</span>
                    </button>
                </div>

                {/* Footer controls hint */}
                <div className="mt-8 text-center bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-cyan-300/60 text-sm pixel-text mb-2">PC CONTROLS</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left text-xs text-indigo-200/50 pixel-text">
                        <span>WASD / ARROWS</span><span>:: MOVE</span>
                        <span>SPACE</span><span>:: SHOOT</span>
                        <span>Q</span><span>:: SWITCH WEAPON</span>
                        <span>P / ESC</span><span>:: PAUSE</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="pixel-text text-purple-400/50">
                    V1.1.0
                </p>
            </div>

            {/* Instruction Overlay */}
            <AnimatePresence>
                {showInstructions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative max-w-4xl w-full"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="absolute -top-4 -right-4 z-10 bg-red-600 hover:bg-red-500 border-2 border-red-400 rounded-full p-3 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-900/50"
                                aria-label="Close instructions"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>

                            {/* Instruction Image */}
                            <div className="bg-slate-900 border-4 border-cyan-500 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/20">
                                <img
                                    src={instructionImage}
                                    alt="Game Instructions"
                                    className="w-full h-auto"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
