'use client';

import Title from "~/components/title";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BlogFilters from "~/components/blog/BlogFilters";
import BlogGrid from "~/components/blog/BlogGrid";
import BlogSkeleton from "~/components/blog/BlogSkeleton";
import Pagination from "~/components/pagination";
import { useQuery } from '@tanstack/react-query';
import NotFoundInline from "~/components/ui/not-found-inline";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import { BlogPost, BlogTag } from '~/constants/posts';
import { useNotifications } from "~/hooks/useNotifications";


export default function BlogPageClient() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  
  useNotifications();

  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
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
          <>
            {postsLoading ? (
              <BlogSkeleton postCount={pageSize} />
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
              </div>
            ) : (
              <BlogGrid posts={paginatedPosts} pageSize={pageSize} />
            )}
          </>
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