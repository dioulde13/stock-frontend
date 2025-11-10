
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import DashboardStats from './DashboardStats';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
   
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  return (
    <DashboardLayout title="Tableau de bord">
      <div className="space-y-6">
        <DashboardStats />
      </div>
    </DashboardLayout>
  );
}
