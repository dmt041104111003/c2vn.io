"use client";

import React, { useState } from 'react';
import { LandingContentFormData } from '~/constants/admin';
import { TipTapEditor } from '~/components/ui/tiptap-editor';

interface ContentSectionProps {
  formData: LandingContentFormData;
  setFormData: React.Dispatch<React.SetStateAction<LandingContentFormData>>;
}

export default function ContentSection({ formData, setFormData }: ContentSectionProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'mainText'>('description');

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Content
      </h4>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subtitle
            </label>
            <input
              id="subtitle"
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Enter subtitle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Tab System for Description and Main Text */}
        <div className="space-y-4">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`px-3 py-1 rounded-t border-b-2 ${
                activeTab === 'description' 
                  ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-gray-700 dark:text-emerald-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mainText')}
              className={`px-3 py-1 rounded-t border-b-2 ${
                activeTab === 'mainText' 
                  ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-gray-700 dark:text-emerald-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              Main Text
            </button>
          </div>

          <div className="space-y-2">
            {activeTab === 'description' && (
              <>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <TipTapEditor
                  content={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Enter description..."
                />
              </>
            )}

            {activeTab === 'mainText' && (
              <>
                <label htmlFor="mainText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Main Text
                </label>
                <TipTapEditor
                  content={formData.mainText}
                  onChange={(content) => setFormData({ ...formData, mainText: content })}
                  placeholder="Enter main text..."
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 