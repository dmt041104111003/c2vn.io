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
  const [newPrice, setNewPrice] = useState('free');
  const [selectedPriceType, setSelectedPriceType] = useState('free');
  const [customPrice, setCustomPrice] = useState('');
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const formatDateDMY = (val: string) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      const [y, m, day] = val.split('-');
      if (y && m && day) return `${day.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`;
      return val;
    }
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };
  const [publishStatus, setPublishStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  const createMutation = useMutation({
    mutationFn: async ({ name, image, description, price, locationId, locationName, startDate, publishStatus }: { name: string; image?: string; description?: string; price?: string; locationId?: string; locationName?: string; startDate?: string; publishStatus: 'DRAFT' | 'PUBLISHED' }) => {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image, description, price, locationId, locationName, startDate, publishStatus })
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
      setNewPrice('free');
      setSelectedPriceType('free');
      setCustomPrice('');
      setSelectedLocationId('');
      setNewLocationName('');
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
    
    const isOther = selectedLocationId === '__OTHER__';
    if (isOther) {
      const exists = locations.some(l => l.name.trim().toLowerCase() === newLocationName.trim().toLowerCase());
      if (exists) {
        showError('Location name already exists. Please select it from the dropdown.');
        return;
      }
    }

    if (selectedPriceType === 'custom' && (!customPrice || customPrice.trim() === '')) {
      showError('Please enter a custom price');
      return;
    }
    
    const finalPrice = selectedPriceType === 'free' ? 'free' : (customPrice || 'free');
    
    createMutation.mutate({ 
      name: newName.trim(), 
      image: newImage, 
      description: newDescription.trim(), 
      price: finalPrice,
      ...(selectedLocationId && selectedLocationId !== '__OTHER__' ? { locationId: selectedLocationId } : {} as any),
      ...(isOther && newLocationName.trim() ? { locationName: newLocationName.trim() } : {} as any),
      startDate: newStartDate || undefined,
      publishStatus: publishStatus 
    });
  };
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/locations');
        if (!res.ok) return;
        const data = await res.json();
        setLocations(Array.isArray(data?.data) ? data.data : []);
      } catch {}
    };
    load();
  }, []);

  const handleMediaSelect = (media: { id: string; url: string; type: string }) => {
    setNewImage(media.url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter course name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price
            </label>
            <select
              value={selectedPriceType}
              onChange={(e) => setSelectedPriceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select price type"
            >
              <option value="free">Free</option>
              <option value="custom">Custom Price</option>
            </select>
            {selectedPriceType === 'custom' && (
              <div className="mt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={customPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setCustomPrice(value);
                      } else {
                        const regex = /^\d*\.?\d{0,2}$/;
                        if (regex.test(value)) {
                          setCustomPrice(value);
                        }
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                    ₳
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter amount in ADA (max 2 decimal places)
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location (Optional)
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select existing location"
            >
              <option value="">Select existing location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
              <option value="__OTHER__">Others...</option>
            </select>
            {selectedLocationId === '__OTHER__' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="Enter new Location name (unique)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
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
            {newStartDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDateDMY(newStartDate)}</p>
            )}
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

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={publishStatus}
              onChange={(e) => setPublishStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select publish status"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500 dark:border-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors font-medium"
            >
              {createMutation.isPending ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
