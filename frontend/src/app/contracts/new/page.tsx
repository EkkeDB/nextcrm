// File: src/app/contracts/new/page.tsx

'use client';

import { AuthGuard } from '@/components/guards/AuthGuard';
import ContractForm from './components/ContractForm';

function NewContractContent() {
  return <ContractForm />;
}

export default function NewContractPage() {
  return (
    <AuthGuard>
      <NewContractContent />
    </AuthGuard>
  );
}