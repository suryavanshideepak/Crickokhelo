import confetti from "canvas-confetti";

export function fireFourCelebration() {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.8 },
    colors: ["#38bdf8", "#0284c7", "#60a5fa"],
  });
}

export function fireSixCelebration() {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 85,
    spread: 100,
    origin: { y: 0.75 },
    colors: ["#a855f7", "#ec4899", "#f59e0b", "#3b82f6"],
  });
}

export function fireMilestoneCelebration() {
  if (typeof window === "undefined") return;
  // Two side bursts
  confetti({
    particleCount: 60,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ["#10b981", "#fbbf24", "#f43f5e"],
  });
  confetti({
    particleCount: 60,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ["#10b981", "#fbbf24", "#f43f5e"],
  });
}

export function fireVictoryCelebration() {
  if (typeof window === "undefined") return;
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
