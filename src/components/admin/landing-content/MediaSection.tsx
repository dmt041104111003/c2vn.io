"use client";

import React, { useState, useRef } from 'react';
import { LandingContentFormData } from '~/constants/admin';
import { useToastContext } from '~/components/toast-provider';

interface MediaSectionProps {
  formData: Pick<LandingContentFormData, 'media1Url' | 'media2Url' | 'media3Url' | 'media4Url'>;
  setFormData: React.Dispatch<React.SetStateAction<LandingContentFormData>>;
  handleMediaSelect: (media: { id: string; url: string; type: string }) => void;
  handleRemoveMedia: (index: number) => void;
}

export default function MediaSection({ formData, setFormData, handleMediaSelect, handleRemoveMedia }: MediaSectionProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const bulkUploadRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastContext();

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showError('Please drop an image file');
      return;
    }

    await uploadFile(file, index);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await uploadFile(file, index);
    

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const uploadFile = async (file: File, index: number) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.data?.media?.url) {
        const mediaField = `media${index + 1}Url` as keyof typeof formData;
        setFormData(prev => ({
          ...prev,
          [mediaField]: result.data.media.url
        }));
        
        showSuccess('Image uploaded successfully');
      } else {
        showError(result.error || 'Upload failed');
      }
    } catch (error) {
      showError('Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInput = async (url: string, index: number) => {
    if (!url.trim()) return;
    
    setIsUploading(true);
    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type: 'IMAGE' }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.data?.media?.url) {
        const mediaField = `media${index + 1}Url` as keyof typeof formData;
        setFormData(prev => ({
          ...prev,
          [mediaField]: result.data.media.url
        }));
        
        showSuccess('Image URL added successfully');
      } else {
        showError(result.error || 'Failed to add image URL');
      }
    } catch (error) {
      showError('Error adding image URL');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showError('Please select image files only');
      return;
    }

    if (imageFiles.length > 4) {
      showError('Maximum 4 images allowed');
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = imageFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (response.ok && result.data?.media?.url) {
          return {
            index,
            url: result.data.media.url
          };
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      });

      const results = await Promise.all(uploadPromises);

      const newFormData = { ...formData };
      results.forEach(({ index, url }) => {
        const mediaField = `media${index + 1}Url` as keyof typeof formData;
        newFormData[mediaField] = url;
      });
      
      setFormData(prev => ({
        ...prev,
        ...newFormData
      }));

      showSuccess(`Successfully uploaded ${results.length} image(s)`);
    } catch (error) {
      showError('Bulk upload failed');
    } finally {
      setIsUploading(false);
      // Reset input
      if (bulkUploadRef.current) {
        bulkUploadRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Media
      </h4>
      
      <div className="space-y-4">
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Drag & Drop Images (up to 4) or click to upload
              </label>
              <button
                type="button"
                onClick={() => bulkUploadRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center px-3 py-2 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Multiple
              </button>
            </div>
            
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBulkUpload}
              ref={bulkUploadRef}
              className="hidden"
              aria-label="Upload multiple images"
            />
            
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((index) => {
                const mediaField = `media${index + 1}Url` as keyof typeof formData;
                const mediaUrl = formData[mediaField];
                const isDragOver = dragOverIndex === index;
                
                return (
                  <div key={index} className="space-y-2">
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                        isDragOver
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {mediaUrl ? (
                        <div className="relative group">
                          <img
                            src={mediaUrl}
                            alt={`Media ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove media"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                          <div className="text-gray-400 dark:text-gray-500 mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Drop image here or
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[index]?.click()}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            disabled={isUploading}
                          >
                            click to upload
                          </button>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, index)}
                        ref={(el) => { fileInputRefs.current[index] = el; }}
                        className="hidden"
                        aria-label={`Upload image for media ${index + 1}`}
                      />
                    </div>
                    
                    {/* URL Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Or paste URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        onBlur={(e) => handleUrlInput(e.target.value, index)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {isUploading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 