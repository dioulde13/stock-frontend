"use client";

import React, { useMemo, useState, Dispatch, SetStateAction } from "react";
import ReactPaginate from "react-paginate";
import { APP_URL } from "../environnement/environnements";

interface MouvementTableProps {
  mouvement: any[];
  utilisateur: any;
  fetchMouvement: () => Promise<void>;
  showNotification: (message: string) => void;
  handleOpenModal: (mouvement?: any) => void;
  selectedMouvement: any;
  setSelectedMouvement: Dispatch<SetStateAction<any>>;
  formData: {
    motif: string;
    quantite: number;
    typeMvtId: number;
    produitId: number;
    utilisateurId: string;
  };
  setFormData: Dispatch<
    SetStateAction<{
      motif: string;
      quantite: number;
      typeMvtId: number;
      produitId: number;
      utilisateurId: string;
    }>
  >;
}

export default function MouvementStockTable({
  mouvement,
  utilisateur,
  fetchMouvement,
  showNotification,
  selectedMouvement,
  setSelectedMouvement,
}: MouvementTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const [showModalSupprimer, setShowModalSupprimer] = useState(false);
  const [showModalStatut, setShowModalStatut] = useState(false);

  const itemsPerPage = 5;

  // 📊 Filtrage par motif et dates
  const filteredMouvementStock = useMemo(() => {
    return mouvement.filter((mvt) => {
      const matchMotif = mvt.motif
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const dateMvt = new Date(mvt.createdAt);
      const matchDateDebut = dateDebut ? dateMvt >= new Date(dateDebut) : true;
      const matchDateFin = dateFin ? dateMvt <= new Date(dateFin) : true;

      return matchMotif && matchDateDebut && matchDateFin;
    });
  }, [mouvement, searchTerm, dateDebut, dateFin]);

  // 📄 Pagination
  const pageCount = Math.ceil(filteredMouvementStock.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredMouvementStock.slice(
    offset,
    offset + itemsPerPage
  );

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  // 🔥 Supprimer un mouvement
  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${APP_URL}/api/mouvementStock/supprimer/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchMouvement();
      showNotification("Mouvement supprimé avec succès.");
    } catch (error) {
      console.error("Erreur suppression Mouvement :", error);
    } finally {
      setShowModalSupprimer(false);
      setSelectedMouvement(null);
    }
  };

  // 🔹 Changement de statut
  const handleChangeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${APP_URL}/api/mouvementStock/annuler/${selectedMouvement.id}`,
        {
          method: "PUT", // ou POST selon ton routeur
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        showNotification("Mouvement annulé avec succès.");
        await fetchMouvement(); // rafraîchit le tableau
        setShowModalStatut(false);
      } else {
        showNotification(data.message || "Erreur lors de l'annulation.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur serveur.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 🔍 Recherche et filtres */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <div className="flex-1 relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Rechercher un motif..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* 🧾 Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              {utilisateur.role === "ADMIN" ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              ) : (
                ""
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((mvt: any) => (
              <tr key={mvt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(mvt.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{mvt.motif}</td>
                <td className="px-6 py-4 whitespace-nowrap">{mvt.quantite}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {mvt.Produit?.nom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {mvt.TypeMvt?.type}
                </td>
                {utilisateur.role === "ADMIN" ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {mvt.Utilisateur?.nom || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mvt.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      {/* <button
                        onClick={() => {
                          setSelectedMouvement(mvt);
                          setShowModalSupprimer(true);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button> */}
                      <button
                        onClick={() => {
                          setSelectedMouvement(mvt);
                          setShowModalStatut(true);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Annuler
                      </button>
                    </td>
                  </>
                ) : (
                  ""
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMouvementStock.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-box-3-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun mouvement trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <ReactPaginate
            previousLabel={<i className="ri-arrow-left-s-line"></i>}
            nextLabel={<i className="ri-arrow-right-s-line"></i>}
            breakLabel="..."
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName="flex items-center space-x-2 text-sm"
            activeClassName="bg-blue-500 text-white rounded-full px-3 py-1"
            pageClassName="px-3 py-1 rounded cursor-pointer hover:bg-gray-100"
            previousClassName="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
            nextClassName="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
            forcePage={currentPage}
          />
        </div>
      )}

      {/* Modal Supprimer */}
      {showModalSupprimer && selectedMouvement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">
              Confirmer la suppression
            </h3>
            <p className="mb-6">
              Voulez-vous vraiment supprimer ce mouvement ?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModalSupprimer(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(selectedMouvement.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Changement Statut */}
      {showModalStatut && selectedMouvement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">
              Annuler ce mouvement de stock
            </h3>
            <div className="flex justify-between items-center space-x-4 mt-4">
              <button
                onClick={() => setShowModalStatut(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white font-semibold rounded hover:bg-gray-400 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => handleChangeStatus()}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors"
              >
                ANNULER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
