"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingMediaSliderModal from "./LandingMediaSliderModal";

interface MediaItem {
  url: string;
  type: string;
  title: string;
}

interface LandingMediaSectionProps {
  mediaItems: MediaItem[];
}

export default function LandingMediaSection({ mediaItems }: LandingMediaSectionProps) {
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [sliderInitialIndex, setSliderInitialIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (mediaItem: MediaItem) => {
    const index = mediaItems.findIndex(item => item.url === mediaItem.url);
    setSliderInitialIndex(index);
    setIsSliderModalOpen(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, 4000); 
    
    return () => clearInterval(interval);
  }, [mediaItems.length]);

  return (
    <>
      <section className="relative hidden lg:block">
        <div className="relative">
          <div className="relative h-[55vh] w-full flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full">
              {mediaItems.map((item, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % mediaItems.length;
                const isPrev = index === (currentIndex - 1 + mediaItems.length) % mediaItems.length;
                const isNext2 = index === (currentIndex + 2) % mediaItems.length;
                
                let x, y, scale, opacity, zIndex;
                
                if (isActive) {
                  // Active card - center
                  x = '50%';
                  y = '50%';
                  scale = 1;
                  opacity = 1;
                  zIndex = 10;
                } else if (isNext) {
                  // Next card - right side
                  x = '120%';
                  y = '50%';
                  scale = 0.8;
                  opacity = 0.7;
                  zIndex = 8;
                } else if (isPrev) {
                  // Previous card - left side
                  x = '-20%';
                  y = '50%';
                  scale = 0.8;
                  opacity = 0.7;
                  zIndex = 8;
                } else if (isNext2) {
                  // Next+2 card - far right
                  x = '180%';
                  y = '50%';
                  scale = 0.6;
                  opacity = 0.4;
                  zIndex = 5;
                } else {
                  // Other cards - far left
                  x = '-60%';
                  y = '50%';
                  scale = 0.6;
                  opacity = 0.4;
                  zIndex = 5;
                }
                
                return (
                  <motion.div
                    key={index}
                    animate={{ 
                      x: x,
                      y: y,
                      scale: scale,
                      opacity: opacity
                    }}
                    transition={{ 
                      duration: 0.8, 
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="absolute rounded-2xl overflow-hidden border-4 border-gray-200 dark:border-white shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300"
                    style={{
                      left: '-200px', 
                      top: '-150px', 
                      width: '400px',
                      height: '300px',
                      zIndex: zIndex,
                    }}
                    onClick={() => handleImageClick(item)}
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${item.url})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold">
                      cardano2vn
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <LandingMediaSliderModal
        isOpen={isSliderModalOpen}
        onClose={() => setIsSliderModalOpen(false)}
        mediaItems={mediaItems}
        initialIndex={sliderInitialIndex}
      />
    </>
  );
}
