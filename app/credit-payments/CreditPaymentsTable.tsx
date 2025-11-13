"use client";

import { formatMontant } from "../components/utils/formatters";
// import { useState } from "react";
import { deletePayment , annulerPayment} from "./services/payementCreditService";


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
  // const handleDelete = async (id: number) => {
  //   if (confirm("Voulez-vous vraiment supprimer ce paiement ?")) {
  //     try {
  //       await deletePayment(id);
  //       alert("Paiement supprimé avec succès !");
  //       if (onRefresh) onRefresh();
  //     } catch (error: any) {
  //       alert(error.message || "Erreur lors de la suppression du paiement");
  //     }
  //   }
  // };

   const handleAnnuler = async (id: number) => {
    if (confirm("Voulez-vous vraiment annulé ce paiement ?")) {
      try {
        await annulerPayment(id);
        alert("Paiement annulé avec succès !");
        if (onRefresh) onRefresh();
      } catch (error: any) {
        alert(error.message || "Erreur lors de la suppression du paiement");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400"></i>
          </div>
          <input
            type="text"
            placeholder="Rechercher par Référence Crédit..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Référence Crédit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                <td className="px-6 py-4">{p.Utilisateur?.nom}</td>
                <td className="px-6 py-4 font-medium">{formatMontant(p.montant)} GNF</td> 
                <td className="px-6 py-4 font-medium">{p.status}</td> 
                 <td className="px-6 py-4">
                  <button
                    onClick={() => handleAnnuler(p.id)}
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
    </div>
  );
}
