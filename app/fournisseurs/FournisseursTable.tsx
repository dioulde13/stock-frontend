'use client';

import React, { useState, useMemo } from "react";
import { APP_URL } from "../environnement/environnements";

interface Fournisseur {
  id: number;
  nom: string;
  telephone: number;
  createdAt: string;
  Utilisateur?: {
    nom: string;
  };
}

interface FournisseurTableProps {
  fournisseur: Fournisseur[];
  fetchFournisseurs: () => Promise<void>;
  showNotification: (message: string) => void;
  handleOpenModal: (fournisseur?: Fournisseur) => void;
  formData: {
    nom: string;
    telephone: number;
    utilisateurId: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      nom: string;
      telephone: number;
      utilisateurId: string;
    }>
  >;
  selectedFournisseur: Fournisseur | null;
  setSelectedFournisseur: React.Dispatch<React.SetStateAction<Fournisseur | null>>;
}

export default function FournisseurTable({
  fournisseur,
  fetchFournisseurs,
  showNotification,
  handleOpenModal,
}: FournisseurTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;


    // 🔔 Modal suppression
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
  
    const openDeleteModal = (client: any) => {
      setClientToDelete(client);
      setShowDeleteModal(true);
    };
  
    const closeDeleteModal = () => {
      setClientToDelete(null);
      setShowDeleteModal(false);
      setIsDeleting(false);
    };
  
    const confirmDelete = async () => {
      if (!clientToDelete) return;
      setIsDeleting(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }
  
        await fetch(`${APP_URL}/api/fournisseur/supprimer/${clientToDelete.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        await fetchFournisseurs();
        showNotification("Client supprimé avec succès.");
      } catch (error) {
        console.error("Erreur suppression client :", error);
      } finally {
        closeDeleteModal();
      }
    };

  // Filtrage recherche + dates
  const filteredFournisseurs = useMemo(() => {
    return fournisseur.filter((f) => {
      const matchesSearch = f.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const date = new Date(f.createdAt);
      const afterStart = dateStart ? date >= new Date(dateStart) : true;
      const beforeEnd = dateEnd ? date <= new Date(dateEnd + "T23:59:59") : true;
      return matchesSearch && afterStart && beforeEnd;
    });
  }, [fournisseur, searchTerm, dateStart, dateEnd]);

  const pageCount = Math.ceil(filteredFournisseurs.length / itemsPerPage);
  const paginatedFournisseurs = filteredFournisseurs.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filtres */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <div className="flex-1 relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Rechercher un motif..."
              className="block w-52 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

         <div>
          <label className="text-sm font-medium">Date début</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Date fin</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedFournisseurs.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{f.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{f.telephone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {f.Utilisateur?.nom || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(f)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={() => openDeleteModal(f)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedFournisseurs.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-box-3-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun fournisseur trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-4">
          <button
            disabled={currentPage === 0}
            className="px-3 py-1 border rounded mx-1"
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ← Précédent
          </button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 border rounded mx-1 ${
                currentPage === i ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => setCurrentPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === pageCount - 1}
            className="px-3 py-1 border rounded mx-1"
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Suivant →
          </button>
        </div>
      )}

        {/* --- MODAL SUPPRESSION --- */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Supprimer le client
            </h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{clientToDelete.nom}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
