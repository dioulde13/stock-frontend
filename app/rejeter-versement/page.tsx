"use client";
import { useEffect, useState } from "react";
import VersementTable from "./VersementTable";
import VersementModal from "./VersementModal";
import { APP_URL } from "../environnement/environnements";
import DashboardLayout from "../components/Layout/DashboardLayout";

export default function VersementPage() {
  const [versements, setVersements] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVersements = async () => {
     try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }

      const res = await fetch(`${APP_URL}/api/versement/liste`, 
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

      const data = await res.json();
      setVersements(data);
      console.log(data);
    } catch (error) {
      console.error("Erreur lors du fetch des catégories:", error);
    }
  };

  useEffect(() => {
    fetchVersements();
  }, []);

  const handleVersementAdded = () => {
    setIsModalOpen(false);
    fetchVersements();
  };

  return (
    <DashboardLayout title="Versement">
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-700">
              Gestion des Versements
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Nouveau versement
            </button>
          </div>

          <VersementTable versements={versements} onAction={fetchVersements} />

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
