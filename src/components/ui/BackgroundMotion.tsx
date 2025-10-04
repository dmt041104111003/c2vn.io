"use client";

import { motion } from "framer-motion";

interface BackgroundMotionProps {
  className?: string;
  opacity?: number;
  scale?: number;
  duration?: number;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: string;
  imageHeight?: string;
  imagePosition?: string;
}

export default function BackgroundMotion({
  className = "fixed left-[-200px] top-1/2 -translate-y-1/2 z-0 pointer-events-none select-none block",
  opacity = 0.15,
  scale = 1,
  duration = 1,
  imageSrc = "/images/common/loading.png",
  imageAlt = "Cardano2VN Logo",
  imageWidth = "1200px",
  imageHeight = "1200px",
  imagePosition = "left center"
}: BackgroundMotionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity, scale }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration, ease: "easeOut" }}
      className={className}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className={`w-[${imageWidth}] h-[${imageHeight}] object-contain`}
        draggable={false}
        style={{ 
          objectPosition: imagePosition,
          '--image-position': imagePosition 
        } as React.CSSProperties & { '--image-position': string }}
      />
    </motion.div>
  );
}
