import { Rocket } from "lucide-react";

interface HomePageProps {
  onStartGame: () => void;
}

export function HomePage({ onStartGame }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}
      </div>

      {/* Larger animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.2,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-50 animate-pulse" />
          <Rocket className="w-24 h-24 text-cyan-400 relative z-10" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="pixel-text-title text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            SPACE
          </h1>
          <h1 className="pixel-text-title text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
            EXPLORER
          </h1>
        </div>

        {/* Play button */}
        <button
          onClick={onStartGame}
          className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 border-4 border-cyan-400 shadow-lg shadow-cyan-400/50 hover:shadow-cyan-400/80 hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          <span className="pixel-text-button text-white relative z-10">PLAY</span>
        </button>

        {/* Subtitle */}
        <p className="pixel-text text-cyan-300/70 text-center">
          TAP TO START YOUR ADVENTURE
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="pixel-text text-purple-400/50">
          V1.0.0
        </p>
      </div>
    </div>
  );
}
