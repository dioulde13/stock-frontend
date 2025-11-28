"use client";
import { useEffect, useState } from "react";
import RechargementTable from "./RechargementTable";
import RechargementModal from "./RechargementModal";
import { APP_URL } from "../environnement/environnements";
import DashboardLayout from "../components/Layout/DashboardLayout";

export default function RechargementPage() {
  const [rechargments, setRechargments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // loader activé au démarrage
  const [boutiques, setBoutiques] = useState<any[]>([]);


  const fetchBoutiques = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const res = await fetch(
        `${APP_URL}/api/boutique/listeBoutiqueParAdmin`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Erreur lors du chargement des boutiques");
      const data = await res.json();
      setBoutiques(data);
    } catch (error) {
      console.error("Erreur lors du fetch des boutiques:", error);
    }
  };

  const fetchRechargments = async () => {
    // setLoading(true); // on active le loader avant le fetch
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${APP_URL}/api/rechargement/liste`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setRechargments(data);
      console.log(data);
    } catch (error) {
      console.error("Erreur lors du fetch des versements:", error);
    } finally {
      setLoading(false); // on désactive le loader après le fetch
    }
  };

  useEffect(() => {
    fetchRechargments();
    fetchBoutiques();
  }, []);

  const handleRechargementAdded = () => {
    setIsModalOpen(false);
    fetchRechargments();
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
    <DashboardLayout title="Rechargement">
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Nouveau
            </button>
          </div>

          <div className="overflow-x-auto">
            <RechargementTable rechargement={rechargments}  onAction={fetchRechargments} />
          </div>

          {isModalOpen && (
            <RechargementModal
            boutiques={boutiques}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleRechargementAdded}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
