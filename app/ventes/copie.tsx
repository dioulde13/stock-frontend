

"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import DashboardLayout from "../../components/Layout/DashboardLayout";

type Produit = {
  id: number;
  nom: string;
  prix_vente: number;
  prix_achat: number;
  stock_actuel: number;
};

type LigneVente = {
  id?: number;
  utilisateurId: number;
  produitId: number;
  produitNom: string;
  quantite: number;
  prix_achat: number;
  prix_vente: number;
  Produit?: Produit;
};

type Vente = {
  id: number;
  total: number;
  type: string;
  createdAt: string;
  LigneVentes: LigneVente[];
  vendeurNom?: string;
  boutiqueNom?: string;
};

export default function VentesPage() {
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [venteType, setVenteType] = useState<"ACHAT" | "CREDIT">("ACHAT");
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientsData, setClientsData] = useState<{ id: number; nom: string }[]>([]);
  const [lignesVente, setLignesVente] = useState<LigneVente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formUtilisateurId, setFormUtilisateurId] = useState<number | null>(null);

  const [ligneTemp, setLigneTemp] = useState<{
    utilisateurId: number | null;
    produitId: string;
    produitNom: string;
    quantite: string;
    prix_achat: string;
    prix_vente: string;
  }>({
    utilisateurId: formUtilisateurId,
    produitId: "",
    produitNom: "",
    quantite: "1",
    prix_achat: "",
    prix_vente: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dataProduit, setDataProduit] = useState<Produit[]>([]);

  const [ventes, setVentes] = useState<Vente[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ventesParPage = 2;

  // Filtre par défaut : mois en cours
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [dateDebut, setDateDebut] = useState(firstDayOfMonth.toISOString().split("T")[0]);
  const [dateFin, setDateFin] = useState(lastDayOfMonth.toISOString().split("T")[0]);
  const [typeVenteFilter, setTypeVenteFilter] = useState<"ACHAT" | "CREDIT" | "">("");
  const [boutiqueFilter, setBoutiqueFilter] = useState<string>("");

  useEffect(() => { fetchVentes(); }, []);

  const fetchVentes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/vente/liste", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des ventes");
      const data = await res.json();
      const dataTransformee: Vente[] = data.map((v: any) => ({
        ...v,
        vendeurNom: v.Utilisateur?.nom ?? "",
        boutiqueNom: v.Utilisateur?.Boutique?.nom ?? "",
      }));
      setVentes(dataTransformee);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  const filteredVentes = useMemo(() => {
    return ventes.filter(v => {
      const vDate = new Date(v.createdAt);
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      if (vDate < debut || vDate > fin) return false;
      if (typeVenteFilter && v.type !== typeVenteFilter) return false;
      if (boutiqueFilter && v.boutiqueNom !== boutiqueFilter) return false;
      return true;
    });
  }, [ventes, dateDebut, dateFin, typeVenteFilter, boutiqueFilter]);

  // Total filtré
  const totalFiltre = useMemo(() => {
    return filteredVentes.reduce((acc, v) => {
      return acc + v.LigneVentes.reduce((sum, l) => sum + (l.quantite * (l.prix_vente ?? 0)), 0);
    }, 0);
  }, [filteredVentes]);

  // Pagination
  const indexDerniereVente = currentPage * ventesParPage;
  const indexPremiereVente = indexDerniereVente - ventesParPage;
  const ventesPaginees = filteredVentes.slice(indexPremiereVente, indexDerniereVente);
  const totalPages = Math.ceil(filteredVentes.length / ventesParPage);
  const handlePageChange = (page: number) => setCurrentPage(page);

  // Liste unique des boutiques pour filtre
  const boutiques = Array.from(new Set(ventes.map(v => v.boutiqueNom).filter(Boolean)));

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setFormUtilisateurId(Number(parsedUser.id));
      } catch {}
    }
    setMounted(true);
    fetchVentes();
    fetchProduits();
    fetchClients();
  }, []);

  const ouvrirConfirmationModal = () => {
    if (clientsData.length === 0) fetchClients();
    setConfirmationModalOpen(true);
  };

  const fermerConfirmationModal = () => {
    setConfirmationModalOpen(false);
    setClientId(null);
    setVenteType("ACHAT");
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/client/liste", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des clients");
      const data = await res.json();
      setClientsData(data);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const fetchProduits = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/produit/liste", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement du produit");
      const data = await res.json();
      setDataProduit(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const creerVenteAvecType = async (type: "ACHAT" | "CREDIT", clientId: number | null) => {
    if (lignesVente.length === 0) {
      alert("Ajoutez au moins une ligne de vente.");
      return;
    }
    const lignesValides = lignesVente.every(
      (ligne) => ligne.produitId > 0 && ligne.quantite > 0 && ligne.prix_vente > 0
    );
    if (!lignesValides) {
      alert("Veuillez remplir correctement toutes les lignes de vente.");
      return;
    }
    const { utilisateurId } = lignesVente[0];
    const lignesFormattees = lignesVente.map((ligne) => ({
      produitId: ligne.produitId,
      quantite: ligne.quantite,
      prix_achat: ligne.prix_achat,
      prix_vente: ligne.prix_vente,
    }));
    const payload = {
      utilisateurId,
      lignes: lignesFormattees,
      type,
      clientId: type === "CREDIT" ? clientId : undefined,
    };
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non trouvé. Veuillez vous reconnecter.");
      }
      const res = await fetch("http://localhost:3000/api/vente/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur inconnue");
      }
      alert("Vente créée avec succès !");
      setLignesVente([]);
      fetchVentes();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const ouvrirModal = (index?: number) => {
    if (typeof index === "number") {
      const ligne = lignesVente[index];
      setLigneTemp({
        utilisateurId: formUtilisateurId,
        produitId: ligne.produitId.toString(),
        produitNom: ligne.produitNom.toString(),
        quantite: ligne.quantite.toString(),
        prix_achat: ligne.prix_achat.toString(),
        prix_vente: ligne.prix_vente.toString(),
      });
      setEditingIndex(index);
    } else {
      setLigneTemp({
        utilisateurId: formUtilisateurId,
        produitId: "",
        produitNom: "",
        quantite: "1",
        prix_achat: "",
        prix_vente: "",
      });
      setEditingIndex(null);
    }
    setModalOpen(true);
  };

  const fermerModal = () => {
    setModalOpen(false);
    setLigneTemp({
      utilisateurId: formUtilisateurId,
      produitId: "",
      produitNom: "",
      quantite: "1",
      prix_achat: "",
      prix_vente: "",
    });
    setEditingIndex(null);
  };

  const confirmerLigne = () => {
    const utilisateurIdNum = Number(formUtilisateurId);
    const produitIdNum = Number(ligneTemp.produitId);
    const produitNomNum = ligneTemp.produitNom;
    const quantiteNum = Number(ligneTemp.quantite);
    const prixAchatNum = Number(ligneTemp.prix_achat);
    const prixVenteNum = Number(ligneTemp.prix_vente);

    if (!produitIdNum || !quantiteNum || !prixVenteNum) {
      alert("Veuillez remplir tous les champs avec des valeurs valides.");
      return;
    }

    const nouvelleLigne = {
      utilisateurId: utilisateurIdNum,
      produitId: produitIdNum,
      produitNom: produitNomNum,
      quantite: quantiteNum,
      prix_achat: prixAchatNum,
      prix_vente: prixVenteNum,
    };

    if (editingIndex !== null) {
      const updated = [...lignesVente];
      updated[editingIndex] = nouvelleLigne;
      setLignesVente(updated);
    } else {
      setLignesVente([...lignesVente, nouvelleLigne]);
    }

    fermerModal();
  };

  const supprimerLigneTemp = (index: number) => {
    const updated = lignesVente.filter((_, i) => i !== index);
    setLignesVente(updated);
  };

  if (!mounted) return null;

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(prix);
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            padding: 30,
            width: "100%",
            maxWidth: 1200,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Ajout Ligne */}
          <section
            style={{
              background: "#f4f4f4",
              padding: 20,
              borderRadius: 8,
              marginBottom: 30,
            }}
          >
            <button
              onClick={() => ouvrirModal()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                marginBottom: 10,
                cursor: creating ? "not-allowed" : "pointer",
              }}
            >
              + Ajouter une ligne
            </button>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 10,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: " #04AA6D" }}>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix (GNF)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lignesVente.map((ligne, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        textAlign: "center",
                        border: "1px solid #ddd",
                        padding: "8px",
                      }}
                    >
                      {ligne.produitNom}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        border: "1px solid #ddd",
                        padding: "8px",
                      }}
                    >
                      {ligne.quantite}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        border: "1px solid #ddd",
                        padding: "8px",
                      }}
                    >
                      {formatPrix(ligne.prix_vente)}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        border: "1px solid #ddd",
                        padding: "8px",
                      }}
                    >
                      <button
                        onClick={() => ouvrirModal(i)}
                        style={{
                          marginRight: 8,
                          backgroundColor: "#2196f3",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: 4,
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => supprimerLigneTemp(i)}
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: 4,
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={ouvrirConfirmationModal}
              disabled={creating}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: creating ? "not-allowed" : "pointer",
              }}
            >
              {creating ? "Création..." : "Créer la vente"}
            </button>
          </section>

          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 12,
                padding: 30,
                width: "100%",
                maxWidth: 1200,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Filtres */}
              <section style={{ marginBottom: 20 }}>
                <h3 className="text-lg font-bold mb-2">Filtres</h3>
                <div className="flex gap-4 flex-wrap">
                  <div>
                    <label>Date début :</label>
                    <input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="border p-1 rounded"
                    />
                  </div>
                  <div>
                    <label>Date fin :</label>
                    <input
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="border p-1 rounded"
                    />
                  </div>
                  <div>
                    <label>Type :</label>
                    <select
                      value={typeVenteFilter}
                      onChange={(e) =>
                        setTypeVenteFilter(e.target.value as any)
                      }
                      className="border p-1 rounded"
                    >
                      <option value="">Tous</option>
                      <option value="ACHAT">Achat</option>
                      <option value="CREDIT">Crédit</option>
                    </select>
                  </div>
                  <div>
                    <label>Boutique :</label>
                    <select
                      value={boutiqueFilter}
                      onChange={(e) => setBoutiqueFilter(e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="">Toutes</option>
                      {boutiques.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <h4 className="mt-2 font-semibold">
                  Total filtré : {totalFiltre.toLocaleString()} GNF
                </h4>
              </section>

              {/* Tableau des ventes */}
              {loading ? (
                <p>Chargement...</p>
              ) : error ? (
                <p className="text-red-600">Erreur : {error}</p>
              ) : ventesPaginees.length === 0 ? (
                <p>Aucune vente trouvée.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg">
                    <thead className="bg-green-600 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Actions</th>
                        <th className="px-4 py-2 text-center">Date</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-right">Type</th>
                        <th className="px-4 py-2 text-left">Vendeur</th>
                        <th className="px-4 py-2 text-left">Boutique</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventesPaginees.map((vente, i) => (
                        <React.Fragment key={vente.id}>
                          <tr className="border-b">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                  className="text-xl hover:text-green-600"
                                  title="Afficher les détails"
                                >
                                  {openIndex === i ? "🔼" : "🔽"}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center font-semibold">
                              {vente.createdAt
                                ? new Intl.DateTimeFormat("fr-FR", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }).format(new Date(vente.createdAt))
                                : "Date inconnue"}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {vente.total?.toLocaleString()} GNF
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {vente.type}
                            </td>
                            <td className="px-4 py-2 text-left">
                              {vente.vendeurNom}
                            </td>
                            <td className="px-4 py-2 text-left">
                              {vente.boutiqueNom}
                            </td>
                          </tr>

                          {openIndex === i && (
                            <tr className="bg-gray-100">
                              <td colSpan={6} className="px-6 py-4 w-full">
                                <div className="w-full overflow-auto">
                                  <table className="w-full border border-gray-300 text-sm">
                                    <thead className="bg-green-100">
                                      <tr>
                                        <th className="px-3 py-2 border">Produit</th>
                                        <th className="px-3 py-2 border">Quantité</th>
                                        <th className="px-3 py-2 border">Prix Achat</th>
                                        <th className="px-3 py-2 border">Prix Vente</th>
                                        <th className="px-3 py-2 border">Total Achat</th>
                                        <th className="px-3 py-2 border">Total Vente</th>
                                        <th className="px-3 py-2 border">Bénéfice</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {vente.LigneVentes.map((ligne, j) => (
                                        <tr key={j} className="border-t">
                                          <td className="px-3 py-2 text-center border">
                                            {ligne.Produit?.nom || "Produit inconnu"}
                                          </td>
                                          <td className="px-3 py-2 text-center border">
                                            {ligne.quantite}
                                          </td>
                                          <td className="px-3 py-2 text-center border">
                                            {formatPrix(ligne?.prix_achat ?? 0)}
                                          </td>
                                          <td className="px-3 py-2 text-center border">
                                            {formatPrix(ligne.prix_vente ?? 0)}
                                          </td>
                                          <td className="px-3 py-2 text-center border">
                                            {formatPrix(
                                              ligne.quantite * (ligne?.prix_achat ?? 0)
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-center border">
                                            {formatPrix(
                                              ligne.quantite * (ligne.prix_vente ?? 0)
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-center border">
                                            {formatPrix(
                                              ligne.quantite * (ligne.prix_vente ?? 0) -
                                              ligne.quantite * (ligne?.prix_achat ?? 0)
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-2 py-1 border rounded ${
                      currentPage === i + 1 ? "bg-green-600 text-white" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editingIndex !== null ? "Modifier la ligne" : "Ajouter une ligne"}
            </h2>
            <select
              value={ligneTemp.produitId}
              onChange={(e) => {
                const selected = dataProduit.find((p) => p.id === Number(e.target.value));
                setLigneTemp({
                  ...ligneTemp,
                  produitId: e.target.value,
                  produitNom: selected?.nom || "",
                  prix_achat: selected?.prix_achat.toString() || "",
                  prix_vente: selected?.prix_vente.toString() || "",
                });
              }}
              className="border w-full p-2 mb-2"
            >
              <option value="">-- Sélectionner un produit --</option>
              {dataProduit.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.nom}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={ligneTemp.quantite}
              onChange={(e) => setLigneTemp({ ...ligneTemp, quantite: e.target.value })}
              className="border w-full p-2 mb-2"
              placeholder="Quantité"
            />
            <input
              type="number"
              value={ligneTemp.prix_vente}
              onChange={(e) => setLigneTemp({ ...ligneTemp, prix_vente: e.target.value })}
              className="border w-full p-2 mb-2"
              placeholder="Prix de vente"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={fermerModal}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
              >
                Annuler
              </button>
              <button
                onClick={confirmerLigne}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirmer la vente</h2>
            <select
              value={venteType}
              onChange={(e) => setVenteType(e.target.value as "ACHAT" | "CREDIT")}
              className="border w-full p-2 mb-2"
            >
              <option value="ACHAT">Achat direct</option>
              <option value="CREDIT">Vente à crédit</option>
            </select>
            {venteType === "CREDIT" && (
              <select
                value={clientId ?? ""}
                onChange={(e) => setClientId(Number(e.target.value))}
                className="border w-full p-2 mb-2"
              >
                <option value="">-- Sélectionner un client --</option>
                {clientsData.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom}
                  </option>
                ))}
              </select>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={fermerConfirmationModal}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
              >
                Annuler
              </button>
              <button
                onClick={() => creerVenteAvecType(venteType, clientId)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
