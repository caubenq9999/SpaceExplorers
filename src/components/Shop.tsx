import { ArrowLeft, Coins, Check, Lock, Plus } from "lucide-react";
import React from 'react';
import { SKINS, Skin } from "../data/skins";

interface ShopProps {
  onBack: () => void;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  ownedSkins: string[];
  setOwnedSkins: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSkin: string;
  setSelectedSkin: React.Dispatch<React.SetStateAction<string>>;
}

export function Shop({
  onBack,
  coins,
  setCoins,
  ownedSkins,
  setOwnedSkins,
  selectedSkin,
  setSelectedSkin,
}: ShopProps) {

  const handleBuy = (skin: Skin) => {
    if (coins >= skin.price && !ownedSkins.includes(skin.id)) {
      setCoins(prev => prev - skin.price);
      setOwnedSkins(prev => [...prev, skin.id]);
    }
  };

  const handleEquip = (skinId: string) => {
    if (ownedSkins.includes(skinId)) {
      setSelectedSkin(skinId);
    }
  };

  // Generate placeholders to fill the grid (e.g., maintain 6 slots total)
  const totalSlots = 6;
  const placeholders = Array.from({ length: Math.max(0, totalSlots - SKINS.length) });

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative text-white selection:bg-cyan-500/30">

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-cyan-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">

        {/* Header Section */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="pixel-text-title text-5xl md:text-6xl text-cyan-400 tracking-wider drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            SPACE EXPLORER
          </h1>
          <p className="pixel-text text-purple-400 tracking-[0.2em] text-sm md:text-base">
            A BULLET-HELL ADVENTURE
          </p>
        </div>

        {/* Currency Display */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-yellow-500/50 backdrop-blur-sm mb-4">
          <Coins className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="pixel-text text-yellow-400 text-lg">{coins}</span>
        </div>

        {/* Main Shop Container */}
        <div className="w-full bg-slate-900/50 border-2 border-purple-500/50 rounded-2xl p-8 md:p-12 backdrop-blur-sm shadow-[0_0_50px_-10px_rgba(168,85,247,0.2)]">

          <h2 className="pixel-text text-cyan-400 text-center text-xl tracking-widest mb-10">
            SELECT YOUR SHIP
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {SKINS.map((skin) => {
              const isOwned = ownedSkins.includes(skin.id);
              const isSelected = selectedSkin === skin.id;
              const canAfford = coins >= skin.price;

              return (
                <div
                  key={skin.id}
                  onClick={() => isOwned ? handleEquip(skin.id) : null}
                  className={`
                                group relative aspect-square rounded-xl p-4 flex flex-col items-center justify-between transition-all duration-300
                                ${isSelected
                      ? "bg-slate-800 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.02]"
                      : "bg-black/40 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
                    }
                                ${!isOwned && !canAfford ? "opacity-70 grayscale-[0.5]" : ""}
                                ${isOwned ? "cursor-pointer" : ""}
                            `}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-20 bg-cyan-400 rounded-full p-1 shadow-lg shadow-cyan-400/50">
                      <Check className="w-4 h-4 text-black stroke-[3]" />
                    </div>
                  )}

                  {/* Ship Preview */}
                  <div className="flex-1 flex items-center justify-center w-full relative">
                    {skin.id === 'classic' ? (
                      <div className="w-32 h-32 transition-transform duration-300 group-hover:scale-110 relative flex items-center justify-center">
                        <img
                          src="/assets/classic_ship.png"
                          alt="Classic Ship"
                          className="w-full h-full object-contain"
                          style={{
                            filter: `drop-shadow(0 0 15px rgba(77, 208, 225, 0.6))`,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-slate-600 rounded-lg">
                          <Lock className="w-10 h-10 text-slate-600" />
                        </div>
                        <p className="pixel-text text-slate-500 text-sm">COMING SOON</p>
                      </div>
                    )}
                  </div>

                  {/* Label / Action */}
                  <div className="w-full text-center space-y-2 z-10">
                    <h3 className="pixel-text text-white text-lg tracking-wide">{skin.name}</h3>

                    {!isOwned && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(skin);
                        }}
                        disabled={!canAfford}
                        className={`
                                            w-full py-2 px-4 rounded md:text-sm pixel-text flex items-center justify-center gap-2 transition-colors
                                            ${canAfford
                            ? "bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/20"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                          }
                                        `}
                      >
                        {canAfford ? (
                          <>
                            <span className="text-xs">BUY</span>
                            <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded">
                              <Coins className="w-3 h-3" />
                              {skin.price}
                            </div>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            LOCKED
                          </>
                        )}
                      </button>
                    )}

                    {isOwned && !isSelected && (
                      <p className="pixel-text text-slate-500 text-xs mt-2 group-hover:text-cyan-400 transition-colors">
                        CLICK TO EQUIP
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Placeholders */}
            {placeholders.map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center gap-4 text-slate-600"
              >
                <Plus className="w-12 h-12 opacity-20" />
                <span className="pixel-text text-sm opacity-50">Coming Soon</span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="pixel-text text-slate-500 text-sm">More ships coming soon!</p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-8 pixel-text hover:text-cyan-400 text-slate-400 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO MENU
        </button>

      </div>
    </div>
  );
}
