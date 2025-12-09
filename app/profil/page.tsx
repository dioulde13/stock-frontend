"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<"infos" | "password">("infos");
  const [utilisateur, setUtilisateur] = useState<any>(null);

  // États du formulaire infos
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");

  // États du formulaire mot de passe
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading pour les deux formulaires
  const [loadingInfos, setLoadingInfos] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Charger les infos utilisateur
  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      const parsed = JSON.parse(user);
      setUtilisateur(parsed);
      setNom(parsed.nom);
      setEmail(parsed.email);
    }
  }, []);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- Modifier les infos utilisateur ---
  const handleUpdateInfos = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoadingInfos(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${APP_URL}/api/utilisateur/modifier`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom, email }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      const message =
        data?.message ||
        (res.ok ? "Versement créé avec succès" : "Erreur lors de la création");

      if (res.ok) {
        showNotification(message, "success");
      } else {
        showNotification(message, "error");
      }

      const updatedUser = { ...utilisateur, nom, email };
      localStorage.setItem("utilisateur", JSON.stringify(updatedUser));
      setUtilisateur(updatedUser);

      showNotification("Profil mis à jour avec succès ✅");
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoadingInfos(false);
    }
  };

  // --- Modifier le mot de passe ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoadingPassword(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${APP_URL}/api/utilisateur/updatePassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      const message =
        data?.message ||
        (res.ok ? "Versement créé avec succès" : "Erreur lors de la création");

      if (res.ok) {
        showNotification(message, "success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
           // Reset formulaire
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Déconnexion automatique
      localStorage.removeItem("token");
      localStorage.removeItem("utilisateur");
      } else {
        showNotification(message, "error");
      }

      
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <DashboardLayout title="Profil">
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
      <section className="w-11/12 md:w-[60%] py-10">
        {/* Onglets */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("infos")}
            className={`px-6 py-2 font-medium ${
              activeTab === "infos"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Modifier mes infos
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-6 py-2 font-medium ${
              activeTab === "password"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Modifier mot de passe
          </button>
        </div>

        {message && (
          <p className="text-green-600 text-center mb-4">{message}</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* --- TAB INFOS --- */}
        {activeTab === "infos" && (
          <form
            onSubmit={handleUpdateInfos}
            className="bg-white shadow-md rounded-lg p-6 space-y-4"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingInfos}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingInfos}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                loadingInfos
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loadingInfos}
            >
              {loadingInfos ? "Chargement..." : "Modifier"}
            </button>
          </form>
        )}

        {/* --- TAB PASSWORD --- */}
        {activeTab === "password" && (
          <form
            onSubmit={handleChangePassword}
            className="bg-white shadow-md rounded-lg p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancien mot de passe
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                disabled={loadingPassword}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={loadingPassword}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={loadingPassword}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                loadingPassword
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loadingPassword}
            >
              {loadingPassword ? "Chargement..." : "Modifier"}
            </button>
          </form>
        )}
      </section>
    </DashboardLayout>
  );
}
