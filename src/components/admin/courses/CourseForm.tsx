"use client";

import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastContext } from '~/components/toast-provider';
import MediaInput from '~/components/ui/media-input';
import { TipTapEditor } from '~/components/ui/tiptap-editor';
import { Course } from '~/constants/admin';

interface CourseFormProps {
  courses?: Course[];
  onSuccess?: () => void;
}

export default function CourseForm({ courses = [], onSuccess }: CourseFormProps) {
  const { showSuccess, showError } = useToastContext();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [publishStatus, setPublishStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch('/api/admin/courses', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const list: any[] = Array.isArray(data?.data) ? data.data : [];
        const names: string[] = list
          .map((c: any) => (typeof c?.location === 'string' ? c.location.trim() : ''))
          .filter((v: string) => v.length > 0);
        const unique = Array.from(new Set(names)) as string[];
        unique.sort((a: string, b: string) => a.localeCompare(b));
        setLocations(unique as string[]);
      } catch {}
    };
    loadLocations();
  }, []);

  const createMutation = useMutation({
    mutationFn: async ({ name, image, description, location, startDate, publishStatus }: { name: string; image?: string; description?: string; location?: string; startDate?: string; publishStatus: 'DRAFT' | 'PUBLISHED' }) => {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image, description, location, startDate, publishStatus })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['contact-form-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey.some(key => 
          typeof key === 'string' && 
          (key.includes('course') || key.includes('Course'))
        )
      });
      setNewName('');
      setNewImage('');
      setNewDescription('');
      setNewLocation('');
      setNewStartDate('');
      setPublishStatus('DRAFT');
      showSuccess('Course created successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      showError(error.message);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showError('Course name is required');
      return;
    }
    
    const isDuplicate = courses?.some(
      (course: Course) => course.name.toLowerCase() === newName.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      showError('Course with this name already exists');
      return;
    }
    
    const finalLocation = useCustomLocation ? customLocation.trim() : newLocation.trim();
    if (useCustomLocation && locations.some(l => l.toLowerCase() === finalLocation.toLowerCase())) {
      showError('Location already exists. Please select it from the dropdown.');
      return;
    }
    createMutation.mutate({ 
      name: newName.trim(), 
      image: newImage, 
      description: newDescription.trim(), 
      location: finalLocation || undefined,
      startDate: newStartDate || undefined,
      publishStatus: publishStatus 
    });
  };

  const handleMediaSelect = (media: { id: string; url: string; type: string }) => {
    setNewImage(media.url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter course name"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={publishStatus}
            onChange={(e) => setPublishStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Select publish status"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500 dark:border-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors font-medium whitespace-nowrap"
          >
            {createMutation.isPending ? 'Adding...' : 'Add'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location (Optional)
            </label>
            {!useCustomLocation ? (
              <select
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select location"
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter new location"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <input
                id="toggle-custom-location-create"
                type="checkbox"
                checked={useCustomLocation}
                onChange={(e) => setUseCustomLocation(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="toggle-custom-location-create">Enter a new location</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select start date"
            />
          </div>
        </div>
        <div>
          <TipTapEditor
            content={newDescription}
            onChange={setNewDescription}
            placeholder="Course description (optional)"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Course Image (Optional)
          </label>
          <MediaInput
            onMediaAdd={handleMediaSelect}
            mediaType="image"
            showVideoLibrary={false}
          />
          {newImage && (
            <div className="mt-2">
              <img
                src={newImage}
                alt="Selected course image"
                className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
