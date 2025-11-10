"use client";

import { formatMontant } from "@/components/utils/formatters";
// import { annulerCredit } from "./services/creditService";

type Client = {
  id: number;
  nom: string;
  telephone: string;
};

interface Credit {
  id: number;
  reference: string;
  description: string;
  montant: number;
  montantRestant: number;
  montantPaye: number;
  type: string;
  status: string;
  createdAt: string;
  utilisateurId?: number;
  Client?: Client;
}

export default function CreditsTable({
  credits,
  utilisateur,
  // onDelete,
  handleAnnuler,
}: {
  credits: Credit[];
  utilisateur: any;
  handleEdit: (credit: Credit) => void;
  onDelete: (id: number) => void;
  handleAnnuler: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Date",
                "Référence",
                "Nom",
                "Montant",
                "Montant payé",
                "Montant restant",
                "Description",
                "Type",
                "Status",
                // ...(utilisateur.role === "ADMIN" ? ["Status"] : []), // 👈 syntaxe correcte
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {credits.map((credit) => (
              <tr key={credit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  {new Date(credit.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {credit.reference}
                </td>
                <td className="px-6 py-4 text-sm">
                  {credit.Client?.nom +
                    " " +
                    "(" +
                    credit.Client?.telephone +
                    ")"}
                </td>
                <td className="px-6 py-4 text-sm">
                  {formatMontant(credit.montant)}
                </td>
                <td className="px-6 py-4 text-sm">
                  {formatMontant(credit.montantPaye)}
                </td>
                <td className="px-6 py-4 text-sm">
                  {formatMontant(credit.montantRestant)}
                </td>
                <td className="px-6 py-4 text-sm">{credit.description}</td>
                <td className="px-6 py-4 text-sm">{credit.type}</td>

                <td
                  className={`px-6 py-4 text-sm font-semibold ${
                    credit.status === "VALIDER"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {credit.status}
                </td>
                {/* {utilisateur.role === "ADMIN" ? ( */}
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleAnnuler(credit.id)}
                    >
                      Annuler
                    </button>
                  </td>
                {/* ) : (
                  ""
                )} */}
              </tr>
            ))}
            {credits.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-gray-500 py-4">
                  Aucun crédit trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
