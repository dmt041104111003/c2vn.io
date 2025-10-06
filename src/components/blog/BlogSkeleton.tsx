'use client';

import { motion } from "framer-motion";

interface BlogSkeletonProps {
  postCount?: number;
}

export default function BlogSkeleton({ postCount = 6 }: BlogSkeletonProps) {
  const isFullWidth = postCount < 6;
  
  return (
    <motion.section className={`grid gap-6 ${isFullWidth ? 'lg:grid-cols-1' : 'lg:grid-cols-3'}`}>
      {isFullWidth ? (
        <div className="space-y-6">
          {Array.from({ length: postCount }).map((_, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, delay: i * 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
              className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg overflow-hidden"
            >
              <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-4">
                <div className="flex gap-1 mb-2">
                  <div className="h-5 w-16 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                  <div className="h-5 w-12 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                  <div className="h-5 w-14 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <>
          <div className="lg:col-span-1 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
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
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
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
      
      <div className="lg:col-span-2 flex flex-col space-y-2">
        <div className="flex-1">
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
            <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg overflow-hidden h-full">
                      <div className="block">
                        <div className="h-64 sm:h-72 lg:h-80 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="p-4 space-y-3">
                          <div className="flex gap-1">
                            <div className="h-5 w-16 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                            <div className="h-5 w-12 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                            <div className="h-5 w-14 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                          </div>
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
        </div>
        
        <div className="flex-shrink-0">
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
            <div className="flex gap-4 p-4">
              <div className="w-24 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex gap-1">
                  <div className="h-4 w-12 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                  <div className="h-4 w-10 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
        </>
      )}
    </motion.section>
  );
}
