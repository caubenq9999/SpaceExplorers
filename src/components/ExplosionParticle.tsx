import { motion } from "motion/react";

interface ExplosionParticleProps {
  x: number;
  y: number;
  color: string;
  delay?: number;
}

export function ExplosionParticle({ x, y, color, delay = 0 }: ExplosionParticleProps) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 20 + Math.random() * 30;
  const endX = x + Math.cos(angle) * distance;
  const endY = y + Math.sin(angle) * distance;

  return (
    <motion.div
      className="absolute rounded-full"
      initial={{
        x,
        y,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: endX,
        y: endY,
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration: 0.5 + Math.random() * 0.3,
        delay,
        ease: "easeOut",
      }}
      style={{
        width: 4 + Math.random() * 4,
        height: 4 + Math.random() * 4,
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  );
}
