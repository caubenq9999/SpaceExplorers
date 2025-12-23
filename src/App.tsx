import { useState, useEffect } from "react";
import { PixelShooterGame } from "./components/PixelShooterGame";
import { StartMenu } from "./components/StartMenu";
import { PauseMenu } from "./components/PauseMenu";
import { GameOver } from "./components/GameOver";
import { Shop } from "./components/Shop";
import { SKINS } from "./data/skins";

type GameState = 'START_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'SHOP';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START_MENU');
  const [score, setScore] = useState(0);

  // Persistent State
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('pixelShooter_coins');
    return saved ? parseInt(saved, 10) : 1000; // Default 1000 coins
  });

  const [ownedSkins, setOwnedSkins] = useState<string[]>(() => {
    const saved = localStorage.getItem('pixelShooter_ownedSkins');
    return saved ? JSON.parse(saved) : ['classic']; // Default 'classic' owned
  });

  const [selectedSkin, setSelectedSkin] = useState(() => {
    return localStorage.getItem('pixelShooter_selectedSkin') || 'classic'; // Default 'classic'
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('pixelShooter_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('pixelShooter_ownedSkins', JSON.stringify(ownedSkins));
  }, [ownedSkins]);

  useEffect(() => {
    localStorage.setItem('pixelShooter_selectedSkin', selectedSkin);
  }, [selectedSkin]);

  const handleStartGame = () => {
    setScore(0);
    setGameState('PLAYING');
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    const earnedCoins = Math.floor(finalScore * 0.1); // 10% of score converted to coins
    setCoins(prev => prev + earnedCoins);
    setGameState('GAME_OVER');
  };

  const handleBackToMenu = () => {
    setGameState('START_MENU');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">

      {gameState === 'START_MENU' && (
        <StartMenu
          onStartGame={handleStartGame}
          onOpenShop={() => setGameState('SHOP')}
        />
      )}

      {gameState === 'SHOP' && (
        <Shop
          onBack={handleBackToMenu}
          coins={coins}
          setCoins={setCoins}
          ownedSkins={ownedSkins}
          setOwnedSkins={setOwnedSkins}
          selectedSkin={selectedSkin}
          setSelectedSkin={setSelectedSkin}
        />
      )}

      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <div className="w-full h-full flex items-center justify-center p-4">
          <PixelShooterGame
            isPaused={gameState === 'PAUSED'}
            onPause={() => setGameState('PAUSED')}
            onGameOver={handleGameOver}
            selectedSkin={selectedSkin}
          />
        </div>
      )}

      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={() => setGameState('PLAYING')}
          onQuit={handleBackToMenu}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOver
          score={score}
          onRetry={handleStartGame}
          onMenu={handleBackToMenu}
        />
      )}

    </div>
  );
}
