"use client";
import { useEffect, useState } from "react";
import VersementTable from "./VersementTable";
import VersementModal from "./VersementModal";
import { APP_URL } from "../environnement/environnements";
import DashboardLayout from "../components/Layout/DashboardLayout";

interface Utilisateur {
  role: string;
}

export default function VersementPage() {
  const [versements, setVersements] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // loader activé au démarrage

  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);

  const fetchVersements = async () => {
    // setLoading(true); // on active le loader avant le fetch
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${APP_URL}/api/versement/liste`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setVersements(data);
      console.log(data);
    } catch (error) {
      console.error("Erreur lors du fetch des versements:", error);
    } finally {
      setLoading(false); // on désactive le loader après le fetch
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("utilisateur");
    if (stored) {
      const parsed = JSON.parse(stored);
      //  console.log(parsed);
      setUtilisateur(parsed);
    }
    fetchVersements();
  }, []);

  const handleVersementAdded = () => {
    setIsModalOpen(false);
    fetchVersements();
  };

  if (loading) {
    return (
      <DashboardLayout title="Chargement...">
        <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse">
          Chargement des données...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Versement">
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="bg-white shadow-md rounded-xl p-6">
          <>
            {utilisateur?.role !== "ADMIN" ? (
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  + Nouveau
                </button>
              </div>
            ) : (
              ""
            )}
          </>

          <div className="overflow-x-auto">
            <VersementTable
              versements={versements}
              onAction={fetchVersements}
            />
          </div>

          {isModalOpen && (
            <VersementModal
              onClose={() => setIsModalOpen(false)}
              onAdd={handleVersementAdded}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
