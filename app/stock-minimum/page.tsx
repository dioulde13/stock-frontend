'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import StockMinimumTable from './StockMinimumTable';

export default function MouvementPage() {
  const router = useRouter();
  const [stockMinimum, setStockMinimum] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const token = localStorage.getItem('token');

    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    fetchStockMinimum(token);
  }, [router]);

  const fetchStockMinimum = async (token: string) => {
  try {
     if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
    const res = await fetch('http://localhost:3000/api/produit/alert', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des données.');
    }

    const data = await res.json();

    // Filtrer les produits dont le status est "ANNULER"
    const filteredData = data.filter((produit: any) => produit.status !== 'ANNULER');

    setStockMinimum(filteredData);
    console.log(filteredData);

    setError(null);
  } catch (err: any) {
    console.error('Erreur lors du fetch:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <DashboardLayout title="Chargement...">
        <div className="flex justify-center items-center h-64 text-gray-500">
          Chargement des données...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Erreur">
        <div className="text-red-600 text-center mt-10">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Liste des stocks minimum">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des stocks minimum
          </h2>
        </div>
        <StockMinimumTable stockMinimum={stockMinimum} />
      </div>
    </DashboardLayout>
  );
}
