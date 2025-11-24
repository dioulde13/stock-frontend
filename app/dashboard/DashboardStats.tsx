'use client';

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

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
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

  useEffect(() => {
    if (!hydrated || !dateDebut || !dateFin) return;
    fetchStats(dateDebut, dateFin);
    fetchCaisses();
  }, [hydrated, dateDebut, dateFin]);

  const fetchStats = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
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

  if (!hydrated) return null;
  if (loading) return <p className="p-6">Chargement...</p>;
  if (error) return <p className="p-6 text-red-600">Erreur : {error}</p>;

 const displayStats = [
  {
    title: "Valeur du stock",
    value: caisses.VALEUR_STOCK_PUR ?? 0,
    suffix: "GNF",
    color: "bg-indigo-500",
    bgCardColor: "bg-indigo-50",
    icon: "ri-stack-line",
  },
  {
    title: "Produits en stock",
    value: stats.produitsEnStock,
    color: "bg-green-500",
    bgCardColor: "bg-green-50",
    icon: "ri-box-3-line",
  },
  {
    title: "Ruptures de stock",
    value: stats.rupturesStock,
    color: "bg-red-500",
    bgCardColor: "bg-red-50",
    icon: "ri-alert-line",
  },
  {
    title: "Alertes stock min",
    value: stats.alertesStock,
    color: "bg-yellow-500",
    bgCardColor: "bg-yellow-50",
    icon: "ri-error-warning-line",
  },
  {
    title: "Crédit espèce entré",
    value: caisses.CREDIT_ESPECE_ENTRE ?? 0,
    suffix: "GNF",
    color: "bg-teal-500",
    bgCardColor: "bg-teal-50",
    icon: "ri-money-dollar-box-line",
  },
  {
    title: "Crédit espèce sortie",
    value: caisses.CREDIT_ESPECE ?? 0,
    suffix: "GNF",
    color: "bg-blue-500",
    bgCardColor: "bg-blue-50",
    icon: "ri-money-dollar-box-line",
  },
  {
    title: "Argent des achat à crédit",
    value: caisses.CREDIT_ACHAT ?? 0,
    suffix: "GNF",
    color: "bg-purple-500",
    bgCardColor: "bg-purple-50",
    icon: "ri-coin-line",
  },
  {
    title: "Argent des ventes à crédit",
    value: caisses.CREDIT_VENTE ?? 0,
    suffix: "GNF",
    color: "bg-purple-500",
    bgCardColor: "bg-purple-50",
    icon: "ri-coin-line",
  },
  {
    title: "Crédit total",
    value: (caisses.CREDIT_ESPECE ?? 0) + (caisses.CREDIT_VENTE ?? 0),
    suffix: "GNF",
    color: "bg-gray-500",
    bgCardColor: "bg-gray-50",
    icon: "ri-bank-line",
  },
];



  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bgCardColor} rounded-lg shadow-sm border border-gray-200 p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}  {stat.suffix ?? ""}
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
    </div>
  );
}
