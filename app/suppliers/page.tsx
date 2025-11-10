
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import SuppliersTable from './SuppliersTable';

export default function SuppliersPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  return (
    <DashboardLayout title="Fournisseurs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des fournisseurs</h2>
            <p className="text-gray-600">Gérez vos partenaires fournisseurs</p>
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 whitespace-nowrap">
            <i className="ri-truck-line"></i>
            <span>Ajouter un fournisseur</span>
          </button>
        </div>
        <SuppliersTable />
      </div>
    </DashboardLayout>
  );
}
