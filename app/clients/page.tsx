"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientTable from "./ClientsTable";
import ClientModal from "./ClientModal";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";

interface Client {
  id: number;
  nom: string;
  telephone: number;
  utilisateurId: string;
  Utilisateur?: {
    id: number;
    nom: string;
  };
  createdAt?: string;
}

export default function ClientPage() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
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

  // ✅ Vérification de l’authentification + chargement initial
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchClients();
  }, [router]);

  // ✅ Récupération des clients depuis l’API
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${APP_URL}/api/client/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Erreur lors du fetch des clients:", error);
    }
  };

  // ✅ Ouvrir le modal pour créer ou modifier un client
  const handleOpenModal = (client: Client | null = null) => {
    setSelectedClient(client);

    const user = localStorage.getItem("utilisateur");
    let utilisateurId = "";
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        utilisateurId = parsedUser.id ? String(parsedUser.id) : "";
      } catch (e) {
        console.error("Erreur parsing utilisateur:", e);
      }
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

  // ✅ Soumission (ajout / modification)
  const handleSubmit = async () => {
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

      const url = selectedClient
        ? `${APP_URL}/api/client/modifier/${selectedClient.id}`
        : `${APP_URL}/api/client/create`;

      const method = selectedClient ? "PUT" : "POST";

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
        return showNotification(
          data.message || `Erreur API (${res.status})`,
          "error"
        );
      }
      setIsModalOpen(false);

      showNotification(
        data.message ||
          (selectedClient
            ? "Client modifié avec succès."
            : "Client ajouté avec succès."),
        "success"
      );

      await fetchClients();
      setSelectedClient(null);
      setFormData({ nom: "", telephone: 0, utilisateurId: "" });
    } catch (error: any) {
      setIsModalOpen(false);
      console.error("Erreur API client :", error);
      showNotification(
        error.message || "Erreur de connexion au serveur",
        "error"
      );
    }
  };

  return (
    <DashboardLayout title="Liste des clients">
      <div className="space-y-6">
        {/* 🔹 Header */}
        <div className="flex items-center justify-between">
          {/* <h2 className="text-2xl font-bold text-gray-900">
            Gestion des clients
          </h2> */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter un client</span>
          </button>
        </div>

        {/* 🧾 Tableau */}
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

        {/* 🪟 Modal */}
        {isModalOpen && (
          <ClientModal
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            handleSubmit={handleSubmit}
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
