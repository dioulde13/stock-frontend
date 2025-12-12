"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UtilisateurTable from "./UtilisateurTablde";
import UtilisateurModal from "./UtilisateurModal";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";

export default function UtilisateurPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUtilisateur, setSelectedUtilisateur] = useState<any>(null);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    boutiqueId: 0,
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchAllData();
    }
    setAuthChecked(true);
  }, [router]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUtilisateurs(), fetchBoutiques()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoutiques = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const res = await fetch(`${APP_URL}/api/boutique/listeBoutiqueParAdmin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des boutiques");
      const data = await res.json();
      setBoutiques(data);
    } catch (error) {
      console.error("Erreur lors du fetch des boutiques:", error);
      showNotification("Erreur lors du chargement des boutiques", "error");
    }
  };

  const fetchUtilisateurs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const res = await fetch(`${APP_URL}/api/utilisateur/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok)
        throw new Error("Erreur lors du chargement des utilisateurs");
      const data = await res.json();
      setUtilisateurs(data);
    } catch (error) {
      console.error("Erreur lors du fetch des utilisateurs:", error);
      showNotification("Erreur lors du chargement des utilisateurs", "error");
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenModal = (utilisateur: any = null) => {
    setSelectedUtilisateur(utilisateur);
    if (utilisateur) {
      setFormData({
        nom: utilisateur.nom || "",
        email: utilisateur.email || "",
        boutiqueId: utilisateur.boutiqueId || 0,
      });
    } else {
      setFormData({
        nom: "",
        email: "",
        boutiqueId: 0,
      });
    }
    setIsModalOpen(true);
  };

  if (!authChecked) {
    return (
      <DashboardLayout title="Liste des vendeurs">
        <div>Loading…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Liste des vendeurs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des vendeurs
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter un vendeur</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-700">Chargement…</div>
        ) : (
          <UtilisateurTable
            utilisateurs={utilisateurs}
            fetchUtilisateurs={fetchUtilisateurs}
            showNotification={showNotification}
            handleOpenModal={handleOpenModal}
            formData={formData}
            setFormData={setFormData}
            selectedUtilisateur={selectedUtilisateur}
            setSelectedUtilisateur={setSelectedUtilisateur}
          />
        )}

        {isModalOpen && (
          <UtilisateurModal
            boutiques={boutiques}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            handleSubmit={async () => {
              try {
                const token = localStorage.getItem("token");
                if (!token) {
                  window.location.href = "/login";
                  return;
                }

                const payload = {
                  nom: formData.nom,
                  email: formData.email,
                  boutiqueId: Number(formData.boutiqueId),
                };

                if (!payload.boutiqueId) {
                  showNotification("Boutique non trouvée !", "error");
                  return;
                }

                let url = `${APP_URL}/api/utilisateur/create`;
                let method = "POST";

                if (selectedUtilisateur) {
                  url = `${APP_URL}/api/utilisateur/modifier/${selectedUtilisateur.id}`;
                  method = "PUT";
                }

                const res = await fetch(url, {
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(payload),
                });

                const data = await res.json();

                if (!res.ok) {
                  showNotification(data.message || "Erreur inconnue", "error");
                  return;
                }

                showNotification(
                  data.message || "Opération effectuée.",
                  "success"
                );

                await fetchUtilisateurs();

                setSelectedUtilisateur(null);
                setFormData({ nom: "", email: "", boutiqueId: 0 });
                setIsModalOpen(false);
              } catch (error) {
                console.error("Erreur API utilisateur :", error);
                showNotification(
                  "Erreur lors de la communication avec l'API",
                  "error"
                );
              }
            }}
          />
        )}

        {notification && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${
              notification.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {notification.message}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
