"use client";

import React, { Dispatch, SetStateAction } from "react";
import { APP_URL } from "../environnement/environnements";

interface CategorieTableProps {
  categories: any[];
  utilisateur: any;
  fetchCategories: () => Promise<void>;
  showNotification: (message: string) => void;
  handleOpenModal: (categorie?: any) => void;
  selectedCategorie: any;
  setSelectedCategorie: Dispatch<SetStateAction<any>>;
  formData: { nom: string; utilisateurId: string };
  setFormData: Dispatch<SetStateAction<{ nom: string; utilisateurId: string }>>;
}

export default function CategorieTable({
  categories,
  utilisateur,
  fetchCategories,
  showNotification,
  handleOpenModal,
}: CategorieTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirection automatique si token manquant
      window.location.href = "/login";
      return; // On arrête l'exécution
    }

    try {
      await fetch(`${APP_URL}/api/categorie/supprimer/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchCategories();
      showNotification("Catégorie supprimée avec succès.");
    } catch (error) {
      console.error("Erreur suppression catégorie :", error);
    }
  };

  const filteredCategorie = categories.filter((categorie) =>
    categorie.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              {utilisateur.role === "ADMIN" ? (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              ) : (
                ""
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategorie.map((categorie) => (
              <tr key={categorie.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{categorie.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {categorie.Utilisateur?.nom || "—"}
                </td>
                {utilisateur.role === "ADMIN" ? (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(categorie)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <i className="ri-edit-line"></i>
                      </button>

                      <button
                        onClick={() => handleDelete(categorie.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                ) : (
                  ""
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCategorie.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-box-3-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune catégorie trouvée
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
