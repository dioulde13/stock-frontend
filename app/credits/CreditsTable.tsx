"use client";

import { formatMontant } from "../components/utils/formatters";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Client = {
  id: number;
  nom: string;
  telephone: string;
};

type Utilisateur = {
  id: number;
  nom: string;
};

interface Credit {
  id: number; 
  reference: string;
  nom: string;
  description: string;
  montant: number;
  montantRestant: number;
  montantPaye: number;
  type: string;
  status: string;
  createdAt: string;
  utilisateurId?: number;
  Client?: Client;
  Utilisateur?: Utilisateur;
}

export default function CreditsTable({
  credits,
  handleAnnuler,
}: {
  credits: Credit[];
  utilisateur: any;
  handleEdit: (credit: Credit) => void;
  onDelete: (id: number) => void;
  handleAnnuler: (id: number) => void;
}) {
  // Fonction pour exporter en Excel
  const exportToExcel = () => {
    // Transformer les crédits en tableau plat
    const data = credits.map((credit) => ({
      Date: new Date(credit.createdAt).toLocaleDateString(),
      Référence: credit.reference,
      Nom: credit.Client?.nom,
      Téléphone: credit.Client?.telephone,
      Montant: credit.montant,
      "Montant payé": credit.montantPaye,
      "Montant restant": credit.montantRestant,
      Description: credit.description,
      Type: credit.type,
      Utilisateur: credit.Utilisateur?.nom,
      Status: credit.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Crédits");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "credits.xlsx");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-end p-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={exportToExcel}
        >
          Exporter en Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Date",
                "Référence",
                "Nom client",
                "Montant",
                "Montant payé",
                "Montant restant",
                "Description",
                "Type",
                "Status",
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
                  {credit === null ? (
                    <span>Aucun crédit</span>
                  ) : credit.Client ? (
                    <span>
                      <span className="font-medium">{credit.Client?.nom}</span>{" "}
                      <span className="text-gray-500">
                        ({credit.Client?.telephone})
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium">
                      {credit?.nom}
                    </span>
                  )}
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
                <td className="px-6 py-4 text-sm">
                  {credit.type} ({credit.Utilisateur?.nom})
                </td>
                <td
                  className={`px-6 py-4 text-sm font-semibold ${
                    credit.status === "VALIDER"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {credit.status}
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleAnnuler(credit.id)}
                  >
                    Annuler
                  </button>
                </td>
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
