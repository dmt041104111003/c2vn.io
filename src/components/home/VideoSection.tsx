"use client";

// import Action from "~/components/action";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import VideoSectionSkeleton from "./VideoSectionSkeleton";
import NotFoundInline from "~/components/ui/not-found-inline";
import StarIcon from "../ui/StarIcon";

interface Video {
  id: string;
  videoId: string;
  channelName: string;
  videoUrl: string;
  title: string;
  thumbnailUrl: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchVideos(): Promise<Video[]> {
  const res = await fetch("/api/video-section");
  if (!res.ok) {
    throw new Error("Failed to fetch videos");
  }
  const data = await res.json();
  return data?.data || [];
}

export default function VideoSection() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const playerRef = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);

  const {
    data: videos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["video-section"],
    queryFn: fetchVideos,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (error) {

    }
  }, [error]);

  React.useEffect(() => {
    if (videos.length > 0 && !currentVideo) {
      const featuredVideo = videos.find((video: Video) => video.isFeatured);
      setCurrentVideo(featuredVideo || videos[0]);
    }
  }, [videos, currentVideo]);

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
  };

  const sortedVideos = Array.isArray(videos) ? videos.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  }) : [];

  const displayedVideos = showAllVideos ? sortedVideos : sortedVideos.slice(0, 2);

  function getYoutubeIdFromUrl(url: string) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)\s*([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function getThumbnail(video: Video) {
    const youtubeId = getYoutubeIdFromUrl(video.videoUrl || "") || (video.videoId && video.videoId.length === 11 ? video.videoId : null);
    if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    if (video.thumbnailUrl && video.thumbnailUrl.trim() !== "") return video.thumbnailUrl.trim();
    return "/images/common/loading.png";
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).YT && (window as any).YT.Player) {
      setYtReady(true);
      return;
    }
    const existing = document.getElementById('youtube-iframe-api');
    if (!existing) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    (window as any).onYouTubeIframeAPIReady = () => setYtReady(true);
    const poll = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(poll);
        setYtReady(true);
      }
    }, 100);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (!ytReady || !currentVideo) return;
    const YT = (window as any).YT;
    const handleStateChange = (event: any) => {
      const PlayerState = YT?.PlayerState || {};
      if (event?.data === PlayerState.ENDED) {
        setShowEndOverlay(true);
        const list = Array.isArray(sortedVideos) ? sortedVideos : [];
        const idx = list.findIndex(v => v.id === currentVideo.id);
        const next = idx >= 0 && idx + 1 < list.length ? list[idx + 1] : list[0];
        if (next && next.id !== currentVideo.id) setCurrentVideo(next);
      } else if (event?.data === PlayerState.PLAYING) {
        setShowEndOverlay(false);
      }
    };

    if (playerRef.current) {
      try {
        playerRef.current.loadVideoById(currentVideo.videoId);
        playerRef.current.playVideo?.();
      } catch {}
      return;
    }

    playerRef.current = new YT.Player('video-player', {
      videoId: currentVideo.videoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        controls: 1,
        modestbranding: 1,
        playsinline: 1,
        mute: 1,
      },
      events: {
        onReady: () => {
          try {
            playerRef.current?.mute?.();
            playerRef.current?.playVideo?.();
          } catch {}
        },
        onStateChange: handleStateChange,
      },
    });
  }, [ytReady, currentVideo, sortedVideos]);

  if (isLoading) {
    return <VideoSectionSkeleton />;
  }

  if (error || !videos || videos.length === 0) {
    return (
      <section id="videos" className="relative flex min-h-screen items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40">
        <div className="mx-auto w-5/6 max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-20">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="mb-8 lg:mb-16"
            >
              <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
                <StarIcon size="lg" className="w-16 h-16" />
                <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">The Cardano2vn Videos</h2>
              </div>
            </motion.div>
            <NotFoundInline 
              onClearFilters={() => {
                window.location.reload();
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (!currentVideo) {
    return (
      <section id="videos" className="relative flex min-h-screen items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40">
        <div className="mx-auto w-5/6 max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-20">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="mb-8 lg:mb-16"
            >
              <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
                <StarIcon size="lg" className="w-16 h-16" />
                <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">The Cardano2vn Videos</h2>
              </div>
              <p className="max-w-3xl text-base lg:text-xl text-gray-700 dark:text-gray-300">Watch our latest videos and memorable moments.</p>
            </motion.div>
            <NotFoundInline 
              onClearFilters={() => {
                window.location.reload();
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="relative flex min-h-screen items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40">
      <div className="mx-auto w-5/6 max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-20">
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mb-8 lg:mb-16"
          >
            <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
              <StarIcon size="lg" className="w-16 h-16" />
              <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">The Cardano2vn Videos</h2>
            </div>
            <p className="max-w-3xl text-base lg:text-xl text-gray-700 dark:text-gray-300">Watch our latest videos and memorable moments.</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="w-full lg:w-[60%]"
            >
              <div className="relative w-full aspect-video rounded-lg lg:rounded-xl overflow-hidden mb-4 lg:mb-6 shadow-lg lg:shadow-2xl">
                <div id="video-player" className="w-full h-full"></div>
                {showEndOverlay && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 p-4">
                    <h4 className="text-white text-lg lg:text-xl font-semibold">Up next</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                      {(() => {
                        const suggestions = (Array.isArray(sortedVideos) ? sortedVideos : []).filter(v => v.id !== currentVideo.id).slice(0, 3);
                        if (suggestions.length === 0) {
                          return (
                            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-2">
                              <img src="/images/common/loading.png" alt="placeholder" className="w-20 h-12 object-cover rounded" />
                              <div className="text-white text-sm">More videos coming soon</div>
                            </div>
                          );
                        }
                        return suggestions.map(s => (
                          <button key={s.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-2 text-left hover:bg-white/20" onClick={() => { setShowEndOverlay(false); setCurrentVideo(s); }}>
                            <img src={getThumbnail(s)} alt={s.title} className="w-20 h-12 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate" title={s.title}>{s.title}</div>
                              <div className="text-gray-300 text-xs truncate" title={s.channelName}>{s.channelName}</div>
                            </div>
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-2 line-clamp-2">{currentVideo.title}</h3>
              <p className="text-sm lg:text-lg text-gray-600 dark:text-gray-400 font-medium">{currentVideo.channelName}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut"
              }}
              className={`w-full lg:w-[40%] ${showAllVideos ? "max-h-[60vh] lg:max-h-[94vh]" : "max-h-fit"} custom-scrollbar p-4 lg:p-6 border border-gray-200 dark:border-gray-600 rounded-lg lg:rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg lg:shadow-xl`}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-4 lg:mb-6"
              >
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-2">Playlist – Videos Cardano2vn</h3>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Select a video to watch</p>
              </motion.div>

              <div
                className={`space-y-3 lg:space-y-4 ${showAllVideos ? "max-h-[45vh] lg:max-h-[70vh] overflow-y-auto" : ""} scrollbar-thick scrollbar-thumb-red-500 dark:scrollbar-thumb-red-400 scrollbar-track-gray-300 dark:scrollbar-track-gray-600 hover:scrollbar-thumb-red-600 dark:hover:scrollbar-thumb-red-300 pr-2 lg:pr-3`}
              >
                {displayedVideos.map((video, idx) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: idx * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      y: -4,
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className={`flex gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl cursor-pointer transition-all duration-200 ${
                      currentVideo.id === video.id
                        ? "bg-blue-50 dark:bg-blue-900/50 border-2 border-blue-200 dark:border-blue-700 shadow-lg"
                        : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:shadow-md"
                    }`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="relative w-24 h-16 lg:w-32 lg:h-20 shrink-0 rounded-lg overflow-hidden shadow-md">
                      <img src={getThumbnail(video)} alt={video.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between overflow-hidden flex-1">
                      <p className="text-xs lg:text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white leading-tight">{video.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{video.channelName}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {sortedVideos.length > 2 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => setShowAllVideos(!showAllVideos)}
                  className="w-full text-center text-xs lg:text-sm text-blue-600 dark:text-blue-400 hover:underline mt-3 lg:mt-4"
                >
                  {showAllVideos ? "Show Less" : "Show More"}
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      {/* <Action title="Scroll" href="#trust" /> */}
    </section>
  );
}
