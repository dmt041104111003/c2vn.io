"use client";

import { useState, useEffect } from 'react';
import { useToastContext } from '~/components/toast-provider';
import { formatDateTime } from '~/constants/users';

interface SpecialReferralCode {
  id: string;
  code: string;
  name?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  referralSubmissions: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
}

interface CreateSpecialCodeFormProps {
  onSuccess: () => void;
}

interface EditSpecialCodeFormProps {
  code: SpecialReferralCode;
  onSuccess: () => void;
}

interface ViewSpecialCodeDetailsProps {
  code: SpecialReferralCode;
}

// Create Form Component
export function CreateSpecialCodeForm({ onSuccess }: CreateSpecialCodeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expiresAt: ''
  });
  const { showSuccess, showError } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/special-referral-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim() || null,
          email: formData.email.trim() || null,
          expiresAt: formData.expiresAt || null
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Special referral code created successfully');
        onSuccess();
        // Reset form
        setFormData({ name: '', email: '', expiresAt: '' });
      } else {
        showError(data.error || 'Failed to create code');
      }
    } catch (error) {
      showError('Failed to create code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Name (Optional)</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter name for this referral code"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Email (Optional)</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email for this referral code"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Expiration Date (Optional)</label>
        <input
          type="datetime-local"
          value={formData.expiresAt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, expiresAt: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          title="Select expiration date and time"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Code'}
        </button>
      </div>
    </form>
  );
}

// Edit Form Component
export function EditSpecialCodeForm({ code, onSuccess }: EditSpecialCodeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: code.name || '',
    email: code.email || '',
    isActive: code.isActive,
    expiresAt: code.expiresAt ? new Date(code.expiresAt).toISOString().slice(0, 16) : ''
  });
  const { showSuccess, showError } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/special-referral-codes/${code.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim() || null,
          email: formData.email.trim() || null,
          isActive: formData.isActive,
          expiresAt: formData.expiresAt || null
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Special referral code updated successfully');
        onSuccess();
      } else {
        showError(data.error || 'Failed to update code');
      }
    } catch (error) {
      showError('Failed to update code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Code</label>
        <input 
          type="text"
          value={code.code} 
          disabled 
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-mono"
          title="Special referral code (read-only)"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Name (Optional)</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter name for this referral code"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Email (Optional)</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email for this referral code"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Expiration Date (Optional)</label>
        <input
          type="datetime-local"
          value={formData.expiresAt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, expiresAt: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          title="Select expiration date and time"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isActive: e.target.checked })}
          title="Toggle active status"
        />
        <label htmlFor="isActive" className="text-sm font-medium">Active</label>
      </div>
      <div className="flex justify-end gap-2">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Code'}
        </button>
      </div>
    </form>
  );
}

// View Details Component
export function ViewSpecialCodeDetails({ code }: ViewSpecialCodeDetailsProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { showSuccess, showError } = useToastContext();
  
  const ITEMS_PER_PAGE = 10;

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/special-referral-codes/${code.id}/submissions?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSubmissions(data.data.submissions || []);
      } else {
        showError('Failed to fetch submissions');
      }
    } catch (error) {
      showError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [code.id, currentPage, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Code Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono block">
            {code.code}
          </code>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            code.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {code.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <span>{code.name || 'Not specified'}</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <span>{code.email || 'Not specified'}</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
          <span>{formatDateTime(code.createdAt)}</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expires</label>
          <span>{code.expiresAt ? formatDateTime(code.expiresAt) : 'Never'}</span>
        </div>
      </div>
      
      {/* Submissions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Referral Submissions</h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-4">Loading submissions...</div>
        ) : submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {submission.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(submission.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No submissions found for this code.
          </div>
        )}
      </div>
    </div>
  );
}
