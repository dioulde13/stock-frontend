"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategorieTable from "./CategorieTable";
import CategorieModal from "./CategorieModal";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";

export default function CategoriePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({ nom: "", utilisateurId: "" });
  const [utilisateur, setUtilisateur] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Vérification connexion + chargement catégories
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUtilisateur(parsedUser);
      } catch {}
    }
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchCategories();
    }
  }, [router]);

  // 🟢 Récupérer les catégories (envoie le token JWT)
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }

      const res = await fetch(`${APP_URL}/api/categorie/liste`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du fetch des catégories:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Affichage des notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // 2s pour que ce soit plus visible
  };

  // 🟢 Ouvrir la modale d'ajout/modification
  const handleOpenModal = (categorie: any = null) => {
    setSelectedCategorie(categorie);

    const user = localStorage.getItem("utilisateur");
    let utilisateurId = "";
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        utilisateurId = parsedUser.id ? String(parsedUser.id) : "";
      } catch {}
    }

    if (categorie) {
      setFormData({
        nom: categorie.nom || "",
        utilisateurId: String(categorie.utilisateurId || utilisateurId),
      });
    } else {
      setFormData({ nom: "", utilisateurId });
    }

    setIsModalOpen(true);
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

  // 🟢 Rendu principal
  return (
    <DashboardLayout title="Liste des catégories">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {/* <h2 className="text-2xl font-bold text-gray-900">
            Gestion des catégories
          </h2> */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter</span>
          </button>
        </div>

        <CategorieTable
          categories={categories}
          utilisateur={utilisateur}
          fetchCategories={fetchCategories}
          showNotification={showNotification}
          handleOpenModal={handleOpenModal}
          formData={formData}
          setFormData={setFormData}
          selectedCategorie={selectedCategorie}
          setSelectedCategorie={setSelectedCategorie}
        />

        {/* 🔵 Modale d'ajout ou de modification */}
        {isModalOpen && (
          <CategorieModal
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            handleSubmit={async () => {
              try {
                const token = localStorage.getItem("token");
                if (!token) {
                  // Redirection automatique si token manquant
                  window.location.href = "/login";
                  return; // On arrête l'exécution
                }

                const payload = {
                  nom: formData.nom,
                  utilisateurId: Number(formData.utilisateurId),
                };
                if (!payload.utilisateurId)
                  return alert("Utilisateur non trouvé !");

                try {
                  if (selectedCategorie) {
                    // 🔄 Modifier
                    const response = await fetch(
                      `${APP_URL}/api/categorie/${selectedCategorie.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                      }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      showNotification(
                        data.message || "Erreur lors de la modification.",
                        "error"
                      );
                    } else {
                      showNotification(
                        data.message || "Catégorie modifiée avec succès.",
                        "success"
                      );
                    }
                  } else {
                    // ➕ Créer
                    const response = await fetch(
                      `${APP_URL}/api/categorie/create`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                      }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      showNotification(
                        data.message || "Erreur lors de l'ajout.",
                        "error"
                      );
                    } else {
                      setIsModalOpen(false);
                      showNotification(
                        data.message || "Catégorie ajoutée avec succès.",
                        "success"
                      );
                    }
                  }
                } catch (error: any) {
                  setIsModalOpen(false);
                  console.error(error);
                  showNotification(
                    error.message || "Une erreur est survenue.",
                    "error"
                  );
                }

                await fetchCategories();
                setSelectedCategorie(null);
                setFormData({ nom: "", utilisateurId: "" });
              } catch (error) {
                console.error(error);
                showNotification(
                  "Impossible de modifier la catégorie.",
                  "error"
                );
              }
            }}
          />
        )}

        {/* ✅ Notification */}
        {notification && (
          <div
            className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50 ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
