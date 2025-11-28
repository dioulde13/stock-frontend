"use client";
import { useEffect, useState } from "react";
import { APP_URL } from "../environnement/environnements";
import "./RechargementModal.css";

interface VersementModalProps {
  boutiques: any[];
  onClose: () => void;
  onAdd: () => void;
}

export default function VersementModal({ boutiques, onClose, onAdd }: VersementModalProps) {
  const [utilisateurId, setUtilisateurId] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    montant: 0,
    description: "",
    type: "",
    boutiqueId: 0,
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("utilisateur");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        if (user?.id) setUtilisateurId(user.id);

        // 🆕 Vérifier si l'utilisateur est admin
        if (user?.role === "ADMIN") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);

          // 🆕 Si ce n’est pas un admin → on met automatiquement sa boutique
          if (user?.boutiqueId) {
            setForm((prev) => ({ ...prev, boutiqueId: Number(user.boutiqueId) }));
          }
        }
      } catch {}
    }
  }, []);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${APP_URL}/api/rechargement/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          utilisateurId: Number(utilisateurId),
          montant: Number(form.montant),
          description: form.description,
          boutiqueId: form.boutiqueId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const message = data?.message || (res.ok ? "Versement créé avec succès" : "Erreur lors de la création");

      if (res.ok) {
        showNotification(message, "success");
        onAdd();
      } else {
        showNotification(message, "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Erreur serveur. Veuillez réessayer.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification && (
        <div className={`notification ${notification.type}`}>{notification.message}</div>
      )}

      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Nouveau Versement</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Montant</label>
              <input
                type="text"
                placeholder="Montant"
                value={form.montant ? new Intl.NumberFormat("fr-FR").format(form.montant) : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, montant: raw ? Number(raw) : 0 });
                }}
                disabled={loading}
              />
            </div>

            {/* 🆕 Affichage conditionnel du select boutique */}
            {isAdmin ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Boutique
                </label>
                <select
                  value={form.boutiqueId}
                  required
                  onChange={(e) =>
                    setForm({ ...form, boutiqueId: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- Boutique --</option>
                  {boutiques.map((boutique: any) => (
                    <option key={boutique.id} value={boutique.id}>
                      {boutique.nom}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              // 🆕 Champ caché si pas admin
              <input type="hidden" value={form.boutiqueId} />
            )}

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={loading}
              ></textarea>
            </div>

            <div className="modal-buttons">
              <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
                Annuler
              </button>

              <button type="submit" className={`submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "Chargement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
