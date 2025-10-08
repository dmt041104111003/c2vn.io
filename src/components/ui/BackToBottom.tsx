"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function BackToBottom() {
  const [visible, setVisible] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const pathname = usePathname();

  const getSectionIds = () => {
    switch (pathname) {
      case '/':
        return ['Landing', 'protocol', 'videos', 'CTA', 'courses', 'contact'];
      case '/about':
        return ['about', 'members', 'contact'];
      case '/members':
        return ['members', 'contact'];
      default:
        return [];
    }
  };

  useEffect(() => {
    const sections = getSectionIds();
    setSectionIds(sections);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setVisible(scrollY + windowHeight < documentHeight - 100);
      
      if (sectionIds.length > 0) {
        const headerOffset = 120;
        const scrollPos = scrollY + headerOffset;
        let activeIndex = 0;
        
        sectionIds.forEach((id, index) => {
          const el = document.getElementById(id);
          if (el && scrollPos >= el.offsetTop) {
            activeIndex = index;
          }
        });
        
        setCurrentSectionIndex(activeIndex);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); 
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionIds]);

  const scrollToNextSection = () => {
    if (sectionIds.length === 0) {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: "smooth" 
      });
      return;
    }

    const nextIndex = currentSectionIndex + 1;
    
    if (nextIndex < sectionIds.length) {
      const nextSectionId = sectionIds[nextIndex];
      const element = document.getElementById(nextSectionId);
      
      if (element) {
        const headerOffset = 100;
        const y = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: "smooth" 
      });
    }
  };

  const getTooltipText = () => {
    if (sectionIds.length === 0) {
      return 'Go to Bottom';
    }

    const nextIndex = currentSectionIndex + 1;
    
    if (nextIndex < sectionIds.length) {
      const nextSectionId = sectionIds[nextIndex];
      
      const displayName = nextSectionId
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      return `Go to ${displayName}`;
    } else {
      return 'Go to Bottom';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          onClick={scrollToNextSection}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-8 left-6 z-50 cursor-pointer group"
        >
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-nowrap relative shadow-lg">
              {getTooltipText()}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-r-4 border-r-blue-400 dark:border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          </div>

          <motion.svg
            viewBox="0 0 100 100"
            className="w-16 h-16 text-blue-600 dark:text-blue-400"
            animate={{ y: [0, 6, 0] }}
            whileHover={{ y: 4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              y: { duration: 0.9, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <polygon
              points="50,85 25,60 35,60 35,15 65,15 65,60 75,60"
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
