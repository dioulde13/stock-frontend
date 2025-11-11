"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";

type Fournisseur = {
  id: number;
  nom: string;
};

type Utilisateur = {
  id: number;
  nom: string;
};

type Produit = {
  id: number;
  nom: string;
  prix_vente: number;
  prix_achat: number;
  stock_actuel: number;
};

type LigneAchat = {
  id?: number;
  utilisateurId: number;
  fournisseurId: number;
  produitId: number;
  produitNom: string;
  fournisseurNom: string;
  quantite: number;
  prix_achat: number;
  prix_vente: number;
  Produit?: Produit;
};

type Achat = {
  id: number;
  total: number;
  status: string;
  type: string;
  nomPersonneAnnuler: string;
  createdAt: string;
  vendeurNom?: string;
  boutiqueNom?: string;
  LigneAchats: LigneAchat[];
};

export default function AchatPage() {
  const [achats, setAchats] = useState<Achat[]>([]);
  const [lignesAchat, setLignesAchat] = useState<LigneAchat[]>([]);
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
    fournisseurId: string;
    produitNom: string;
    fournisseurNom: string;
    quantite: string;
    prix_achat: number;
    prix_vente: number;
  }>({
    utilisateurId: formUtilisateurId,
    produitId: "",
    fournisseurId: "",
    produitNom: "",
    fournisseurNom: "",
    quantite: "1",
    prix_achat: 0,
    prix_vente: 0,
  });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dataProduit, setDataProduit] = useState<Produit[]>([]);
  const [dataFournissseur, setDataFournisseeur] = useState<Fournisseur[]>([]);
  const [dataUtilisateur, setDataUtilisateur] = useState<Fournisseur[]>([]);
  const [clientsData, setClientsData] = useState<{ id: number; nom: string }[]>(
    []
  );
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [venteType, setVenteType] = useState<"ACHAT" | "CREDIT">("ACHAT");
  const [clientId, setClientId] = useState<number | null>(null);

  const [utilisateur, setUtilisateur] = useState<any>({});

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log(parsedUser);
        setFormUtilisateurId(Number(parsedUser.id));
        setUtilisateur(parsedUser);
      } catch {}
    }

    setMounted(true);
    fetchAchats();
    fetchProduits();
    fetchFournisseurs();
    fetchUtilisateur();
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

  const fetchUtilisateur = async () => {
    try {
      const token = localStorage.getItem("token");
       if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/utilisateur/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des utilisateur");
      const utilisateur: Utilisateur[] = await res.json();
      setDataUtilisateur(utilisateur);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const token = localStorage.getItem("token");
       if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/fournisseur/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok)
        throw new Error("Erreur lors du chargement des fournisseurs");
      const fournisseur: Fournisseur[] = await res.json();
      setDataFournisseeur(fournisseur);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
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
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message.message);
      }
      const produit: Produit[] = await res.json();
      const filteredData = produit.filter(
        (produit: any) => produit.status !== "ANNULER"
      );
      setDataProduit(filteredData);
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ventesParPage = 2;

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

  const boutiques = Array.from(
    new Set(achats.map((v) => v.boutiqueNom).filter(Boolean))
  );

  const fetchAchats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
       if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/achat/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des ventes");

      const data: Achat[] = await res.json();
      console.log(data);
      // console.log(data);
      const dataTransformee: Achat[] = data.map((v: any) => ({
        ...v,
        vendeurNom: v.Utilisateur?.nom ?? "",
        boutiqueNom: v.Utilisateur?.Boutique?.nom ?? "",
      }));
      // setVentes(dataTransformee);
      setAchats(dataTransformee);
      console.log(dataTransformee);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  const filteredVentes = useMemo(() => {
    return achats.filter((v) => {
      console.log(v);
      const vDate = new Date(v.createdAt);
      const debut = parseLocalDate(dateDebut);
      debut.setHours(0, 0, 0, 0); // début de journée

      const fin = parseLocalDate(dateFin);
      fin.setHours(23, 59, 59, 999); // fin de journée (inclus)
      if (vDate < debut || vDate > fin) return false;
      if (typeVenteFilter && v.type !== typeVenteFilter) return false;
      if (boutiqueFilter && v.boutiqueNom !== boutiqueFilter) return false;
      return true;
    });
  }, [achats, dateDebut, dateFin, typeVenteFilter, boutiqueFilter]);

  console.log(filteredVentes);
  // Total filtré
  const totalFiltre = useMemo(() => {
    return filteredVentes
      .filter((v: any) => v.status !== "ANNULER") // 🟢 exclure les ventes annulées
      .reduce((acc, v) => {
        return (
          acc +
          v.LigneAchats.reduce(
            (sum, l) => sum + l.quantite * (l.prix_achat ?? 0),
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
          v.LigneAchats.reduce(
            (sum, l) => sum + l.quantite * (l.prix_achat ?? 0),
            0
          )
        );
      }, 0);
  }, [filteredVentes]);

  console.log(filteredVentes);

  // Pagination
  const indexDerniereVente = currentPage * ventesParPage;
  const indexPremiereVente = indexDerniereVente - ventesParPage;
  const ventesPaginees = filteredVentes.slice(
    indexPremiereVente,
    indexDerniereVente
  );
  const totalPages = Math.ceil(filteredVentes.length / ventesParPage);
  const handlePageChange = (page: number) => setCurrentPage(page);

  const creerAchatAvecType = async (
    type: "ACHAT" | "CREDIT",
    clientId: number | null
  ) => {
    if (lignesAchat.length === 0) {
      alert("Ajoutez au moins une ligne de vente.");
      return;
    }
    const lignesValides = lignesAchat.every(
      (ligne) =>
        ligne.produitId > 0 && ligne.quantite > 0 && ligne.prix_vente > 0
    );
    if (!lignesValides) {
      alert("Veuillez remplir correctement toutes les lignes de vente.");
      return;
    }

    const { utilisateurId, fournisseurId } = lignesAchat[0];

    const lignesFormattees = lignesAchat.map((ligne) => ({
      produitId: ligne.produitId,
      quantite: ligne.quantite,
      prix_achat: ligne.prix_achat,
      prix_vente: ligne.prix_vente,
    }));

    const payload = {
      utilisateurId,
      fournisseurId,
      lignes: lignesFormattees,
    };

    console.log(payload);
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
       if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/achat/create`, {
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
      alert("Achat créée avec succès !");
      setLignesAchat([]);
      fetchAchats();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  // const supprimerVente = async (id: number) => {
  //   if (!confirm("Voulez-vous vraiment supprimer cette vente ?")) return;
  //   setDeletingId(id);
  //   try {
  //     const res = await fetch(
  //       `http://localhost:3000/api/achat/supprimer/${id}`,
  //       {
  //         method: "DELETE",
  //       }
  //     );
  //     if (!res.ok) throw new Error("Erreur lors de la suppression");
  //     alert("Vente supprimée");
  //     fetchAchats();
  //   } catch (e) {
  //     alert((e as Error).message);
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  const ouvrirModal = (index?: number) => {
    if (typeof index === "number") {
      const ligne = lignesAchat[index];
      setLigneTemp({
        utilisateurId: ligne.utilisateurId.valueOf(),
        fournisseurId: ligne.fournisseurId.toString(),
        produitNom: ligne.produitNom.toString(),
        fournisseurNom: ligne.fournisseurNom.toString(),
        produitId: ligne.produitId.toString(),
        quantite: ligne.quantite.toString(),
        prix_achat: Number(ligne.prix_achat.valueOf),
        prix_vente: Number(ligne.prix_vente.valueOf),
      });
      setEditingIndex(index);
    } else {
      setLigneTemp({
        utilisateurId: formUtilisateurId,
        fournisseurId: "",
        produitId: "",
        produitNom: "",
        fournisseurNom: "",
        quantite: "1",
        prix_achat: 0,
        prix_vente: 0,
      });
      setEditingIndex(null);
    }
    setModalOpen(true);
  };

  const fermerModal = () => {
    setModalOpen(false);
    setLigneTemp({
      utilisateurId: formUtilisateurId,
      fournisseurId: "",
      produitId: "",
      produitNom: "",
      fournisseurNom: "",
      quantite: "1",
      prix_achat: 0,
      prix_vente: 0,
    });
    setEditingIndex(null);
  };

  const confirmerLigne = () => {
    const utilisateurIdNum = Number(formUtilisateurId);
    const fournisseurIdNum = Number(ligneTemp.fournisseurId);
    const produitIdNum = Number(ligneTemp.produitId);
    const produitNomNum = ligneTemp.produitNom;
    const fournisseurNomNum = ligneTemp.fournisseurNom;
    const quantiteNum = Number(ligneTemp.quantite);
    const prixAchatNum = Number(ligneTemp.prix_achat);
    const prixVenteNum = Number(ligneTemp.prix_vente);

    if (
      !fournisseurIdNum ||
      !produitIdNum ||
      !quantiteNum ||
      !prixAchatNum ||
      !prixVenteNum
    ) {
      alert("Veuillez remplir tous les champs avec des valeurs valides.");
      return;
    }

    if (!produitNomNum || !fournisseurNomNum) {
      alert("Le produit et le fournisseur sont obligatoires.");
      return;
    }

    const nouvelleLigne = {
      utilisateurId: utilisateurIdNum,
      fournisseurId: fournisseurIdNum,
      produitId: produitIdNum,
      produitNom: produitNomNum,
      fournisseurNom: fournisseurNomNum,
      quantite: quantiteNum,
      prix_achat: prixAchatNum,
      prix_vente: prixVenteNum,
    };

    if (editingIndex !== null) {
      const updated = [...lignesAchat];
      updated[editingIndex] = nouvelleLigne;
      setLignesAchat(updated);
    } else {
      setLignesAchat([...lignesAchat, nouvelleLigne]);
    }

    fermerModal();
  };

  const supprimerLigneTemp = (index: number) => {
    const updated = lignesAchat.filter((_, i) => i !== index);
    setLignesAchat(updated);
  };

  // 🔹 Nouveau : état pour le modal d’annulation
  const [showModalAnnulation, setShowModalAnnulation] = useState(false);
  const [achatAnnuler, setAchatAnnuler] = useState<Achat | null>(null);

  // const [notification, setNotification] = useState<string | null>(null);
  // const showNotification = (msg: string) => {
  //   setNotification(msg);
  //   setTimeout(() => setNotification(null), 1500);
  // };

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({
    message: "",
    type: null,
  });

  const showNotification = (
    msg: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification({ message: "", type: null }), 1500);
  };

  // 🔹 Annulation d'une vente
  const handleAnnulerAchat = async () => {
    if (!achatAnnuler) return;
    try {
      const token = localStorage.getItem("token");
       if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(
        `${APP_URL}/api/achat/annuler/${achatAnnuler.id}`,
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
      showNotification("Vente enregistrée avec succès", "success");
      setShowModalAnnulation(false);
      setAchatAnnuler(null);
      fetchAchats();
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

  return (
    <DashboardLayout>
      <div style={{ margin: "auto", padding: 20 }}>
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
          {/* section d'ajout de ligne */}
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
                  {/* <th>ID Utilisateur</th> */}
                  <th>Nom fournissseur</th>
                  <th>Nom produit</th>
                  <th>Quantité</th>
                  <th>Prix d'achat (GNF)</th>
                  <th>Prix de vente (GNF)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lignesAchat.map((ligne, i) => (
                  <tr key={i}>
                    {/* <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>{ligne.utilisateurId}</td> */}
                    <td
                      style={{
                        textAlign: "center",
                        border: "1px solid #ddd",
                        padding: "8px",
                      }}
                    >
                      {ligne.fournisseurNom}
                    </td>
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
                      {formatPrix(ligne.prix_achat)}
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
                <div className="flex flex-wrap gap-4 bg-white border rounded-lg mt-2 p-4 text-sm">
                  <h4 className="mt-2 font-semibold">
                    Total Valider : {totalFiltre.toLocaleString()} GNF
                  </h4>
                  <h4 className="mt-2 font-semibold">
                    Total Annuler: {totalAnnulerFiltre.toLocaleString()} GNF
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
                                        setAchatAnnuler(vente);
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
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {vente.LigneAchats?.map((ligne, j) => (
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
          {/* modal */}
          {modalOpen && (
            <div
              onClick={fermerModal}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "white",
                  padding: 20,
                  borderRadius: 8,
                  width: "90%",
                  maxWidth: 600,
                }}
              >
                <h3
                  style={{
                    marginBottom: 15,
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                  }}
                >
                  {editingIndex !== null
                    ? "Modifier la ligne"
                    : "Ajouter une ligne"}
                </h3>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Fournisseur :
                </label>
                <select
                  value={ligneTemp.fournisseurId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedFournisseur = dataFournissseur.find(
                      (p) => p.id.toString() === selectedId
                    );
                    if (selectedFournisseur) {
                      setLigneTemp({
                        ...ligneTemp,
                        fournisseurId: selectedId,
                        fournisseurNom: selectedFournisseur.nom,
                      });
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    marginBottom: 15,
                    backgroundColor: "#f9f9f9",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">-- Sélectionnez un fournisseur --</option>
                  {dataFournissseur.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nom}
                    </option>
                  ))}
                </select>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Produit :
                </label>
                <select
                  value={ligneTemp.produitId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedProduit = dataProduit.find(
                      (p) => p.id.toString() === selectedId
                    );
                    if (selectedProduit) {
                      setLigneTemp({
                        ...ligneTemp,
                        produitId: selectedId,
                        produitNom: selectedProduit.nom,
                        prix_achat: Number(selectedProduit.prix_achat.valueOf),
                      });
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    marginBottom: 15,
                    backgroundColor: "#f9f9f9",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">-- Sélectionnez un produit --</option>
                  {dataProduit.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nom} - {prod.prix_achat} - {prod.prix_vente} -{" "}
                      {prod.stock_actuel}
                    </option>
                  ))}
                </select>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Quantité :
                </label>
                <input
                  type="number"
                  placeholder="Quantité"
                  min={1}
                  value={ligneTemp.quantite}
                  onChange={(e) =>
                    setLigneTemp({ ...ligneTemp, quantite: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    marginBottom: 15,
                    fontSize: "1rem",
                  }}
                />

                <label style={{ display: "block", marginBottom: 8 }}>
                  Prix d'achat :
                </label>
                <input
                  type="text"
                  value={
                    ligneTemp.prix_achat
                      ? new Intl.NumberFormat("fr-FR").format(
                          ligneTemp.prix_achat
                        )
                      : ""
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\s/g, "");
                    setLigneTemp({
                      ...ligneTemp,
                      prix_achat: Number(rawValue) || 0,
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    marginBottom: 20,
                    fontSize: "1rem",
                  }}
                />

                <label style={{ display: "block", marginBottom: 8 }}>
                  Prix de vente :
                </label>
                <input
                  type="text"
                  value={
                    ligneTemp.prix_vente
                      ? new Intl.NumberFormat("fr-FR").format(
                          ligneTemp.prix_vente
                        )
                      : ""
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\s/g, "");
                    setLigneTemp({
                      ...ligneTemp,
                      prix_vente: Number(rawValue) || 0,
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    marginBottom: 20,
                    fontSize: "1rem",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={confirmerLigne}
                    style={{
                      background: "#4caf50",
                      color: "#fff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 6,
                      fontSize: "1rem",
                    }}
                  >
                    Valider
                  </button>
                  <button
                    onClick={fermerModal}
                    style={{
                      background: "#ccc",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 6,
                      fontSize: "1rem",
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirmer la vente</h2>
            <select
              value={venteType}
              onChange={(e) =>
                setVenteType(e.target.value as "ACHAT" | "CREDIT")
              }
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
                onClick={() => creerAchatAvecType(venteType, clientId)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal de confirmation d’annulation */}
      {showModalAnnulation && achatAnnuler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Annuler l'achat #{achatAnnuler.id} ?
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler cet achat ? Cette action est
              irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModalAnnulation(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
              >
                Non
              </button>
              <button
                onClick={handleAnnulerAchat}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.message && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded text-white shadow-lg transition-all duration-300
      ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {notification.message}
        </div>
      )}

      {/* {notification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {notification}
        </div>
      )} */}
    </DashboardLayout>
  );
}
