"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategorieTable from "./CategorieTable";
import CategorieModal from "./CategorieModal";
import DashboardLayout from "../components/Layout/DashboardLayout";

export default function CategoriePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nom: "", utilisateurId: "" });
  const [utilisateur, setUtilisateur] = useState<any[]>([]);

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

      const res = await fetch("http://localhost:3000/api/categorie/liste", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du fetch des catégories:", error);
    }
  };

  // 🟢 Affichage des notifications
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 1000);
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

  // 🟢 Rendu principal
  return (
    <DashboardLayout title="Liste des catégories">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des catégories
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter une catégorie</span>
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

                if (selectedCategorie) {
                  // 🔄 Modifier
                  await fetch(
                    `http://localhost:3000/api/categorie/${selectedCategorie.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(payload),
                    }
                  );
                  showNotification("Catégorie modifiée avec succès.");
                } else {
                  // ➕ Créer
                  await fetch("http://localhost:3000/api/categorie/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  });
                  showNotification("Catégorie ajoutée avec succès.");
                }

                await fetchCategories();
                setSelectedCategorie(null);
                setFormData({ nom: "", utilisateurId: "" });
                setIsModalOpen(false);
              } catch (error) {
                console.error("Erreur API catégorie :", error);
              }
            }}
          />
        )}

        {/* ✅ Notification */}
        {notification && (
          <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {notification}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
