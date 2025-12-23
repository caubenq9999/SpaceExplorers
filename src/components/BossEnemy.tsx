import { motion } from "motion/react";
import { Skull } from "lucide-react";

interface BossEnemyProps {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
}

export function BossEnemy({ x, y, health, maxHealth, shield, maxShield }: BossEnemyProps) {
  const healthPercentage = (health / maxHealth) * 100;
  const shieldPercentage = maxShield > 0 ? (shield / maxShield) * 100 : 0;

  return (
    <div className="absolute" style={{ left: x - 48, top: y - 48 }}>
      {/* Boss sprite */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -5, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 3, ease: "easeInOut" },
        }}
      >
        <svg viewBox="0 0 96 96" className="w-24 h-24">
          {/* Main body */}
          <rect x="24" y="12" width="48" height="8" fill="#9333ea" />
          <rect x="16" y="20" width="64" height="8" fill="#a855f7" />
          <rect x="12" y="28" width="72" height="16" fill="#9333ea" />
          <rect x="16" y="44" width="64" height="16" fill="#7c3aed" />

          {/* Eyes */}
          <rect x="28" y="32" width="8" height="8" fill="#ef4444" />
          <rect x="60" y="32" width="8" height="8" fill="#ef4444" />
          <rect x="30" y="34" width="4" height="4" fill="#fff" />
          <rect x="62" y="34" width="4" height="4" fill="#fff" />

          {/* Weapons/Wings */}
          <rect x="4" y="36" width="8" height="4" fill="#ec4899" />
          <rect x="0" y="40" width="12" height="8" fill="#d946ef" />
          <rect x="84" y="36" width="8" height="4" fill="#ec4899" />
          <rect x="84" y="40" width="12" height="8" fill="#d946ef" />

          {/* Bottom thrusters */}
          <rect x="24" y="60" width="8" height="8" fill="#6366f1" />
          <rect x="64" y="60" width="8" height="8" fill="#6366f1" />

          {/* Pulsing glow effect */}
          <rect x="36" y="48" width="24" height="4" fill="#f97316" opacity="0.8" />
          <rect x="40" y="52" width="16" height="2" fill="#facc15" opacity="0.6" />
        </svg>

        {/* Boss icon overlay */}
        <div className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 border-2 border-red-400">
          <Skull className="w-4 h-4 text-white" />
        </div>
      </motion.div>

      {/* Boss shield bar */}
      {shield > 0 && (
        <div className="absolute -top-12 left-0 right-0">
          <div className="bg-gray-900 border-2 border-cyan-400 h-2 rounded-full overflow-hidden shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: "100%" }}
              animate={{ width: `${shieldPercentage}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Boss health bar */}
      <div className="absolute -top-8 left-0 right-0">
        <div className="bg-gray-800 border-2 border-red-500 h-3 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-red-400"
            initial={{ width: "100%" }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="text-center text-white pixel-text text-xs mt-1">
          BOSS: {Math.ceil(health)}/{maxHealth}
        </div>
      </div>

      {/* Warning glow */}
      <div className="absolute inset-0 blur-xl bg-red-500 opacity-30 animate-pulse pointer-events-none" />
    </div>
  );
}
