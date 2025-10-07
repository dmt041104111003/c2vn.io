// VideoItem interfaces
export interface VideoItem {
  id: string;
  videoId: string;
  channelName: string;
  videoUrl: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// VideoSectionEditor interfaces
export interface VideoSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
  channelName: string;
  order: number;
  isFeatured?: boolean;
  isValidUrl: boolean | null;
  isAdding: boolean;
  onVideoUrlChange: (url: string) => void;
  onVideoTitleChange: (title: string) => void;
  onChannelNameChange: (channel: string) => void;
  onOrderChange: (order: number) => void;
  onAddVideo: () => void;
  thumbnailUrl?: string;
  submitLabel?: string;
  title?: string;
  description?: string;
  onDescriptionChange?: (desc: string) => void;
}


// VideoSectionStats interfaces
export interface VideoSectionStatsProps {
  videos: VideoItem[];
}

// VideoSectionTable interfaces
export interface VideoSectionTableProps {
  videos: VideoItem[];
  modifiedVideos: { [id: string]: Partial<VideoItem> };
  onCheckboxChange: (videoId: string, field: "isFeatured", value: boolean) => void;
  onDeleteVideo: (videoId: string) => void;
  onViewDetails?: (video: VideoItem) => void;
  onEditVideo?: (video: VideoItem) => void;
}

// Video Types from types.ts
export interface Video {
  id: string;
  title: string;
  url: string;
  channelName: string;
  isYouTube?: boolean;
  thumbnailUrl?: string;
  visible: boolean;
  description?: string;
}

export interface VideoSectionData {
  sectionTitle: string;
  sectionDescription?: string;
  videos: Video[];
} 