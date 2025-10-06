'use client';

import Blog from "~/components/blog";
import Title from "~/components/title";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BlogFilters from "~/components/blog/BlogFilters";
import BlogCardSkeleton from "~/components/blog/BlogCardSkeleton";
import Pagination from "~/components/pagination";
import { useQuery } from '@tanstack/react-query';
import NotFoundInline from "~/components/ui/not-found-inline";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import { BlogPost, BlogMedia, BlogTag } from '~/constants/posts';
import { useNotifications } from "~/hooks/useNotifications";

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function BlogPageClient() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  useNotifications();

  const {
    data: postsData,
    error: postsError,
  } = useQuery({
    queryKey: ['public-posts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/posts?public=1');
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    }
  });

  useEffect(() => {
    if (postsError) {

    }
  }, [postsError]);
  const posts: BlogPost[] = postsData?.data || [];

  const { data: tagsData } = useQuery({
    queryKey: ['public-tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags');
      if (!res.ok) throw new Error('Failed to fetch tags');
      const data = await res.json();
      return data?.data || [];
    },
  });
  const allTags: BlogTag[] = tagsData || [];

  const filteredPosts = Array.isArray(posts) ? posts.filter(post => {
    const matchTitle = post.title.toLowerCase().includes(search.toLowerCase());
    const matchTags = selectedTags.length > 0 ? (Array.isArray(post.tags) && selectedTags.every(tagId => post.tags?.some(tag => tag.id === tagId))) : true;
    return matchTitle && matchTags;
  }) : [];

  const publishedPosts = Array.isArray(filteredPosts) ? filteredPosts.filter(post => post.status === 'PUBLISHED') : [];
  const totalPages = Math.ceil(publishedPosts.length / pageSize);
  const paginatedPosts = publishedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTags]);

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
                {/* Large Image */}
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
                
                {/* Content */}
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
                {/* Small Square Image */}
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
                
                {/* Content */}
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
    <main className="relative pt-20 bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <BackgroundMotion />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Title
            title="Cardano2vn Blog"
            description="Insights, updates, and stories from the Andamio ecosystem. Explore our journey building trust protocols for distributed work."
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BlogFilters
            search={search}
            setSearch={setSearch}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={allTags}
          />
        </motion.div>
        
        {publishedPosts.length === 0 && posts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            <NotFoundInline 
              onClearFilters={() => {
                setSearch('');
                setSelectedTags([]);
              }}
            />
          </motion.div>
        ) : (
        <motion.section className={`grid gap-6 ${paginatedPosts.length >= 5 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          {posts.length === 0 ? (
            <>
              {paginatedPosts.length >= 5 ? (
                <>
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
                        <BlogCardSkeleton />
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
                      <BlogCardSkeleton />
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
                      <BlogCardSkeleton />
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: Math.min(paginatedPosts.length, 2) }).map((_, i) => (
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
                      <BlogCardSkeleton />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {paginatedPosts.length >= 5 ? (
                <>
                  <div className="lg:col-span-1 space-y-4">
                    {paginatedPosts.slice(0, 3).map((post, index) => 
                      renderPostCard(post, index, false)
                    )}
                  </div>
                  
                  <div className="lg:col-span-2 space-y-4">
                    {paginatedPosts[3] && renderPostCard(paginatedPosts[3], 3, true)}
                    
                    {paginatedPosts[4] && renderPostCard(paginatedPosts[4], 4, false)}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {paginatedPosts.map((post, index) => 
                    renderPostCard(post, index, true)
                  )}
                </div>
              )}
            </>
          )}
        </motion.section>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </motion.div>
      </div>
    </main>
  );
}