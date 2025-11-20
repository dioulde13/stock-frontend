"use client";
import { useState } from "react";
import ModalConfirm from "../components/ModalConfirm";
import { APP_URL } from "../environnement/environnements";
import { formatMontant } from "../components/utils/formatters";


interface VersementTableProps {
  versements: any[];
  onAction: () => void;
}

export default function VersementTable({
  versements,
  onAction,
}: VersementTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    "valider" | "rejeter" | null
  >(null);

  const [isLoading, setIsLoading] = useState(false); // 🟢 LOADING

  const openModal = (id: number, action: "valider" | "rejeter") => {
    setSelectedId(id);
    setSelectedAction(action);
    setModalOpen(true);
  };

  // 🟢 Notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  const confirmAction = async () => {
    if (!selectedId || !selectedAction) return;

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setIsLoading(true); // 🟢 ON ACTIVE LE LOADING

    try {
      const response = await fetch(
        `${APP_URL}/api/versement/${selectedAction}/${selectedId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      const message = data?.message;

      if (response.ok) {
        showNotification(message, "success");
      } else {
        showNotification(message, "error");
      }

      onAction();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du versement", error);
    }

    setIsLoading(false); // 🟢 ON DÉSACTIVE LE LOADING
    setModalOpen(false);
  };

  return (
    <>
      {/* 🔔 Notification */}
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

      {/* TABLE */}
      <table className="border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Vendeur</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {versements.map((v) => (
            <tr key={v.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-2">{v.id}</td>
              <td className="px-4 py-2">{v.vendeur?.nom || "—"}</td>
              <td className="px-4 py-2 font-semibold text-gray-700">
                {formatMontant(v.montant)}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    v.status === "VALIDÉ"
                      ? "bg-green-100 text-green-700"
                      : v.status === "REJETÉ"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {v.status}
                </span>
              </td>
              <td className="px-4 py-2 space-x-2">
                <button
                  disabled={isLoading}
                  onClick={() => openModal(v.id, "valider")}
                  className={`px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors duration-200 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Valider
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => openModal(v.id, "rejeter")}
                  className={`px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors duration-200 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Rejeter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      <ModalConfirm
        open={modalOpen}
        title={
          selectedAction === "valider"
            ? "Confirmer la validation"
            : "Confirmer le rejet"
        }
        message={
          selectedAction === "valider"
            ? "Voulez-vous vraiment VALIDER ce versement ?"
            : "Voulez-vous vraiment REJETER ce versement ?"
        }
        onConfirm={confirmAction}
        onCancel={() => setModalOpen(false)}
        loading={isLoading} // 🟢 ON PASSE LE LOADING AU MODAL
      />
    </>
  );
}
