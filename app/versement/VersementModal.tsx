"use client";
import { useEffect, useState } from "react";
import { APP_URL } from "../environnement/environnements";
import "./VersementModal.css"; // ⬅️ Import du CSS

interface VersementModalProps {
  onClose: () => void;
  onAdd: () => void;
}

export default function VersementModal({
  onClose,
  onAdd,
}: VersementModalProps) {
  const [utilisateurId, setUtilisateurId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ montant: 0, description: "", type: "" });
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.id) setUtilisateurId(parsedUser.id);
      } catch {}
    }
  }, []);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
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

      const res = await fetch(`${APP_URL}/api/versement/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          utilisateurId: Number(utilisateurId),
          montant: Number(form.montant),
          description: form.description,
          type: form.type,
        }),
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
        onAdd();
      } else showNotification(message, "error");
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
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
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
                value={
                  form.montant
                    ? new Intl.NumberFormat("fr-FR").format(form.montant)
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setForm({
                    ...form,
                    montant: raw ? Number(raw) : 0,
                  });
                }}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">-- Sélectionner --</option>
                <option value="ESPECE">Espèce</option>
                <option value="COMPTE BANCAIRE">Compte bancaire</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                disabled={loading}
              ></textarea>
            </div>

            <div className="modal-buttons">
              <button
                type="button"
                onClick={onClose}
                className="cancel-btn"
                disabled={loading}
              >
                Annuler
              </button>

              <button
                type="submit"
                className={`submit-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Chargement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
