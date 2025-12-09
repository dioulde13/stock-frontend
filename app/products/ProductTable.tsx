"use client";

import React, { useState, useMemo } from "react";
import ReactPaginate from "react-paginate";
import {
  formatMontant,
  formatMontantSansSigne,
} from "../components/utils/formatters";
import { APP_URL } from "../environnement/environnements";

interface ModificationProduit {
  id: number;
  dateModification: string;
  nomUtilisateur: string;
  ancienStockActuel: number;
  nouveauStockActuel: number;
  ancienPrixAchat: number;
  nouveauPrixAchat: number;
  ancienPrixVente: number;
  nouveauPrixVente: number;
}

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
  ModificationProduits?: ModificationProduit[];
}

interface ProduitTableProps {
  produits: Produit[];
  utilisateur: any;
  fetchProduits: () => Promise<void>;
  showNotification: (message: string) => void;
  handleOpenModal: (produit?: Produit) => void;
  // selectedProduit: any; // <-- AJOUT
  // setSelectedProduit: React.Dispatch<any>; // <-- AJOUT
}

function ModalHistorique({
  produit,
  onClose,
}: {
  produit: Produit | null;
  onClose: () => void;
}) {
  if (!produit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[700px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Historique des modifications – {produit.nom}
        </h2>

        {produit.ModificationProduits?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 border text-left text-sm font-medium text-gray-600">
                    Utilisateur
                  </th>
                  <th className="px-3 py-2 border text-left text-sm font-medium text-gray-600">
                    Date
                  </th>
                  <th className="px-3 py-2 border text-left text-sm font-medium text-gray-600">
                    Ancien Stock
                  </th>
                  <th className="px-3 py-2 border text-left text-sm font-medium text-gray-600">
                    Nouveau Stock
                  </th>
                  <th className="px-3 py-2 border text-left text-sm font-medium text-gray-600">
                    Ancien Prix Achat
                  </th>
                  <th className="px-3 py-2 border text-left text-sm font-medium text-gray-600">
                    Nouveau Prix Achat
                  </th>
                  <th className="px-3 py-2 border text-left text-sm font-medium text-gray-600">
                    Ancien Prix Vente
                  </th>
                  <th className="px-3 py-2 border text-left text-sm font-medium text-gray-600">
                    Nouveau Prix Vente
                  </th>
                </tr>
              </thead>
              <tbody>
                {produit.ModificationProduits.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border text-sm">
                      {m.nomUtilisateur}
                    </td>
                    <td className="px-3 py-2 border text-sm">
                      {new Date(m.dateModification).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 border text-sm">
                      {m.ancienStockActuel}
                    </td>
                    <td className="px-3 py-2 border text-sm">
                      {m.nouveauStockActuel}
                    </td>
                    <td className="px-3 py-2 border text-sm">
                      {formatMontant(m.ancienPrixAchat)}
                    </td>
                    <td className="px-3 py-2 border text-sm">
                      {formatMontant(m.nouveauPrixAchat)}
                    </td>
                    <td className="px-3 py-2 border text-sm">
                      {formatMontant(m.ancienPrixVente)}
                    </td>
                    <td className="px-3 py-2 border text-sm">
                      {formatMontant(m.nouveauPrixVente)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">
            Aucune modification trouvée.
          </p>
        )}

        <div className="text-right mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
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
}: // selectedProduit,
// setSelectedProduit,
ProduitTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [boutiqueFilter, setBoutiqueFilter] = useState<number | "">("");
  const [produitASupprimer, setProduitASupprimer] = useState<Produit | null>(
    null
  );
  const [produitAChangerStatut, setProduitAChangerStatut] =
    useState<Produit | null>(null);

  const [produitHistorique, setProduitHistorique] = useState<Produit | null>(
    null
  );

  const itemsPerPage = 5;

  const filteredProduit = Array.isArray(produits)
    ? produits.filter((produit) => {
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

        const matchesBoutique =
          boutiqueFilter === "" || produit.boutiqueId === boutiqueFilter;

        const notAnnule = produit.status !== "ANNULER";

        return matchesSearch && matchesDate && matchesBoutique && notAnnule;
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
      window.location.href = "/login";
      return;
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
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold border border-blue-200">
          Total valeur stock : {formatMontant(totalMontantAchat)}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
          />

          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
          />

          {/* Filtre BOUTIQUE */}
          {utilisateur.role === "ADMIN" && (
            <select
              value={boutiqueFilter}
              onChange={(e) =>
                setBoutiqueFilter(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Toutes les boutiques</option>

              {[
                ...new Map(produits.map((p) => [p.boutiqueId, p])).values(),
              ].map((p) => (
                <option key={p.boutiqueId} value={p.boutiqueId}>
                  {p.Boutique?.nom || `Boutique #${p.boutiqueId}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* TABLEAU */}
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
                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
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
                        {produit.status === 'VALIDER'?'VALIDÉ':''}
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
                          onClick={() => setProduitHistorique(produit)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Voir historique"
                        >
                          <i className="ri-eye-line"></i>
                        </button>

                        <button
                          onClick={() => setProduitAChangerStatut(produit)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          title="Changer statut"
                        >
                          Annuler
                        </button>
                      </td>
                    </>
                  ) : (
                    <td className="px-3 py-2 text-sm flex gap-2">
                      <button
                        onClick={() => handleOpenModal(produit)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Modifier"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                    </td>
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

      {/* PAGINATION */}
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

      {/* Modals */}
      {produitASupprimer && (
        <ModalSuppression
          produit={produitASupprimer}
          onClose={() => setProduitASupprimer(null)}
          onConfirmDelete={() => supprimerProduit(produitASupprimer)}
        />
      )}

      {produitHistorique && (
        <ModalHistorique
          produit={produitHistorique}
          onClose={() => setProduitHistorique(null)}
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
