"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-8 right-6 z-50 cursor-pointer group"
        >
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-nowrap relative shadow-lg">
              Back to Top
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-blue-400 dark:border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          </div>

          <motion.svg
            viewBox="0 0 100 100"
            className="w-16 h-16 text-blue-600 dark:text-blue-400"
            animate={{ y: [0, -6, 0] }}
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              y: { duration: 0.9, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <polygon
              points="50,15 25,40 35,40 35,85 65,85 65,40 75,40"
              className="fill-blue-600 dark:fill-blue-400"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
