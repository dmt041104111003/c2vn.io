"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  author: string;
  tags: Array<{ id: string; name: string } | string>;
  media?: Array<{ url: string; type: string; id?: string }>;
}

interface RelatedPostsSliderProps {
  posts: RelatedPost[];
}

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function RelatedPostsSlider({ posts }: RelatedPostsSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const maxVisiblePosts = 3;
  const totalSlides = Math.ceil(posts.length / maxVisiblePosts);
  const shouldUseSlider = posts.length > maxVisiblePosts;
  
  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };
  
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };
  
  const getCurrentPosts = () => {
    if (!shouldUseSlider) return posts;
    const startIndex = currentSlide * maxVisiblePosts;
    return posts.slice(startIndex, startIndex + maxVisiblePosts);
  };

  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Posts with Same Tags
        </h2>
        {shouldUseSlider && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentSlide + 1} of {totalSlides}
            </span>
            <div className="flex gap-1">
              <button
                onClick={goToPreviousSlide}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Previous"
                aria-label="Previous posts"
              >
                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={goToNextSlide}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Next"
                aria-label="Next posts"
              >
                <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <div className="grid max-w-none gap-8 md:gap-10 lg:gap-8 lg:grid-cols-3">
          <AnimatePresence mode="wait">
            {getCurrentPosts().map((post, idx) => (
              <motion.article
                key={`${post.id}-${currentSlide}`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ 
                  duration: 0.5, 
                  delay: idx * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="flex flex-col"
              >
                <div className="w-full rounded-xl border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-gray-300 dark:hover:border-white/40 hover:shadow-2xl h-full flex flex-col overflow-visible group">
                  <Link className="flex-1 flex flex-col" href={`/blog/${post.slug || post.id}`} onClick={() => {
                    const pid = post.slug || post.id;
                    try {
                      fetch('/api/blog/seen', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ postId: pid }),
                      }).catch(() => {});
                    } catch {}
                  }}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        src={(() => {
                          const media = post.media?.[0];
                          if (media && typeof media.url === 'string' && media.url) {
                            const youtubeId = getYoutubeIdFromUrl(media.url);
                            if (youtubeId) {
                              return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                            }
                            return media.url;
                          }
                          return "/images/common/loading.png";
                        })()}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/common/loading.png";
                        }}
                      />
                    </div>

                    <div className="p-4 flex flex-col">
                      {/* Tags */}
                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={typeof tag === 'string' ? tag : tag.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                            >
                              {typeof tag === 'string' ? tag : tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="relative">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="absolute left-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[2147483647]">
                          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-pre-line max-w-[80vw] md:max-w-md relative">
                            {post.title}
                            <div className="absolute left-4 -top-2 border-b-8 border-b-gray-900 dark:border-b-gray-100 border-x-8 border-x-transparent"></div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                          <span className="font-mono">
                            {new Date(post.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric"
                            })}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Read More</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
        
        {shouldUseSlider && totalSlides > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide
                    ? "bg-blue-600 dark:bg-blue-400"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
