import { useRef, useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import { BlogFiltersProps } from '~/constants/posts';

export default function BlogFilters({
  search, setSearch,
  selectedTags, setSelectedTags,
  allTags
}: BlogFiltersProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTagToggle = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
  };
  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <input
          type="text"
          placeholder="Search by title..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-white/30 bg-white dark:bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/60 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="relative w-full" ref={dropdownRef}>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                handleTagToggle(val);
                e.currentTarget.selectedIndex = 0;
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/30 bg-white dark:bg-transparent text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              title="Select tag"
            >
              <option value="">Select tags...</option>
              {allTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTags.map(tagId => {
                const tag = allTags.find(t => t.id === tagId);
                return tag ? (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30"
                  >
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      title={`Remove ${tag.name} tag`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 