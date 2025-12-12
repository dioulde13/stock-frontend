"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";

interface Utilisateur {
  id: number;
  role: string;
}

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<"infos" | "password">("infos");
  const [utilisateur, setUtilisateur] = useState<any>(null);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur | null>(null);

  // États du formulaire infos
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");

  // États du formulaire mot de passe
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // visibilité mots de passe
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingInfos, setLoadingInfos] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

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

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      const parsed = JSON.parse(user);
      setUtilisateur(parsed);
      setUtilisateurs(parsed);
      setNom(parsed.nom);
      setEmail(parsed.email);
    }
  }, []);

  // Mise à jour infos générales
  const handleUpdateInfos = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoadingInfos(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return (window.location.href = "/login");

      const res = await fetch(
        `${APP_URL}/api/utilisateur/modifier/${utilisateurs?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nom, email }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return showNotification(data.message || "Erreur lors de la mise à jour", "error");
      }

      const updatedUser = { ...utilisateur, nom, email };
      localStorage.setItem("utilisateur", JSON.stringify(updatedUser));
      setUtilisateur(updatedUser);

      showNotification("Profil mis à jour avec succès ✅");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingInfos(false);
    }
  };

  // Mise à jour mot de passe
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoadingPassword(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return (window.location.href = "/login");

      const res = await fetch(`${APP_URL}/api/utilisateur/updatePassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return showNotification(data.message || "Erreur lors de la mise à jour", "error");
      }

      showNotification("Mot de passe mis à jour ✔️", "success");

      // Déconnexion
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("utilisateur");
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      setError(err.message);
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

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* FORMULAIRE INFOS */}
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                loadingInfos ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loadingInfos ? "Enregistrement..." : "Modifier"}
            </button>
          </form>
        )}

        {/* FORMULAIRE MOT DE PASSE */}
        {activeTab === "password" && (
          <form
            onSubmit={handleChangePassword}
            className="bg-white shadow-md rounded-lg p-6 space-y-4"
          >
            {/* Ancien mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancien mot de passe
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl"
                >
                  {showOldPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Nouveau + Confirmer */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Nouveau */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl"
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Confirmer */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                loadingPassword
                  ? "bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loadingPassword ? "Enregistrement..." : "Modifier"}
            </button>
          </form>
        )}
      </section>
    </DashboardLayout>
  );
}
