'use client';

import { motion } from "framer-motion";
import { BlogPost, BlogMedia } from '~/constants/posts';

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

interface BlogGridProps {
  posts: BlogPost[];
  pageSize: number;
}

export default function BlogGrid({ posts, pageSize }: BlogGridProps) {
  const renderPostCard = (post: BlogPost, index: number, isLarge = false) => {
    let imageUrl = "/images/common/loading.png";
    if (Array.isArray(post.media) && post.media.length > 0) {
      const youtubeMedia = post.media.find((m: BlogMedia) => m.type === 'YOUTUBE');
      if (youtubeMedia) {
        const videoId = getYoutubeIdFromUrl(youtubeMedia.url);
        if (videoId) {
          imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      } else {
        imageUrl = post.media[0].url;
      }
    }

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.1,
          ease: "easeOut"
        }}
        viewport={{ once: false, amount: 0.3 }}
        whileHover={{ 
          y: isLarge ? -8 : -4,
          transition: { duration: 0.3 }
        }}
      >
        <div className={`rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-white/40 hover:shadow-xl overflow-hidden`}>
          <a href={`/blog/${post.slug || post.id}`} className={isLarge ? "block" : "flex gap-3 p-3"}>
            {isLarge ? (
              <>
                <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    src={imageUrl}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/common/loading.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <div className="p-4">
                  <h2 className="font-bold text-lg lg:text-xl text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author || "Admin"}</span>
                      <span>•</span>
                      <span className="font-mono">
                        {new Date(post.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Read More</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    src={imageUrl}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/common/loading.png";
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {post.title}
                  </h3>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{post.author || "Admin"}</span>
                    <span className="mx-1">•</span>
                    <span className="font-mono">
                      {new Date(post.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </a>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.section className={`grid gap-6 ${posts.length >= 5 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
      {posts.length >= 5 ? (
        <>
          <div className="lg:col-span-1 space-y-4">
            {posts.slice(0, 3).map((post, index) => 
              renderPostCard(post, index, false)
            )}
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            {posts[3] && renderPostCard(posts[3], 3, true)}
            {posts[4] && renderPostCard(posts[4], 4, false)}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => 
            renderPostCard(post, index, true)
          )}
        </div>
      )}
    </motion.section>
  );
}
