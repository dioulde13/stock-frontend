"use client";

import { useState } from "react";
import { formatMontant } from "../components/utils/formatters";
import { annulerPayment } from "./services/payementCreditService";
import ModalConfirm from "../components/ModalConfirm";

interface CreditPaymentsTableProps {
  payments: any[];
  onRefresh?: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export default function CreditPaymentsTable({
  payments,
  onRefresh,
  searchTerm,
  setSearchTerm,
}: CreditPaymentsTableProps) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const openConfirmModal = (id: number) => {
    setSelectedId(id);
    setOpenModal(true);
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
    setTimeout(() => setNotification(null), 2000);
  };

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setLoading(true);

    try {
      const response = await annulerPayment(selectedId);

      const successMessage =
        response?.message || "Paiement annulé avec succès !";

      showNotification(successMessage, "success");

      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de l’annulation du paiement";

      showNotification(errorMessage, "error");
    }
    setLoading(false);
    setOpenModal(false);
    setSelectedId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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

      {/* 🔍 Champ recherche */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400"></i>
          </div>
          <input
            type="text"
            placeholder="Rechercher par Référence Crédit..."
            className="block w-52 pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Référence Crédit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{p.Credit?.reference}</td>
                <td className="px-6 py-4">{p.Credit?.Client?.nom}</td>
                <td className="px-6 py-4">{p.Utilisateur?.nom}</td>
                <td className="px-6 py-4 font-medium">
                  {formatMontant(p.montant)} GNF
                </td>
                <td className="px-6 py-4 font-medium">{p.status}</td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => openConfirmModal(p.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucun paiement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🟦 Modal Confirmation */}
      {/* <ModalConfirm
        open={openModal}
        title="Annuler le paiement"
        message="Voulez-vous vraiment annuler ce paiement ?"
        onConfirm={handleConfirm}
        onCancel={() => setOpenModal(false)}
      /> */}

      <ModalConfirm
        open={openModal}
        title="Annuler le paiement"
        message="Voulez-vous vraiment annuler ce paiement ?"
        onConfirm={handleConfirm}
        onCancel={() => setOpenModal(false)}
        loading={loading}
      />
    </div>
  );
}
