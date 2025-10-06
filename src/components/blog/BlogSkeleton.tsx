'use client';

import { motion } from "framer-motion";

export default function BlogSkeleton() {
  return (
    <motion.section className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }
              }
            }}
          >
            <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="lg:col-span-2 space-y-4">
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            show: { 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }
            }
          }}
        >
          <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="block">
              <div className="h-48 sm:h-56 lg:h-64 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5" />
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            show: { 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }
            }
          }}
        >
          <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="flex gap-3 p-3">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
