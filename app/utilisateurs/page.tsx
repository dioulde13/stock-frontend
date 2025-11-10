"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UtilisateurTable from "./UtilisateurTablde";
import UtilisateurModal from "./UtilisateurModal";
import DashboardLayout from "../components/Layout/DashboardLayout";

export default function UtilisateurPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUtilisateur, setSelectedUtilisateur] = useState<any>(null);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    boutiqueId: 0,
  });

  useEffect(() => {
    // On client only
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      // Authenticated: fetch data
      fetchUtilisateurs();
      fetchBoutiques();
    }
    setAuthChecked(true);
  }, [router]);

  const fetchBoutiques = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Not authenticated: redirect
        window.location.href = "/login";
        return;
      }
      const res = await fetch(
        "http://localhost:3000/api/boutique/listeBoutiqueParAdmin",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des boutiques");
      }
      const data = await res.json();
      setBoutiques(data);
    } catch (error) {
      console.error("Erreur lors du fetch des boutiques:", error);
    }
  };

  const fetchUtilisateurs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const res = await fetch("http://localhost:3000/api/utilisateur/liste", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des utilisateurs");
      }
      const data = await res.json();
      setUtilisateurs(data);
    } catch (error) {
      console.error("Erreur lors du fetch des utilisateurs:", error);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
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
    // While checking auth: render a placeholder (same on server & client)
    return (
      <DashboardLayout title="Liste des clients">
        <div>Loading…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Liste des clients">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des utilisateurs
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter un client</span>
          </button>
        </div>

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

        {isModalOpen && (
          <UtilisateurModal
            boutiques={boutiques}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            handleSubmit={async () => {
              try {
                const payload = {
                  nom: formData.nom,
                  email: formData.email,
                  boutiqueId: Number(formData.boutiqueId),
                };
                if (!payload.boutiqueId) {
                  alert("Boutique non trouvée !");
                  return;
                }

                if (selectedUtilisateur) {
                  await fetch(
                    `http://localhost:3000/api/utilisateur/${selectedUtilisateur.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(payload),
                    }
                  );
                  showNotification("Utilisateur modifié avec succès.");
                } else {
                  await fetch("http://localhost:3000/api/utilisateur/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                  });
                  showNotification("Utilisateur ajouté avec succès.");
                }

                await fetchUtilisateurs();
                setSelectedUtilisateur(null);
                setFormData({
                  nom: "",
                  email: "",
                  boutiqueId: 0,
                });
                setIsModalOpen(false);
              } catch (error) {
                console.error("Erreur API utilisateur :", error);
              }
            }}
          />
        )}

        {notification && (
          <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {notification}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
