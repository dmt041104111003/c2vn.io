"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import Modal from '~/components/admin/common/Modal';

interface MediaItem {
  url: string;
  type: string;
  title: string;
}

interface LandingMediaSectionProps {
  mediaItems: MediaItem[];
}

export default function LandingMediaSection({ mediaItems }: LandingMediaSectionProps) {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (mediaItem: MediaItem) => {
    setSelectedImage(mediaItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
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
                    
                    {/* Text "cardano2vn" với ngoặc kép */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold">
                      "cardano2vn"
                    </div>
                    
                    {/* Ngoặc kép trái */}
                    <div className="absolute bottom-2 left-2 text-white text-lg font-bold">
                      "
                    </div>
                    
                    {/* Ngoặc kép phải */}
                    <div className="absolute bottom-2 right-2 text-white text-lg font-bold">
                      "
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0,
              filter: "blur(12px)",
              transformOrigin: "right",
            }}
            animate={{
              opacity: 1,
              scaleX: 1,
              filter: "blur(0px)",
              transformOrigin: "right",
            }}
            exit={{
              opacity: 0,
              scaleX: 0,
              filter: "blur(12px)",
              transformOrigin: "right",
            }}
            transition={{
              duration: 0.6,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto transparent-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-600 rounded-[40px] shadow-2xl">
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Image Preview</h2>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-auto max-h-[70vh] flex items-center justify-center rounded-lg text-3xl font-bold text-gray-900 dark:text-white">
                      {'{Cardano2vn}'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              onClick={handleCloseModal}
              className="absolute button"
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "4em",
                height: "4em",
                border: "none",
                background: "rgba(180, 83, 107, 0.11)",
                borderRadius: "5px",
                transition: "background 0.5s",
                zIndex: 50,
              }}
            >
              <span
                className="X"
                style={{
                  content: "",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "2em",
                  height: "1.5px",
                  backgroundColor: "rgb(255, 255, 255)",
                  transform: "translateX(-50%) rotate(45deg)",
                }}
              ></span>
              <span
                className="Y"
                style={{
                  content: "",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "2em",
                  height: "1.5px",
                  backgroundColor: "#fff",
                  transform: "translateX(-50%) rotate(-45deg)",
                }}
              ></span>
              <div
                className="close"
                style={{
                  position: "absolute",
                  display: "flex",
                  padding: "0.8rem 1.5rem",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "translateX(-50%)",
                  top: "-70%",
                  left: "50%",
                  width: "3em",
                  height: "1.7em",
                  fontSize: "12px",
                  backgroundColor: "rgb(19, 22, 24)",
                  color: "rgb(187, 229, 236)",
                  border: "none",
                  borderRadius: "3px",
                  pointerEvents: "none",
                  opacity: "0",
                }}
              >
                Close
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
