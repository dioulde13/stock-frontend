"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FournisseursTable from "./FournisseursTable";
import FournisseursModal from "./FournisseursModal";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";

export default function FournisseurPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [fournisseur, setFournisseurs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nom: "",
    telephone: 0,
    utilisateurId: "",
  });

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

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchFournisseurs();
    }
  }, [router]);

  const fetchFournisseurs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/fournisseur/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
        },
      });

      const data = await res.json();
      console.log(data);
      setFournisseurs(data);
    } catch (error) {
      console.error("Erreur lors du fetch des fournisseurs:", error);
    }
  };

  const handleOpenModal = (fournisseur: any = null) => {
    setSelectedFournisseur(fournisseur);

    const user = localStorage.getItem("utilisateur");
    let utilisateurId = "";
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        utilisateurId = parsedUser.id ? String(parsedUser.id) : "";
      } catch {}
    }

    if (fournisseur) {
      setFormData({
        nom: fournisseur.nom || "",
        telephone: fournisseur.telephone || 0,
        utilisateurId: String(fournisseur.utilisateurId || utilisateurId),
      });
    } else {
      setFormData({
        nom: "",
        telephone: 0,
        utilisateurId,
      });
    }

    setIsModalOpen(true);
  };

  return (
    <DashboardLayout title="Liste des fournisseurs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {/* <h2 className="text-2xl font-bold text-gray-900">Gestion des fournisseurs</h2> */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter</span>
          </button>
        </div>

        <FournisseursTable
          fournisseur={fournisseur}
          fetchFournisseurs={fetchFournisseurs}
          showNotification={showNotification}
          handleOpenModal={handleOpenModal}
          formData={formData}
          setFormData={setFormData}
          selectedFournisseur={selectedFournisseur}
          setSelectedFournisseur={setSelectedFournisseur}
        />

        {isModalOpen && (
          <FournisseursModal
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            handleSubmit={async () => {
              try {
                const payload = {
                  nom: formData.nom,
                  telephone: formData.telephone,
                  utilisateurId: Number(formData.utilisateurId),
                };

                if (!payload.utilisateurId) {
                setIsModalOpen(false);
                  return showNotification("Utilisateur non trouvé !", "error");
                }

                const token = localStorage.getItem("token");
                if (!token) {
                  window.location.href = "/login";
                  return;
                }

                let res, data;
                if (selectedFournisseur) {
                  // 🔄 Modifier
                  res = await fetch(
                    `${APP_URL}/api/fournisseur/modifier/${selectedFournisseur.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(payload),
                    }
                  );
                setIsModalOpen(false);
                  data = await res.json();
                  if (!res.ok)
                    return showNotification(
                      data.message || "Erreur lors de la modification",
                      "error"
                    );
                  showNotification(
                    data.message || "Fournisseur modifié avec succès.",
                    "success"
                  );
                } else {
                  // ➕ Créer
                  res = await fetch(`${APP_URL}/api/fournisseur/create`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  });
                  data = await res.json();
                setIsModalOpen(false);
                  if (!res.ok)
                    return showNotification(
                      data.message || "Erreur lors de l'ajout",
                      "error"
                    );
                  showNotification(
                    data.message || "Fournisseur ajouté avec succès.",
                    "success"
                  );
                }

                await fetchFournisseurs();
                setSelectedFournisseur(null);
                setFormData({
                  nom: "",
                  telephone: 0,
                  utilisateurId: "",
                });
              } catch (error: any) {
                console.error("Erreur API fournisseur :", error);
                showNotification(
                  error.message || "Erreur de connexion au serveur",
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
