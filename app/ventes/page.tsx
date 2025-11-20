"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";

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
  status: string;
  createdAt: string;
  LigneVentes: LigneVente[];
  vendeurNom?: string;
  boutiqueNom?: string;
  nomPersonneAnnuler?: string;
};

export default function VentesPage() {
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [venteType, setVenteType] = useState<"ACHAT" | "CREDIT">("ACHAT");
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientsData, setClientsData] = useState<{ id: number; nom: string }[]>(
    []
  );
  const [lignesVente, setLignesVente] = useState<LigneVente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formUtilisateurId, setFormUtilisateurId] = useState<number | null>(
    null
  );

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

  const [utilisateur, setUtilisateur] = useState<any>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ventesParPage = 5;

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUtilisateur(parsedUser);
      } catch {}
    }
    fetchVentes();
  }, []);

  const fetchVentes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/vente/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des ventes");
      const data = await res.json();
      console.log(data);
      const dataTransformee: Vente[] = data.map((v: any) => ({
        ...v,
        vendeurNom: v.Utilisateur?.nom ?? "",
        boutiqueNom: v.Utilisateur?.Boutique?.nom ?? "",
      }));
      setVentes(dataTransformee);
      // setVentes(dataTransformee);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // utilitaire pour parser YYYY-MM-DD en date locale sans effet UTC
  const parseLocalDate = (yyyyMmDd: string) => {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    return new Date(y, m - 1, d); // construit en local
  };

  // Filtre par défaut : mois en cours
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [dateDebut, setDateDebut] = useState(
    firstDayOfMonth.toISOString().split("T")[0]
  );
  const [dateFin, setDateFin] = useState(
    lastDayOfMonth.toISOString().split("T")[0]
  );
  const [typeVenteFilter, setTypeVenteFilter] = useState<
    "ACHAT" | "CREDIT" | ""
  >("");
  const [boutiqueFilter, setBoutiqueFilter] = useState<string>("");
  const [vendeurFilter, setVendeurFilter] = useState<string>("");

  // Filtrage (avec inclusion de toute la journée `dateFin`)
  const filteredVentes = useMemo(() => {
    return ventes.filter((v) => {
      const vDate = new Date(v.createdAt);

      const debut = parseLocalDate(dateDebut);
      debut.setHours(0, 0, 0, 0); // début de journée

      const fin = parseLocalDate(dateFin);
      fin.setHours(23, 59, 59, 999); // fin de journée (inclus)

      if (vDate < debut || vDate > fin) return false;
      if (typeVenteFilter && v.type !== typeVenteFilter) return false;
      if (boutiqueFilter && v.boutiqueNom !== boutiqueFilter) return false;
      if (vendeurFilter && v.vendeurNom !== vendeurFilter) return false;
      return true;
    });
  }, [
    ventes,
    dateDebut,
    dateFin,
    typeVenteFilter,
    boutiqueFilter,
    vendeurFilter,
  ]);

  // Total filtré
  const totalFiltre = useMemo(() => {
    return filteredVentes
      .filter((v: any) => v.status !== "ANNULER") // 🟢 exclure les ventes annulées
      .reduce((acc, v) => {
        return (
          acc +
          v.LigneVentes.reduce(
            (sum, l) => sum + l.quantite * (l.prix_vente ?? 0),
            0
          )
        );
      }, 0);
  }, [filteredVentes]);
  console.log(filteredVentes);

  // Total filtré
  const totalAnnulerFiltre = useMemo(() => {
    return filteredVentes
      .filter((v: any) => v.status === "ANNULER") // 🟢 exclure les ventes annulées
      .reduce((acc, v) => {
        return (
          acc +
          v.LigneVentes.reduce(
            (sum, l) => sum + l.quantite * (l.prix_vente ?? 0),
            0
          )
        );
      }, 0);
  }, [filteredVentes]);
  console.log(filteredVentes);
  // Total filtré
  const totalFiltreAchat = useMemo(() => {
    return filteredVentes
      .filter((v: any) => v.status !== "ANNULER") // 🟢 exclure les ventes annulées
      .reduce((acc, v) => {
        return (
          acc +
          v.LigneVentes.reduce(
            (sum, l) => sum + l.quantite * (l.prix_achat ?? 0),
            0
          )
        );
      }, 0);
  }, [filteredVentes]);
  console.log(filteredVentes);

  const beneficeTotal = totalFiltre - totalFiltreAchat;

  // Pagination
  const indexDerniereVente = currentPage * ventesParPage;
  const indexPremiereVente = indexDerniereVente - ventesParPage;
  const ventesPaginees = filteredVentes.slice(
    indexPremiereVente,
    indexDerniereVente
  );
  const totalPages = Math.ceil(filteredVentes.length / ventesParPage);
  const handlePageChange = (page: number) => setCurrentPage(page);

  // Liste unique des boutiques pour filtre
  const boutiques = Array.from(
    new Set(ventes.map((v) => v.boutiqueNom).filter(Boolean))
  );

  // Liste unique des boutiques pour filtre
  const vendeurs = Array.from(
    new Set(ventes.map((v) => v.vendeurNom).filter(Boolean))
  );

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
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/client/liste`, {
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
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/produit/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement du produit");
      const data = await res.json();
      const filteredData = data.filter(
        (produit: any) => produit.status !== "ANNULER"
      );
      setDataProduit(filteredData);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Affichage des notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // 2s pour que ce soit plus visible
  };

  const [isLoading, setIsLoading] = useState(false);

  const creerVenteAvecType = async (
    type: "ACHAT" | "CREDIT",
    clientId: number | null
  ) => {
    if (lignesVente.length === 0) {
      return showNotification("Ajoutez au moins une ligne de vente.", "error");
    }

    const lignesValides = lignesVente.every(
      (ligne) =>
        ligne.produitId > 0 && ligne.quantite > 0 && ligne.prix_vente > 0
    );

    if (!lignesValides) {
      return showNotification(
        "Veuillez remplir correctement toutes les lignes de vente.",
        "error"
      );
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
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${APP_URL}/api/vente/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        fermerConfirmationModal();
        return showNotification(data.message || "Erreur inconnue", "error");
      }
      setIsLoading(false);
      fermerConfirmationModal();

      showNotification(data.message || "Vente créée avec succès !", "success");
      setLignesVente([]);
      fetchVentes();
    } catch (e: any) {
      setIsLoading(false);
      showNotification(e.message || "Erreur de connexion au serveur", "error");
    } finally {
      setIsLoading(false);
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

  // 🔹 Nouveau : état pour le modal d’annulation
  const [showModalAnnulation, setShowModalAnnulation] = useState(false);
  const [venteAAnnuler, setVenteAAnnuler] = useState<Vente | null>(null);

  // 🔹 Annulation d'une vente
  const handleAnnulerVente = async () => {
    if (!venteAAnnuler) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(
        `${APP_URL}/api/vente/annuler/${venteAAnnuler.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur d’annulation.");
      showNotification("Vente annulée avec succès", "success");
      setShowModalAnnulation(false);
      setVenteAAnnuler(null);
      fetchVentes();
    } catch (e) {
      showNotification((e as Error).message, "error");
    }
  };

  if (!mounted) return null;

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(prix);
  };

  const imprimerRecu = (vente: Vente) => {
    const contenu = `
    <html>
      <head>
        <title>${vente.boutiqueNom}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2>${vente.boutiqueNom}</h2>
        <p><strong>Date :</strong> ${new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(vente.createdAt))}</p>
        <p><strong>Type :</strong> ${vente.type}</p>
        <p><strong>Status :</strong> ${vente.status}</p>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix Vente</th>
              <th>Total Vente</th>
            </tr>
          </thead>
          <tbody>
            ${vente.LigneVentes.map(
              (ligne) => `
              <tr>
                <td>${ligne.Produit?.nom || "Produit inconnu"}</td>
                <td>${ligne.quantite}</td>
                <td>${ligne.prix_vente.toLocaleString()} GNF</td>
                <td>${(
                  ligne.quantite * ligne.prix_vente
                ).toLocaleString()} GNF</td>
              </tr>
            `
            ).join("")}
          </tbody>
        </table>
        <h3>Total : ${vente.total.toLocaleString()} GNF</h3>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(contenu);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
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
                padding: "10px 8px",
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

            {/* 👉 Conteneur scroll horizontal */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 10,
                  minWidth: 500, // 👈 important pour forcer le scroll sur mobile
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
            </div>

            <button
              onClick={ouvrirConfirmationModal}
              disabled={creating}
              style={{
                padding: "10px 8px",
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

          <div style={{ display: "flex", justifyContent: "center" }}>
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

                  {utilisateur?.role && utilisateur?.role === "ADMIN" && (
                    <>
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

                      <div>
                        <label>Vendeur :</label>
                        <select
                          value={vendeurFilter}
                          onChange={(e) => setVendeurFilter(e.target.value)}
                          className="border p-1 rounded"
                        >
                          <option value="">Toutes</option>
                          {vendeurs.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 bg-white border rounded-lg mt-2 p-4 text-sm">
                  <h4 className="mt-2 font-semibold">
                    Total valider : {totalFiltre.toLocaleString()} GNF
                  </h4>
                  {utilisateur?.role && utilisateur?.role === "ADMIN" && (
                    <>
                      <h4 className="mt-2 font-semibold">
                        Total bénéfice : {beneficeTotal.toLocaleString()} GNF
                      </h4>
                    </>
                  )}
                  <h4 className="mt-2 font-semibold">
                    Total annuler: {totalAnnulerFiltre.toLocaleString()} GNF
                  </h4>
                </div>
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
                        <th className="px-4 py-2 text-right">Status</th>
                        {utilisateur?.role && utilisateur?.role === "ADMIN" && (
                          <>
                            <th className="px-4 py-2 text-left">Vendeur</th>
                            <th className="px-4 py-2 text-left">Boutique</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {ventesPaginees.map((vente, i) => (
                        <React.Fragment key={vente.id}>
                          <tr className="border-b">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setOpenIndex(openIndex === i ? null : i)
                                  }
                                  className="text-xl hover:text-green-600"
                                  title="Afficher les détails"
                                >
                                  {openIndex === i ? "🔼" : "🔽"}
                                </button>
                                {utilisateur?.role &&
                                  utilisateur?.role !== "ADMIN" && (
                                    <button
                                      onClick={() => {
                                        setVenteAAnnuler(vente);
                                        setShowModalAnnulation(true);
                                      }}
                                      style={{
                                        fontSize: 13,
                                        fontWeight: "bold",
                                      }}
                                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                      Annuler
                                    </button>
                                  )}
                              </div>
                            </td>

                            <td
                              className="px-4 py-2 text-center"
                              style={{ fontSize: 13, fontWeight: "bold" }}
                            >
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
                            <td
                              style={{ fontSize: 13, fontWeight: "bold" }}
                              className="px-4 py-2 text-right"
                            >
                              {vente.total?.toLocaleString()} GNF
                            </td>
                            <td
                              style={{ fontSize: 13, fontWeight: "bold" }}
                              className="px-4 py-2 text-right"
                            >
                              {vente.type}
                            </td>
                            <td
                              style={{ fontSize: 13, fontWeight: "bold" }}
                              className={`px-6 py-4 text-right ${
                                vente.status === "VALIDER"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {vente.status}{" "}
                              {vente.nomPersonneAnnuler === null
                                ? ""
                                : `${"(" + vente.nomPersonneAnnuler + ")"}`}
                            </td>
                            {utilisateur?.role &&
                              utilisateur?.role === "ADMIN" && (
                                <>
                                  <td className="px-4 py-2 text-left">
                                    {vente.vendeurNom}
                                  </td>
                                  <td className="px-4 py-2 text-left">
                                    {vente.boutiqueNom}
                                  </td>
                                </>
                              )}
                          </tr>

                          {openIndex === i && (
                            <tr className="bg-gray-100">
                              <td colSpan={6} className="px-6 py-4 w-full">
                                <div className="w-full overflow-auto">
                                  <table className="w-full border border-gray-300 text-sm">
                                    <thead className="bg-green-100">
                                      <tr>
                                        <th className="px-3 py-2 border">
                                          Produit
                                        </th>
                                        <th className="px-3 py-2 border">
                                          Quantité
                                        </th>
                                        <th className="px-3 py-2 border">
                                          Prix Achat
                                        </th>
                                        <th className="px-3 py-2 border">
                                          Prix Vente
                                        </th>
                                        <th className="px-3 py-2 border">
                                          Total Achat
                                        </th>
                                        <th className="px-3 py-2 border">
                                          Total Vente
                                        </th>
                                        <th className="px-3 py-2 border">
                                          Bénéfice
                                        </th>
                                        {/* <th className="px-3 py-2 border">
                                          Action
                                        </th> */}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {vente.LigneVentes.map((ligne, j) => (
                                        <tr key={j} className="border-t">
                                          <td className="px-3 py-2 text-center border">
                                            {ligne.Produit?.nom ||
                                              "Produit inconnu"}
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
                                              ligne.quantite *
                                                (ligne?.prix_achat ?? 0)
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-center border">
                                            {formatPrix(
                                              ligne.quantite *
                                                (ligne.prix_vente ?? 0)
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-center border">
                                            {formatPrix(
                                              ligne.quantite *
                                                (ligne.prix_vente ?? 0) -
                                                ligne.quantite *
                                                  (ligne?.prix_achat ?? 0)
                                            )}
                                          </td>
                                          {/* <td className="px-3 py-2 text-center border">

                                          <button
                                            onClick={() => imprimerRecu(vente)}
                                            style={{
                                              fontSize: 13,
                                              fontWeight: "bold",
                                              backgroundColor: "#FFA500",
                                              color: "white",
                                              border: "none",
                                              padding: "5px 10px",
                                              borderRadius: 4,
                                              cursor: "pointer",
                                            }}
                                          >
                                            Imprimer
                                          </button>
                                          </td> */}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "end",
                                      paddingTop: "10px",
                                    }}
                                  >
                                    <button
                                      onClick={() => imprimerRecu(vente)}
                                      style={{
                                        fontSize: 13,
                                        fontWeight: "bold",
                                        backgroundColor: "#FFA500",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: 4,
                                        cursor: "pointer",
                                      }}
                                    >
                                      Imprimer
                                    </button>
                                  </div>
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
          <div
            className="
        bg-white p-6 rounded-2xl shadow-xl 
        w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3
        animate-[fadeIn_0.2s_ease-out]
      "
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingIndex !== null
                ? "Modifier la ligne"
                : "Ajouter une ligne"}
            </h2>

            {/* Sélecteur de produits */}
            <select
              value={ligneTemp.produitId}
              onChange={(e) => {
                const selected = dataProduit.find(
                  (p) => p.id === Number(e.target.value)
                );
                setLigneTemp({
                  ...ligneTemp,
                  produitId: e.target.value,
                  produitNom: selected?.nom || "",
                  prix_achat: selected?.prix_achat?.toString() || "",
                  prix_vente: selected?.prix_vente?.toString() || "",
                });
              }}
              className="border w-full p-3 rounded mb-3"
            >
              <option value="">-- Sélectionner un produit --</option>
              {dataProduit.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.nom} - {prod.prix_achat} - {prod.prix_vente} -{" "}
                  {prod.stock_actuel}
                </option>
              ))}
            </select>

            {/* Quantité */}
            <input
              type="number"
              value={ligneTemp.quantite}
              onChange={(e) =>
                setLigneTemp({ ...ligneTemp, quantite: e.target.value })
              }
              className="border w-full p-3 rounded mb-3"
              placeholder="Quantité"
            />

            {/* Prix de vente */}
            <input
              type="number"
              value={ligneTemp.prix_vente}
              onChange={(e) =>
                setLigneTemp({ ...ligneTemp, prix_vente: e.target.value })
              }
              className="border w-full p-3 rounded mb-3"
              placeholder="Prix de vente"
            />

            {/* Boutons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={fermerModal}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmerLigne}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
          <div
            className="
        bg-white p-6 rounded-2xl shadow-xl 
        w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3
        animate-[fadeIn_0.2s_ease-out]
      "
          >
            <h2 className="text-xl font-semibold mb-4">Confirmer la vente</h2>

            {/* Choix du type de vente */}
            <select
              value={venteType}
              onChange={(e) =>
                setVenteType(e.target.value as "ACHAT" | "CREDIT")
              }
              className="border w-full p-3 rounded mb-3"
            >
              <option value="ACHAT">Achat direct</option>
              <option value="CREDIT">Vente à crédit</option>
            </select>

            {/* Choix du client si crédit */}
            {venteType === "CREDIT" && (
              <select
                value={clientId ?? ""}
                onChange={(e) => setClientId(Number(e.target.value))}
                className="border w-full p-3 rounded mb-3"
              >
                <option value="">-- Sélectionner un client --</option>
                {clientsData.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom}
                  </option>
                ))}
              </select>
            )}

            {/* Boutons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={fermerConfirmationModal}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Annuler
              </button>

              <button
                onClick={() => creerVenteAvecType(venteType, clientId)}
                className={`
            px-4 py-2 rounded-lg text-white 
            ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer la vente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal de confirmation d’annulation */}
      {showModalAnnulation && venteAAnnuler && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
          <div
            className="
        bg-white p-6 rounded-2xl shadow-xl text-center
        w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3
        animate-[fadeIn_0.2s_ease-out]
      "
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Annuler la vente #{venteAAnnuler.id} ?
            </h3>

            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler cette vente ?<br />
              Cette action est{" "}
              <span className="font-semibold text-red-600">irréversible</span>.
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModalAnnulation(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Non
              </button>

              <button
                onClick={handleAnnulerVente}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
    </DashboardLayout>
  );
}
