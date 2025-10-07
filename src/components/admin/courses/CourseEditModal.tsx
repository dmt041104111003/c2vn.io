import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { CourseEditModalProps } from '~/constants/admin';
import MediaInput from '~/components/ui/media-input';
import { TipTapEditor } from '~/components/ui/tiptap-editor';

export default function CourseEditModal({ 
  course, 
  isOpen, 
  onClose, 
  onSave,
  isSaving
}: CourseEditModalProps) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('free');
  const [selectedPriceType, setSelectedPriceType] = useState('free');
  const [customPrice, setCustomPrice] = useState('');
  const [location, setLocation] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  
  const [startDate, setStartDate] = useState('');
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
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/locations');
        if (!res.ok) return;
        const data = await res.json();
        setLocations(Array.isArray(data?.data) ? data.data : []);
      } catch {}
    };
    if (isOpen) load();
  }, [isOpen]);
  useEffect(() => {
    const load = async () => {
      if (!course?.id) return;
      try {
        const res = await fetch(`/api/admin/courses/${course.id}`);
        if (!res.ok) return;
        const data = await res.json();
        const c = data?.data || course;
        setName(c.name);
        setImage(c.image || '');
        setDescription(c.description || '');
        setPrice(c.price || 'free');
        setSelectedPriceType(c.price === 'free' || !c.price ? 'free' : 'custom');
        setCustomPrice(c.price === 'free' || !c.price ? '' : c.price);
        setLocation(c.location || '');
        if (c.startDate) {
          const d = new Date(c.startDate);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          setStartDate(`${y}-${m}-${day}`);
        } else {
          setStartDate('');
        }
        setPublishStatus(c.publishStatus || 'DRAFT');
        if (c.locationRel?.id) setSelectedLocationId(c.locationRel.id);
        if (c.locationRel?.name) setLocationName(c.locationRel.name);
      } catch {}
    };
    if (isOpen) load();
  }, [course, isOpen]);

  

  const handleSave = () => {
    if (!course || !name.trim()) return;
    const isOther = selectedLocationId === '__OTHER__';
    if (isOther) {
      const exists = locations.some(l => l.name.trim().toLowerCase() === locationName.trim().toLowerCase());
      if (exists) return;
    }
    
    if (selectedPriceType === 'custom' && (!customPrice || customPrice.trim() === '')) {
      return;
    }
    
    const finalPrice = selectedPriceType === 'free' ? 'free' : (customPrice || 'free');
    
    onSave(
      course.id,
      name.trim(),
      publishStatus,
      image,
      description?.trim() || '',
      finalPrice,
      location?.trim() || '',
      startDate,
      selectedLocationId && selectedLocationId !== '__OTHER__' ? selectedLocationId : undefined,
      isOther && locationName?.trim() ? locationName.trim() : undefined,
    );
  };

  const handleMediaSelect = (media: { id: string; url: string; type: string }) => {
    setImage(media.url);
  };

  const handleClose = () => {
    setName('');
    setImage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Course"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select start date"
            />
            {startDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDateDMY(startDate)}</p>
            )}
          </div>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course Description (Optional)
          </label>
          <TipTapEditor
            content={description}
            onChange={setDescription}
            placeholder="Enter course description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Publish Status
          </label>
          <select
            value={publishStatus}
            onChange={(e) => setPublishStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Select publish status"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course Image (Optional)
          </label>
          <MediaInput
            onMediaAdd={handleMediaSelect}
            mediaType="image"
            showVideoLibrary={false}
          />
          {image && (
            <div className="mt-2">
              <img
                src={image}
                alt="Selected course image"
                className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500 dark:border-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors font-medium"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
} 