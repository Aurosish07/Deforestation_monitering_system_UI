import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  };

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) updatePosition(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-lg cursor-col-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After (base layer) */}
      <img src={afterSrc} alt="After" className="absolute inset-0 w-full h-full object-cover" />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img src={beforeSrc} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-glow z-10"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-primary shadow-glow flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M5 2L1 8l4 6M11 2l4 6-4 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 rounded-md bg-background/70 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-foreground border border-border/50">
        {beforeLabel}
      </div>
      <div className="absolute top-3 right-3 rounded-md bg-danger/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-primary-foreground">
        {afterLabel}
      </div>
    </div>
  );
}
