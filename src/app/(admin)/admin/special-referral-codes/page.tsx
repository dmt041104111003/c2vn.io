import { Metadata } from 'next';
import { SpecialReferralCodesPageClient } from '~/components/admin/special-referral-codes/SpecialReferralCodesPageClient';

export const metadata: Metadata = {
  title: 'Special Referral Codes | Admin',
  description: 'Manage special referral codes for Cardano2VN',
};

export default function SpecialReferralCodesPage() {
  return (
    <div className="container mx-auto py-6">
      <SpecialReferralCodesPageClient />
    </div>
  );
}
