// AdminFilters interfaces
export interface AdminFiltersProps {
  searchTerm: string;
  filterType: string;
  searchPlaceholder: string;
  filterOptions: { value: string; label: string }[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

// AdminHeader interfaces
export interface AdminHeaderProps {
  title: string;
  description: string;
  buttonText?: string;
  onAddClick?: () => void;
  exportButtonText?: string;
  onExportClick?: () => void;
}

// AdminStats interfaces
export interface StatItem {
  label: string;
  value: number;
  color?: 'default' | 'green' | 'blue' | 'red';
}

export interface AdminStatsProps {
  stats: StatItem[];
}

// AdminTableSkeleton interfaces
export interface AdminTableSkeletonProps {
  columns: number;
  rows?: number;
}

// Modal interfaces
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}


// Course interfaces
export interface Course {
  id: string;
  name: string;
  image?: string;
  title?: string;
  description?: string;
  price?: string;
  location?: string;
  locationRel?: { id: string; name: string };
  startDate?: string;
  publishStatus: 'DRAFT' | 'PUBLISHED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export interface CourseEditModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    name: string,
    publishStatus: 'DRAFT' | 'PUBLISHED',
    image?: string,
    description?: string,
    price?: string,
    location?: string,
    startDate?: string,
    locationId?: string,
    locationName?: string,
  ) => void;
  isSaving: boolean;
}

export interface LandingContentFormData {
  section: string;
  title: string;
  subtitle: string;
  description: string;
  mainText: string;
  media1Url: string;
  media2Url: string;
  media3Url: string;
  media4Url: string;
  publishStatus: 'DRAFT' | 'PUBLISHED';
}

export interface LandingContentProps {
  content: {
    title: string;
    subtitle: string;
    description: string;
    mainText: string;
  };
}

export interface LandingMediaProps {
  mediaItems: string[];
}

// Welcome Modal interfaces
export interface WelcomeModalData {
  id?: string;
  title: string;
  description: string;
  imageUrl: string | null;
  buttonLink: string | null;
  startDate: string | null;
  endDate: string | null;
  publishStatus: 'DRAFT' | 'PUBLISHED';
  isActive: boolean;
} 