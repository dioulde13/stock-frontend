"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { APP_URL } from "../environnement/environnements";

interface Boutique {
  id: number;
  nom: string;
}

interface Caisse {
  id: number;
  solde_actuel: number | string;
}

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  bloque?: boolean;
  Boutique?: Boutique;
  Caisses?: Caisse[]; // 👈 tableau obligatoire !
}

interface UtilisateursTableProps {
  utilisateurs?: Utilisateur[];
  fetchUtilisateurs: () => Promise<void>;
  showNotification: (message: string) => void;
  handleOpenModal: (client?: Utilisateur) => void;
  selectedUtilisateur: Utilisateur | null;
  setSelectedUtilisateur: Dispatch<SetStateAction<Utilisateur | null>>;
  formData: {
    nom: string;
    email: string;
    boutiqueId: number;
  };
  setFormData: Dispatch<
    SetStateAction<{
      nom: string;
      email: string;
      boutiqueId: number;
    }>
  >;
}

export default function UtilisateursTable({
  utilisateurs,
  fetchUtilisateurs,
  showNotification,
  handleOpenModal,
}: UtilisateursTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [utilisateurToDebloquer, setUtilisateurToDebloquer] =
    useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Formatage montant (1.430.000)
  const formatMoney = (n: number | string) => {
    return Number(n).toLocaleString("fr-FR");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleDebloquerClick = (utilisateur: Utilisateur) => {
    setUtilisateurToDebloquer(utilisateur);
    setModalVisible(true);
  };

  const debloquerUtilisateur = async () => {
    if (!utilisateurToDebloquer) return;

    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) return (window.location.href = "/login");

      const response = await fetch(
        `${APP_URL}/api/utilisateur/debloquer/${utilisateurToDebloquer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Impossible de débloquer le vendeur.");

      showNotification("Vendeur débloqué avec succès.");
      await fetchUtilisateurs();
    } catch (error: any) {
      showNotification(error.message);
    } finally {
      setIsLoading(false);
      setModalVisible(false);
      setUtilisateurToDebloquer(null);
    }
  };

  const utilisateursArray = Array.isArray(utilisateurs) ? utilisateurs : [];
  const filteredUtilisateurs = utilisateursArray.filter(
    (u) =>
      u.nom.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p>Chargement …</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Rechercher un vendeur..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Boutique
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Solde
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
            {filteredUtilisateurs.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">{u.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {u.Boutique?.nom || "—"}
                </td>

                {/* SOLDE */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {u.Caisses?.[0]?.solde_actuel !== undefined
                    ? formatMoney(u.Caisses[0].solde_actuel)
                    : "—"}
                </td>

                {/* STATUS */}
                <td
                  className={`px-6 py-4 text-sm font-semibold ${
                    u.bloque ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {u.bloque ? "Bloqué" : "Actif"}
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {u.bloque && (
                      <button
                        onClick={() => handleDebloquerClick(u)}
                        className="text-green-600 hover:text-green-900 p-1 rounded cursor-pointer"
                      >
                        <i className="ri-lock-unlock-line text-lg"></i>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenModal(u)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded cursor-pointer"
                    >
                      <i className="ri-edit-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUtilisateurs.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-box-3-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun vendeur trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalVisible && utilisateurToDebloquer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Débloquer un vendeur</h3>
            <p className="mb-4">
              Êtes-vous sûr de vouloir débloquer{" "}
              <strong>{utilisateurToDebloquer.nom}</strong> ?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={debloquerUtilisateur}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                {isLoading ? "En cours..." : "Débloquer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
