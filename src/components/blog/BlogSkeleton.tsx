'use client';

import { motion } from "framer-motion";

interface BlogSkeletonProps {
  postCount?: number;
}

  export default function BlogSkeleton({ postCount = 7 }: BlogSkeletonProps) {
  const getSkeletonLayout = () => {
    if (postCount >= 7) {
      return {
        className: 'grid-cols-1 grid-rows-7 lg:grid-cols-3 lg:grid-rows-5',
        content: (
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
        )
      };
    } else if (postCount === 6) {
      return {
        className: 'grid-cols-1 grid-rows-6 lg:grid-cols-3 lg:grid-rows-4',
        content: (
          <>
            {/* Right tall */}
            <motion.div className="row-span-2 col-start-auto lg:col-start-3 lg:row-start-1">
              <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 shadow-lg overflow-hidden h-full">
                <div className="h-64 sm:h-72 lg:h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
            </motion.div>
            {/* Top-left big area */}
            <motion.div className="col-span-1 lg:col-span-2 row-span-2 lg:row-start-1">
              <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 shadow-lg overflow-hidden h-full">
                <div className="h-64 sm:h-72 lg:h-80 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
            </motion.div>
            {/* Bottom cells */}
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} className={`row-span-1 lg:row-span-1 ${i < 2 ? 'lg:row-start-3' : 'lg:row-start-4'} ${i % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-2'}`}>
                <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 shadow-lg overflow-hidden h-36 lg:h-40">
                  <div className="h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </>
        )
      };
    } else if (postCount === 5) {
      return {
        className: 'grid-cols-1 grid-rows-5 lg:grid-cols-3 lg:grid-rows-4',
        content: (
          <>
            {/* Right tall */}
            <motion.div className="row-span-2 col-start-auto lg:col-start-3 lg:row-start-1">
              <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 shadow-lg overflow-hidden h-full">
                <div className="h-64 sm:h-72 lg:h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
            </motion.div>
            {/* Top-left big */}
            <motion.div className="col-span-1 lg:col-span-2 row-span-2 lg:row-start-1">
              <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 shadow-lg overflow-hidden h-full">
                <div className="h-64 sm:h-72 lg:h-80 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
            </motion.div>
            {/* Bottom three */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div key={i} className={`row-span-1 lg:row-span-2 lg:row-start-3 lg:col-start-${i + 1}`}>
                <div className="rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 shadow-lg overflow-hidden h-36 lg:h-40">
                  <div className="h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </>
        )
      };
    } else if (postCount === 4) {
      return {
        className: 'grid-cols-1 grid-rows-4 lg:grid-cols-2 lg:grid-rows-2',
        content: (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
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
          </>
        )
      };
    } else if (postCount === 3) {
      return {
        className: 'grid-cols-1 grid-rows-3',
        content: (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
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
          </>
        )
      };
    } else if (postCount === 2) {
      return {
        className: 'grid-cols-1 grid-rows-2',
        content: (
          <>
            {Array.from({ length: 2 }).map((_, i) => (
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
          </>
        )
      };
    } else {
      return {
        className: 'grid-cols-1 grid-rows-1',
        content: (
          <>
            {Array.from({ length: 1 }).map((_, i) => (
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
          </>
        )
      };
    }
  };

  const layout = getSkeletonLayout();

  return (
    <motion.section className={`grid gap-6 ${layout.className}`}>
      {layout.content}
    </motion.section>
  );
}
