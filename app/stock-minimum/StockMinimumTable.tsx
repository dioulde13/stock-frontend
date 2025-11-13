"use client";

import React, { useMemo, useState } from "react";
import ReactPaginate from "react-paginate";

interface Produit {
  id: number;
  nom: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_minimum: number;
  createdAt?: string; // pour le filtrage par date
}

interface MouvemntTableProps {
  stockMinimum: Produit[] | any;
}

export default function MouvementStocTable({
  stockMinimum,
}: MouvemntTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // 🧠 Filtrage optimisé avec useMemo
  const filteredStock = useMemo(() => {
    if (!Array.isArray(stockMinimum)) return [];

    return stockMinimum.filter((produit: Produit) => {
      const matchNom = produit.nom
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const dateProd = produit.createdAt ? new Date(produit.createdAt) : null;
      const matchDateDebut = dateDebut
        ? dateProd
          ? dateProd >= new Date(dateDebut)
          : false
        : true;
      const matchDateFin = dateFin
        ? dateProd
          ? dateProd <= new Date(dateFin)
          : false
        : true;

      return matchNom && matchDateDebut && matchDateFin;
    });
  }, [stockMinimum, searchTerm, dateDebut, dateFin]);

  // 📄 Pagination
  const pageCount = Math.ceil(filteredStock.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredStock.slice(offset, offset + itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 🔍 Barre de recherche et filtres */}
      {/* 🔍 Barre de recherche et filtres */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Recherche par nom */}
          <div className="flex-1 relative min-w-[200px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="ri-search-line text-gray-400 text-lg"></i>
            </span>
            <input
              type="text"
              placeholder="Rechercher un motif..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date début */}
          <div className="flex-1 sm:flex-none sm:w-40">
            <label className="block text-xs text-gray-600 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Date fin */}
          <div className="flex-1 sm:flex-none sm:w-40">
            <label className="block text-xs text-gray-600 mb-1">Date fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 🧾 Tableau des produits */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix achat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix vente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock actuel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock minimum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date ajout
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((produit: Produit) => (
              <tr key={produit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{produit.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {produit.prix_achat}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {produit.prix_vente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {produit.stock_actuel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {produit.stock_minimum}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {produit.createdAt
                    ? new Date(produit.createdAt).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Aucun produit trouvé */}
        {filteredStock.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-box-3-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* 📄 Pagination */}
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
    </div>
  );
}
