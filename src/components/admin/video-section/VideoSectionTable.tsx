"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Trash2, Eye, Edit } from "lucide-react";
import { useToastContext } from "~/components/toast-provider";
import Modal from "../common/Modal";
import { VideoItem, VideoSectionTableProps } from "~/constants/video-section";

export function VideoSectionTable({ 
  videos, 
  modifiedVideos, 
  onCheckboxChange, 
  onDeleteVideo,
  onViewDetails,
  onEditVideo
}: VideoSectionTableProps) {
  const { showSuccess } = useToastContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedVideoToDelete, setSelectedVideoToDelete] = React.useState<VideoItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string>("");
  const [previewTitle, setPreviewTitle] = React.useState<string>("");

  function getYoutubeIdFromUrl(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)\s*([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function getThumbnailSrc(video: VideoItem): string {
    const id = getYoutubeIdFromUrl(video.videoUrl) || (video.videoId && video.videoId.length === 11 ? video.videoId : null);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    if (video.thumbnailUrl && video.thumbnailUrl.trim() !== '') return video.thumbnailUrl.trim();
    return '/images/common/loading.png';
  }

  const handleCopyChannel = async (channelUrl: string) => {
    try {
      await navigator.clipboard.writeText(channelUrl);
      showSuccess("Copied", "Channel URL copied to clipboard");
    } catch {}
  };

  const handleViewDetails = (video: VideoItem) => {
    if (onViewDetails) {
      onViewDetails(video);
    } else {
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
    }
  };

  const handleDeleteClick = (video: VideoItem) => {
    setSelectedVideoToDelete(video);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedVideoToDelete) {
      onDeleteVideo(selectedVideoToDelete.id);
      setIsDeleteModalOpen(false);
      setSelectedVideoToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(videos) && videos.length > 0 ? (
              videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${video.isFeatured ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
                      {video.isFeatured ? '0 (Featured)' : (video.order || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={getThumbnailSrc(video)} 
                      alt={video.title} 
                      width={80} 
                      height={45} 
                      className="rounded object-cover cursor-pointer" 
                      onClick={() => { 
                        setPreviewSrc(getThumbnailSrc(video)); 
                        const t = (video.title || '').trim();
                        const truncated = t.length > 60 ? `${t.slice(0, 60)}...` : t;
                        setPreviewTitle(truncated);
                        setIsPreviewOpen(true); 
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/images/common/loading.png`;
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={video.title}>
                      {video.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline max-w-sm truncate text-left"
                      title={video.channelName}
                      onClick={() => handleCopyChannel(video.channelName)}
                    >
                      {video.channelName}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={modifiedVideos[video.id]?.isFeatured ?? video.isFeatured}
                      onCheckedChange={(value) => onCheckboxChange(video.id, "isFeatured", !!value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditVideo && onEditVideo(video)}
                        className="h-8 w-8 p-0"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(video)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(video)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No videos found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Video"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Video</h3>
              <p className="text-sm text-gray-600">Are you sure you want to delete this video?</p>
            </div>
          </div>
          
          {selectedVideoToDelete && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Video to delete:</p>
              <p className="font-medium text-gray-900">{selectedVideoToDelete.title}</p>
              <p className="text-sm text-gray-500">Channel: {selectedVideoToDelete.channelName}</p>
            </div>
          )}
          
          <p className="text-sm text-red-600 font-medium">
            This action cannot be undone.
          </p>
          
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={previewTitle || "Image Preview"}
      >
        <div className="space-y-4">
          <img
            src={previewSrc || '/images/common/loading.png'}
            alt="Preview"
            className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/common/loading.png';
            }}
          />
        </div>
      </Modal>
    </div>
  );
} 