"use client";

import React, { useState, useMemo } from "react";
import ReactPaginate from "react-paginate";
import {
  formatMontant,
  formatMontantSansSigne,
} from "../components/utils/formatters";
import { APP_URL } from "../environnement/environnements";

interface Produit {
  id: number;
  nom: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  createdAt: string;
  status: string;
  boutiqueId: number;
  Categorie?: { nom: string };
  Boutique?: { nom: string };
}

// interface ProduitTableProps {
//   produits: Produit[];
//   utilisateur: any;
//   fetchProduits: () => Promise<void>;
//   showNotification: (message: string) => void;
//   handleOpenModal: (produit?: Produit) => void;
// }

interface ProduitTableProps {
  produits: Produit[];
  utilisateur: any;
  fetchProduits: () => Promise<void>;
  showNotification: (message: string) => void;
  handleOpenModal: (produit?: Produit) => void;

  // Ajouté pour corriger l'erreur TypeScript
  formData: {
    nom: string;
    prix_achat: number;
    prix_vente: number;
    stock_actuel: number;
    stock_minimum: number;
    categorieId: number;
    utilisateurId: string;
    boutiqueId: number;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      nom: string;
      prix_achat: number;
      prix_vente: number;
      stock_actuel: number;
      stock_minimum: number;
      categorieId: number;
      utilisateurId: string;
      boutiqueId: number;
    }>
  >;
  selectedProduit: Produit | null;
  setSelectedProduit: React.Dispatch<React.SetStateAction<Produit | null>>;
}

function ModalSuppression({
  produit,
  onClose,
  onConfirmDelete,
}: {
  produit: Produit | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}) {
  if (!produit) return null;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Confirmation de suppression
        </h2>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer le produit{" "}
          <span className="font-semibold text-red-600">"{produit.nom}"</span> ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={onConfirmDelete}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalChangementStatut({
  produit,
  onClose,
  onConfirmStatusChange,
}: {
  produit: Produit | null;
  onClose: () => void;
  onConfirmStatusChange: () => void;
}) {
  if (!produit) return null;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Changer le statut du produit
        </h2>
        <p className="text-gray-600 mb-6">
          Produit :{" "}
          <span className="font-semibold text-blue-600">"{produit.nom}"</span>
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={onConfirmStatusChange}
            className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            {produit.status === "VALIDER"
              ? "Annuler le produit"
              : "Valider le produit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProduitTable({
  produits,
  utilisateur,
  fetchProduits,
  showNotification,
  handleOpenModal,
}: ProduitTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [produitASupprimer, setProduitASupprimer] = useState<Produit | null>(
    null
  );
  const [produitAChangerStatut, setProduitAChangerStatut] =
    useState<Produit | null>(null);
  const itemsPerPage = 5;

  const filteredProduit = Array.isArray(produits)
    ? produits.filter((produit) => {
        console.log(produit);
        const matchesSearch = produit.nom
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        let matchesDate = true;
        if (dateStart) {
          matchesDate = new Date(produit.createdAt) >= new Date(dateStart);
        }
        if (matchesDate && dateEnd) {
          matchesDate = new Date(produit.createdAt) <= new Date(dateEnd);
        }
        const notAnnule = produit.status !== "ANNULER"; // <— exclut les statuts «ANNULER»

        return matchesSearch && matchesDate && notAnnule;
      })
    : [];

  const pageCount = Math.ceil(filteredProduit.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredProduit.slice(offset, offset + itemsPerPage);

  const totalMontantAchat = useMemo(() => {
    return filteredProduit.reduce(
      (total, p) => total + (p.prix_achat || 0) * (p.stock_actuel || 0),
      0
    );
  }, [filteredProduit]);

  const handlePageChange = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const supprimerProduit = async (produit: Produit) => {
    const user = localStorage.getItem("utilisateur");
    const token = localStorage.getItem("token");
    if (!user || !token) {
      // Redirection automatique si token manquant
      window.location.href = "/login";
      return; // On arrête l'exécutio
    }
    const parsedUser = JSON.parse(user);

    try {
      const res = await fetch(
        `${APP_URL}/api/produit/supprimer/${produit.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            utilisateurId: parsedUser.id,
            boutiqueId: produit.boutiqueId,
          }),
        }
      );

      if (res.ok) {
        showNotification("Produit supprimé avec succès.");
        await fetchProduits();
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur suppression :", error);
    } finally {
      setProduitASupprimer(null);
    }
  };

  const changerStatutProduit = async (produit: Produit) => {
    const user = localStorage.getItem("utilisateur");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Utilisateur non authentifié !");
      return;
    }

    const parsedUser = JSON.parse(user);
    const nouveauStatut = produit.status === "ANNULER" ? "VALIDER" : "ANNULER";

    const body = {
      utilisateurId: parsedUser.id,
      boutiqueId: produit.boutiqueId,
      status: nouveauStatut,
    };

    console.log("📦 Body envoyé :", body);

    try {
      const res = await fetch(`${APP_URL}/api/produit/annuler/${produit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showNotification("Statut changé avec succès.");
        await fetchProduits();
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors du changement de statut.");
      }
    } catch (error) {
      console.error("Erreur changement de statut :", error);
    } finally {
      setProduitAChangerStatut(null);
    }
  };
  

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between flex-wrap">
        {/* Total valeur stock */}
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold border border-blue-200 w-50 sm:w-auto text-center sm:text-left">
          Total valeur stock : {formatMontant(totalMontantAchat)}
        </div>

        {/* Recherches et dates */}
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-50">
          {/* Recherche produit */}
          <div className="flex-1 relative w-50 sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="block w-50 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date début */}
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-lg text-sm w-50 sm:w-auto"
          />

          {/* Date fin */}
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-lg text-sm w-50 sm:w-auto"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">
                Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Prix achat
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Prix vente
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Stock actuel
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Montant achat
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Stock min
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Catégorie
              </th>
              {utilisateur.role === "ADMIN" ? (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Boutique
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </>
              ) : (
                ""
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((produit) => (
                <tr key={produit.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm">
                    {new Date(produit.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-sm">{produit.nom}</td>
                  <td className="px-3 py-2 text-sm">
                    {formatMontant(produit.prix_achat)}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {formatMontant(produit.prix_vente)}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {formatMontantSansSigne(produit.stock_actuel)}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {formatMontant(produit.prix_achat * produit.stock_actuel)}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {formatMontantSansSigne(produit.stock_minimum)}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {produit.Categorie?.nom || "—"}
                  </td>
                  {utilisateur.role === "ADMIN" ? (
                    <>
                      <td className="px-3 py-2 text-sm">
                        {produit.Boutique?.nom || "—"}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-semibold ${
                          produit.status === "VALIDER"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {produit.status}
                      </td>
                      <td className="px-3 py-2 text-sm flex gap-2">
                        <button
                          onClick={() => handleOpenModal(produit)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Modifier"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => setProduitAChangerStatut(produit)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          title="Changer statut"
                        >
                          Annuler
                        </button>
                        {/* <button
                          onClick={() => setProduitASupprimer(produit)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Supprimer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button> */}
                      </td>
                    </>
                  ) : (
                    ""
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-12">
                  <i className="ri-box-3-line text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-500">
                    Essayez de modifier vos critères de recherche
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-end py-6">
          <ReactPaginate
            previousLabel={"← Précédent"}
            nextLabel={"Suivant →"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={handlePageChange}
            containerClassName={"flex items-center space-x-2"}
            pageClassName={"px-3 py-1 border rounded"}
            activeClassName={"bg-blue-500 text-white border-blue-500"}
            previousClassName={"px-3 py-1 border rounded"}
            nextClassName={"px-3 py-1 border rounded"}
            disabledClassName={"opacity-50 cursor-not-allowed"}
          />
        </div>
      )}

      {produitASupprimer && (
        <ModalSuppression
          produit={produitASupprimer}
          onClose={() => setProduitASupprimer(null)}
          onConfirmDelete={() => supprimerProduit(produitASupprimer)}
        />
      )}

      {produitAChangerStatut && (
        <ModalChangementStatut
          produit={produitAChangerStatut}
          onClose={() => setProduitAChangerStatut(null)}
          onConfirmStatusChange={() =>
            changerStatutProduit(produitAChangerStatut)
          }
        />
      )}
    </div>
  );
}
