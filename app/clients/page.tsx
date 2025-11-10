"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientTable from "./ClientsTable";
import ClientModal from "./ClientModal";
import DashboardLayout from "../components/Layout/DashboardLayout";

export default function ClientPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    telephone: 0,
    utilisateurId: "",
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchClients();
    }
  }, [router]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch("http://localhost:3000/api/client/liste", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
        },
      });
      const data = await res.json();
      console.log(data);
      setClients(data);
    } catch (error) {
      console.error("Erreur lors du fetch des clients:", error);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 1000);
  };

  const handleOpenModal = (client: any = null) => {
    setSelectedClient(client);

    const user = localStorage.getItem("utilisateur");
    let utilisateurId = "";
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        utilisateurId = parsedUser.id ? String(parsedUser.id) : "";
      } catch {}
    }

    if (client) {
      setFormData({
        nom: client.nom || "",
        telephone: client.telephone || 0,
        utilisateurId: String(client.utilisateurId || utilisateurId),
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
    <DashboardLayout title="Liste des clients">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des clients
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter un client</span>
          </button>
        </div>

        <ClientTable
          clients={clients}
          fetchClients={fetchClients}
          showNotification={showNotification}
          handleOpenModal={handleOpenModal}
          formData={formData}
          setFormData={setFormData}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />

        {isModalOpen && (
          <ClientModal
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
                if (!payload.utilisateurId)
                  return alert("Utilisateur non trouvé !");

                if (selectedClient) {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    // Redirection automatique si token manquant
                    window.location.href = "/login";
                    return; // On arrête l'exécution
                  }
                  await fetch(
                    `http://localhost:3000/api/client/modifier/${selectedClient.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(payload),
                    }
                  );
                  showNotification("Client modifiée avec succès.");
                } else {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    // Redirection automatique si token manquant
                    window.location.href = "/login";
                    return; // On arrête l'exécution
                  }
                  await fetch("http://localhost:3000/api/client/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  });
                  showNotification("Client ajouté avec succès.");
                }

                await fetchClients();
                setSelectedClient(null);
                setFormData({
                  nom: "",
                  telephone: 0,
                  utilisateurId: "",
                });
                setIsModalOpen(false);
              } catch (error) {
                console.error("Erreur API catégorie :", error);
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
