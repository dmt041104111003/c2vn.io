"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminHeader } from '~/components/admin/common/AdminHeader';
import { AdminFilters } from '~/components/admin/common/AdminFilters';
import { Pagination } from '~/components/ui/pagination';
import Modal from '~/components/admin/common/Modal';
import { useToastContext } from '~/components/toast-provider';
import AdminTableSkeleton from '~/components/admin/common/AdminTableSkeleton';
import NotFoundInline from '~/components/ui/not-found-inline';
import { SpecialReferralCodesTable } from './SpecialReferralCodesTable';
import { CreateSpecialCodeForm, EditSpecialCodeForm, ViewSpecialCodeDetails } from './SpecialReferralCodeForms';

interface SpecialReferralCode {
  id: string;
  code: string;
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

interface SpecialReferralCodesPageClientProps {
  initialCodes?: SpecialReferralCode[];
}

export function SpecialReferralCodesPageClient({ initialCodes = [] }: SpecialReferralCodesPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<SpecialReferralCode | null>(null);
  const { showSuccess, showError } = useToastContext();
  
  const ITEMS_PER_PAGE = 10;

  const {
    data: queryData,
    isLoading: loading,
    refetch: fetchCodes,
  } = useQuery({
    queryKey: ['admin-special-referral-codes', currentPage, searchTerm, filterType],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { isActive: filterType })
      });

      const res = await fetch(`/api/admin/special-referral-codes?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch special referral codes');
      return res.json();
    }
  });

  const codes = queryData?.data?.codes || [];
  const totalPages = queryData?.data?.pagination?.totalPages || 1;

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchCodes();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedCode(null);
    fetchCodes();
  };

  const handleEdit = (code: SpecialReferralCode) => {
    setSelectedCode(code);
    setShowEditModal(true);
  };

  const handleView = (code: SpecialReferralCode) => {
    setSelectedCode(code);
    setShowViewModal(true);
  };

  const handleDelete = async (codeId: string) => {
    try {
      const response = await fetch(`/api/admin/special-referral-codes/${codeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Special referral code deleted successfully');
        fetchCodes();
      } else {
        showError(data.error || 'Failed to delete code');
      }
    } catch (error) {
      showError('Failed to delete code');
    }
  };


  const copyToClipboard = (code: string) => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}#contact#code=${code}`;
    navigator.clipboard.writeText(referralLink);
    showSuccess('Referral link copied to clipboard');
  };

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Special Referral Codes"
        description="Manage special referral codes"
        buttonText="Create Code"
        onAddClick={() => setShowCreateModal(true)}
      />

      <AdminFilters
        searchTerm={searchTerm}
        filterType={filterType}
        searchPlaceholder="Search codes..."
        filterOptions={filterOptions}
        onSearchChange={setSearchTerm}
        onFilterChange={(value) => setFilterType(value as 'all' | 'active' | 'inactive')}
      />

      {loading ? (
        <AdminTableSkeleton columns={6} />
      ) : codes.length === 0 ? (
        <NotFoundInline />
      ) : (
        <SpecialReferralCodesTable
          codes={codes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCopyCode={copyToClipboard}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Special Referral Code"
      >
        <CreateSpecialCodeForm onSuccess={handleCreateSuccess} />
      </Modal>

      {/* Edit Modal */}
      {selectedCode && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCode(null);
          }}
          title="Edit Special Referral Code"
        >
          <EditSpecialCodeForm code={selectedCode} onSuccess={handleEditSuccess} />
        </Modal>
      )}

      {/* View Modal */}
      {selectedCode && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCode(null);
          }}
          title="Special Referral Code Details"
          size="large"
        >
          <ViewSpecialCodeDetails code={selectedCode} />
        </Modal>
      )}
    </div>
  );
}
