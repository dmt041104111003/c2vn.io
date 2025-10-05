"use client";

import React, { useState } from 'react';
import { MediaInputMedia, MediaInputProps } from '~/constants/media';
import { useToastContext } from '~/components/toast-provider';

export default function MediaInput({ onMediaAdd, onMediaAddMany, mediaType = 'image', multiple = false, showVideoLibrary = true, showYouTubeInput = false, showImageLibrary = true, showImageInputs = true }: MediaInputProps) {
  const [currentMedia, setCurrentMedia] = useState<MediaInputMedia | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<'upload' | 'url' | 'library'>(showImageInputs ? 'upload' : 'url');
  const [activeLibraryTab, setActiveLibraryTab] = useState<'images' | 'videos'>(showImageLibrary ? 'images' : 'videos');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showSuccess } = useToastContext();
  
  // Media library states
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const clearMedia = () => {
    setCurrentMedia(null);
    setImageUrl('');
    setYoutubeUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const uploaded: MediaInputMedia[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (response.ok && result.data?.media?.url) {
          const media: MediaInputMedia = { 
            type: 'image', 
            url: result.data.media.url, 
            id: result.data.media.public_id || result.data.media.url 
          };
          uploaded.push(media);
          setCurrentMedia(media);
          if (onMediaAdd && !multiple) onMediaAdd(media);
        } else {
          alert(result.error || 'Upload failed');
        }
      } catch (err) {
        alert('Upload error');
      }
    }

    if (multiple && uploaded.length > 0 && onMediaAddMany) {
      onMediaAddMany(uploaded);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchMediaLibrary = async () => {
    setMediaLoading(true);
    try {
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const data = await response.json();
        setMediaList(data.data?.media || []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSelectFromLibrary = (mediaItem: any) => {
    const isImage = mediaItem?.mimeType?.startsWith('image/');
    const isYouTube = mediaItem?.type === 'YOUTUBE' || String(mediaItem?.mimeType || '').toLowerCase().includes('youtube');
    const isVideoFile = mediaItem?.mimeType?.startsWith('video/');

    let media: MediaInputMedia;
    if (isYouTube || isVideoFile) {
      const url = mediaItem.path || mediaItem.url;
      const youtubeId = getYoutubeIdFromUrl(url || '');
      media = {
        id: youtubeId || mediaItem.id,
        url: url,
        type: 'youtube'
      };
    } else if (isImage) {
      media = {
        id: mediaItem.id,
        url: mediaItem.path,
        type: 'image'
      };
    } else {
      media = {
        id: mediaItem.id,
        url: mediaItem.path,
        type: 'image'
      };
    }

    setCurrentMedia(media);
    if (onMediaAdd) onMediaAdd(media);
  };

  const handleImageUrl = async (url: string) => {
    setImageUrl(url);
    if (!url) return;
    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type: 'IMAGE' }),
      });
      const result = await response.json();
      if (response.ok && result.data?.media?.url) {
        const media: MediaInputMedia = { 
          type: 'image', 
          url: result.data.media.url, 
          id: result.data.media.id || result.data.media.url 
        };
        setCurrentMedia(media);
        if (onMediaAdd) onMediaAdd(media);
        setImageUrl('');
      } else {
        alert(result.error || 'Failed to add image URL');
      }
    } catch (err) {
      alert('Error adding image URL');
    }
  };

  return (
    <div className="space-y-4">
      {mediaType === 'image' && (
        <>
          <div className="flex gap-2 mb-2">
            {showImageInputs && (
              <button
                type="button"
                className={`px-3 py-1 rounded-t border-b-2 ${activeImageTab === 'upload' ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-gray-700 dark:text-emerald-400' : 'border-transparent text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'}`}
                onClick={() => setActiveImageTab('upload')}
              >
                Upload
              </button>
            )}
            <button
              type="button"
              className={`px-3 py-1 rounded-t border-b-2 ${activeImageTab === 'url' ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-gray-700 dark:text-emerald-400' : 'border-transparent text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'}`}
              onClick={() => setActiveImageTab('url')}
            >
              Paste URL
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-t border-b-2 ${activeImageTab === 'library' ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-gray-700 dark:text-emerald-400' : 'border-transparent text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'}`}
              onClick={() => {
                setActiveImageTab('library');
                if (mediaList.length === 0) {
                  fetchMediaLibrary();
                }
              }}
            >
              Library
            </button>
          </div>
          {activeImageTab === 'upload' && showImageInputs && (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image from your computer"
              >
                Upload image
              </button>
              <input
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                title="Upload image from your computer"
                placeholder="Choose image file..."
              />
            </div>
          )}
          {activeImageTab === 'url' && (
            <div className="flex flex-col items-center gap-2 w-full">
              {showImageInputs && (
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Paste image URL here..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  onBlur={() => handleImageUrl(imageUrl)}
                />
              )}
              
              {showYouTubeInput && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or paste YouTube video link:
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Paste YouTube video link here..."
                    value={youtubeUrl}
                    onChange={e => {
                      const url = e.target.value;
                      setYoutubeUrl(url);
                      if (url && onMediaAdd) {
                        const youtubeId = getYoutubeIdFromUrl(url);
                        if (youtubeId) {
                          const media: MediaInputMedia = {
                            type: 'youtube',
                            url: url,
                            id: youtubeId
                          };
                          setCurrentMedia(media);
                          onMediaAdd(media);
                        }
                      }
                    }}
                  />
                  {currentMedia?.type === 'youtube' && currentMedia.id && (
                    <div className="mt-2">
                      <div className="youtube-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${currentMedia.id}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-48 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeImageTab === 'library' && (
            <div className="space-y-4">
              {/* Library sub-tabs */}
              <div className="flex gap-2">
                {showImageLibrary && (
                  <button
                    type="button"
                    className={`px-3 py-1 rounded border ${
                      activeLibraryTab === 'images' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                    }`}
                    onClick={() => setActiveLibraryTab('images')}
                  >
                    Images
                  </button>
                )}
                {showVideoLibrary && (
                  <button
                    type="button"
                    className={`px-3 py-1 rounded border ${
                      activeLibraryTab === 'videos' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                    }`}
                    onClick={() => setActiveLibraryTab('videos')}
                  >
                    Videos
                  </button>
                )}
              </div>

              {mediaLoading ? (
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg scrollbar-hide">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-8 rounded-t-lg"></div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-600">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg scrollbar-hide">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {activeLibraryTab === 'images' ? 'Image' : 'Video'}
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {mediaList
                        .filter(item => {
                          if (activeLibraryTab === 'images') {
                            return item.mimeType?.startsWith('image/');
                          } else {
                            return item.mimeType?.startsWith('video/') || item.type === 'YOUTUBE';
                          }
                        })
                        .slice(0, 10)
                        .map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2">
                            <div className="flex-shrink-0 h-10 w-10">
                              {activeLibraryTab === 'images' ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={item.path}
                                  alt={item.originalName}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-xs">🎥</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div
                              className="text-sm text-gray-900 dark:text-white truncate max-w-32 cursor-pointer hover:underline"
                              title="Click to copy URL"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(item.path);
                                  setCopiedId(item.id);
                                  showSuccess('Copied', 'URL copied to clipboard');
                                  setTimeout(() => setCopiedId(null), 1200);
                                } catch {}
                              }}
                            >
                              {item.originalName}
                            </div>
                            <div
                              className="text-xs truncate max-w-32 cursor-pointer hover:underline text-blue-600 dark:text-blue-400"
                              title={copiedId === item.id ? 'Copied!' : item.path}
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(item.path);
                                  setCopiedId(item.id);
                                  showSuccess('Copied', 'URL copied to clipboard');
                                  setTimeout(() => setCopiedId(null), 1200);
                                } catch {}
                              }}
                            >
                              {copiedId === item.id ? 'Copied!' : item.path.split('/').pop()}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => handleSelectFromLibrary(item)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mediaList.filter(item => {
                    if (activeLibraryTab === 'images') {
                      return item.mimeType?.startsWith('image/');
                    } else {
                      return item.mimeType?.startsWith('video/') || item.type === 'YOUTUBE';
                    }
                  }).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No {activeLibraryTab} found in library
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {currentMedia?.type === 'image' && currentMedia.url && (
            <div className="flex flex-col items-center gap-2">
              <img
                src={currentMedia.url}
                alt="Preview"
                className="max-w-full max-h-48 rounded-lg shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                    fallback.classList.add('flex');
                  }
                }}
              />
              <div className="hidden max-w-full max-h-48 rounded-lg shadow-md bg-gray-100 dark:bg-gray-700 items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500">Image not available</span>
              </div>
              <button
                type="button"
                onClick={clearMedia}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove Image
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getYoutubeIdFromUrl(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/#\s]{11})/);
  return match ? match[1] : '';
} 