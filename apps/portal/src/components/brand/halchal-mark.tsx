import { motion, useReducedMotion } from "framer-motion";

const bars = [
  { x: 244, height: 220, fill: "#A855F7", duration: 1.1, delay: 0 },
  { x: 298, height: 170, fill: "#7C3AED", duration: 1.3, delay: 0.1 },
  { x: 352, height: 120, fill: "#6D28D9", duration: 1.5, delay: 0.2 },
  { x: 406, height: 70, fill: "#4C1D95", duration: 1.2, delay: 0.3 },
];

const CENTER_Y = 140;

/**
 * The Halchal wordmark: an "H" with four bars trailing off like a sound wave.
 * Bars pulse like an audio equalizer — off by default for prefers-reduced-motion.
 */
export function HalchalMark({
  className,
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animated && !reduceMotion;

  return (
    <svg
      viewBox="0 0 460 280"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Halchal"
    >
      {/* H */}
      <rect x="10" y="30" width="64" height="220" rx="32" fill="white" />
      <rect x="160" y="30" width="64" height="220" rx="32" fill="white" />
      <rect x="10" y="105" width="214" height="70" rx="20" fill="white" />

      {/* Sound-wave bars */}
      {bars.map((bar) => (
        <motion.rect
          key={bar.x}
          x={bar.x}
          y={CENTER_Y - bar.height / 2}
          width="40"
          height={bar.height}
          rx="20"
          fill={bar.fill}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={
            shouldAnimate
              ? { scaleY: [1, 0.45, 1] }
              : undefined
          }
          transition={
            shouldAnimate
              ? {
                  duration: bar.duration,
                  delay: bar.delay,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
