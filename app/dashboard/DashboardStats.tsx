"use client";

import { useState, useEffect } from "react";
import { APP_URL } from "../environnement/environnements";

type Statistiques = {
  ventesTotal: number;
  achatsTotal: number;
  beneficeTotal: number;
  produitsEnStock: number;
  rupturesStock: number;
  alertesStock: number;
  valeurStock: number;
  valeurTotalVendu: number;
  valeurTotalAchat: number;
};

const defaultStats: Statistiques = {
  ventesTotal: 0,
  achatsTotal: 0,
  beneficeTotal: 0,
  produitsEnStock: 0,
  rupturesStock: 0,
  alertesStock: 0,
  valeurStock: 0,
  valeurTotalVendu: 0,
  valeurTotalAchat: 0,
};

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [stats, setStats] = useState<Statistiques>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");

  const [caisses, setCaisses] = useState<Record<string, number>>({});
  const [newCaisseType, setNewCaisseType] = useState("");
  const [newCaisseSolde, setNewCaisseSolde] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [formUtilisateurId, setFormUtilisateurId] = useState<number | null>(
    null
  );

  // 🧩 Initialisation
  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setFormUtilisateurId(Number(parsedUser.id));
      } catch (err) {
        console.error("Erreur parsing utilisateur", err);
      }
    }

    const now = new Date();
    const debut = new Date(now.getFullYear(), now.getMonth(), 1);
    const fin = new Date();

    setDateDebut(debut.toISOString().split("T")[0]);
    setDateFin(fin.toISOString().split("T")[0]);
    setHydrated(true);
  }, []);

  // 🧾 Fetch stats et caisses
  useEffect(() => {
    if (!hydrated || !dateDebut || !dateFin) return;
    fetchStats(dateDebut, dateFin);
    fetchCaisses();
  }, [hydrated, dateDebut, dateFin]);

  // 📊 Récupération des statistiques
  const fetchStats = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }

      const res = await fetch(
        `${APP_URL}/api/dashboard/statistique?dateDebut=${start}&dateFin=${end}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Erreur API Statistiques");
      const data = await res.json();

      setStats({ ...defaultStats, ...data });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 💰 Récupération des caisses selon rôle utilisateur
  const fetchCaisses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token JWT manquant.");
        return;
      }

      const res = await fetch(`${APP_URL}/api/caisse/listeParRole`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur API caisses");

      const data = await res.json();
      setCaisses(data || {});
    } catch (err) {
      console.error("Erreur fetchCaisses:", err);
    }
  };

  // ➕ Ajouter une caisse
  const handleAddCaisse = async () => {
    if (!newCaisseType.trim()) {
      alert("Le type de la caisse est obligatoire");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token JWT manquant");

      const res = await fetch(`${APP_URL}/api/caisse/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          utilisateurId: formUtilisateurId,
          solde_actuel: newCaisseSolde,
          type: newCaisseType,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création de la caisse");

      setNewCaisseSolde(0);
      setNewCaisseType("");
      setShowAddModal(false);
      fetchCaisses();
    } catch (err) {
      console.error(err);
    }
  };

  if (!hydrated) return null;
  if (loading) return <p className="p-6">Chargement...</p>;
  if (error) return <p className="p-6 text-red-600">Erreur : {error}</p>;

  // 🧮 Données à afficher
  const displayStats = [
    // { title: 'Argent encaissé lors des ventes', value: caisses.PRINCIPALE ?? 0, color: 'bg-gray-400', icon: 'ri-bank-line' },
    // { title: 'Bénéfice', value: caisses.BENEFICE ?? 0, color: 'bg-purple-500', icon: 'ri-money-dollar-circle-line' },
    {
      title: "Valeur du stock",
      value: caisses.VALEUR_STOCK_PUR ?? 0,
      color: "bg-gray-400",
      icon: "ri-bank-line",
    },
    {
      title: "Produits en stock",
      value: stats.produitsEnStock,
      color: "bg-green-500",
      icon: "ri-box-3-line",
    },
    {
      title: "Ruptures de stock",
      value: stats.rupturesStock,
      color: "bg-red-500",
      icon: "ri-alert-line",
    },
    {
      title: "Alertes stock min",
      value: stats.alertesStock,
      color: "bg-orange-500",
      icon: "ri-error-warning-line",
    },
    {
      title: "Crédit espèce entré",
      value: caisses.CREDIT_ESPECE_ENTRE ?? 0,
      color: "bg-gray-400",
      icon: "ri-bank-line",
    },
    {
      title: "Crédit espèce sortie",
      value: caisses.CREDIT_ESPECE ?? 0,
      color: "bg-gray-400",
      icon: "ri-bank-line",
    },
    {
      title: "Argent des ventes à crédit",
      value: caisses.CREDIT_VENTE ?? 0,
      color: "bg-gray-400",
      icon: "ri-bank-line",
    },
    {
      title: "Crédit total",
      value: (caisses.CREDIT_ESPECE ?? 0) + (caisses.CREDIT_VENTE ?? 0),
      color: "bg-gray-500",
      icon: "ri-stack-line",
    },
    // { title: 'Crédit pour achats', value: caisses.CREDIT_ACHAT ?? 0, color: 'bg-gray-400', icon: 'ri-bank-line' },
    // { title: 'Argent utilisé pour achat via espèce', value: caisses.ACHAT_ESPACE ?? 0, color: 'bg-gray-400', icon: 'ri-bank-line' },
  ];

  return (
    <div className="p-6">
      {/* 📅 Filtres de dates */}
      {/* <div className="flex flex-wrap justify-between mb-6 items-center gap-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-wrap gap-6">
          <div className="flex flex-col">
            <label htmlFor="dateDebut" className="font-medium mb-1">
              Date début
            </label>
            <input
              type="date"
              id="dateDebut"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="dateFin" className="font-medium mb-1">
              Date fin
            </label>
            <input
              type="date"
              id="dateFin"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={() => setShowAddModal(true)}>
            Ajouter une caisse
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg" onClick={() => setShowListModal(true)}>
            Liste des caisses
          </button>
        </div>
      </div> */}

      {/* 🧾 Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()} GNF
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <i className={`${stat.icon} text-xl text-white`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🪙 Modal Ajouter Caisse */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Ajouter une caisse</h2>

            <select
              className="border rounded-lg px-3 py-2 w-full mb-3"
              value={newCaisseType}
              onChange={(e) => setNewCaisseType(e.target.value)}
            >
              <option value="">-- Sélectionner un type --</option>
              {[
                "CAISSE",
                "PRINCIPALE",
                "CREDIT_VENTE",
                "VALEUR_STOCK",
                "VALEUR_STOCK_PUR",
                "BENEFICE",
                "BENEFICE_CREDIT",
                "CREDIT_ACHAT",
                "ACHAT_ESPACE",
                "CREDIT_ESPECE",
                "CREDIT_ESPECE_ENTRE",
              ].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Solde initial"
              className="border rounded-lg px-3 py-2 w-full mb-3"
              value={newCaisseSolde}
              onChange={(e) => setNewCaisseSolde(parseFloat(e.target.value))}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleAddCaisse}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 Modal Liste des caisses */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Liste des caisses</h2>
            <div className="max-h-80 overflow-y-auto">
              {Object.keys(caisses).length === 0 ? (
                <p>Aucune caisse trouvée.</p>
              ) : (
                Object.entries(caisses).map(([key, value]) => (
                  <h5 key={key} className="mb-1">
                    {key} : {Number(value ?? 0).toLocaleString()} GNF
                  </h5>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowListModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
