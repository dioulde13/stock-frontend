"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientTable from "./ClientsTable";
import ClientModal from "./ClientModal";
import DashboardLayout from "../components/Layout/DashboardLayout";

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
  const [notification, setNotification] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    telephone: 0,
    utilisateurId: "",
  });

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

      const res = await fetch("http://localhost:3000/api/client/liste", {
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

  // ✅ Notification avec disparition automatique
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 1500);
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
        alert("Utilisateur non trouvé !");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const url = selectedClient
        ? `http://localhost:3000/api/client/modifier/${selectedClient.id}`
        : "http://localhost:3000/api/client/create";

      const method = selectedClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erreur API (${res.status})`);

      showNotification(
        selectedClient
          ? "Client modifié avec succès."
          : "Client ajouté avec succès."
      );

      await fetchClients();
      setSelectedClient(null);
      setFormData({ nom: "", telephone: 0, utilisateurId: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur API client :", error);
    }
  };

  return (
    <DashboardLayout title="Liste des clients">
      <div className="space-y-6">
        {/* 🔹 Header */}
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

        {/* 🔔 Notification */}
        {notification && (
          <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {notification}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
