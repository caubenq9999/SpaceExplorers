import { Heart, Zap, Bomb } from "lucide-react";

interface GameUIProps {
  score: number;
  lives: number;
  power: number;
  wave: number;
  bombs?: number;
  grazeCount?: number;
  highScore?: number;
  weaponMode?: 'BLASTER' | 'SHOTGUN';
}

export function GameUI({ score, lives, power, wave, bombs = 0, grazeCount = 0, highScore = 0, weaponMode = 'BLASTER' }: GameUIProps) {
  return (
    <div className="w-full max-w-md bg-gradient-to-r from-purple-900 to-indigo-900 border-4 border-purple-500 p-4 shadow-lg shadow-purple-500/50">
      <div className="grid grid-cols-2 gap-4">
        {/* Score and Wave */}
        <div className="space-y-2">
          <div className="pixel-text">
            <span className="text-cyan-400">SCORE:</span>
            <span className="text-white ml-2">{score.toString().padStart(6, "0")}</span>
          </div>
          {highScore > 0 && (
            <div className="pixel-text">
              <span className="text-green-400">HIGH:</span>
              <span className="text-white ml-2">{highScore.toString().padStart(6, "0")}</span>
            </div>
          )}
          <div className="pixel-text">
            <span className="text-yellow-400">WAVE:</span>
            <span className="text-white ml-2">{wave}</span>
          </div>
          <div className="pixel-text">
            <span className="text-purple-400">GRAZE:</span>
            <span className="text-white ml-2">{grazeCount}</span>
          </div>
          <div className="pixel-text">
            <span className="text-cyan-400">WEAPON:</span>
            <span className={`ml-2 ${weaponMode === 'SHOTGUN' ? 'text-orange-400' : 'text-cyan-300'}`}>
              {weaponMode}
            </span>
          </div>
        </div>

        {/* Lives, Power, and Bombs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-pink-400 pixel-text">LIVES:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${i < lives ? "text-pink-500 fill-pink-500" : "text-gray-600"
                    }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 pixel-text">POWER:</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Zap
                  key={i}
                  className={`w-4 h-4 ${i < power ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
                    }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 pixel-text">BOMBS:</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Bomb
                  key={i}
                  className={`w-4 h-4 ${i < bombs ? "text-red-400 fill-red-400" : "text-gray-600"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}