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
  const [form, setForm] = useState({ montant: 0, description: "" });
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
    setTimeout(() => setNotification(null), 3000);
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
            <input
              type="text"
              placeholder="Montant"
              value={
                form.montant
                  ? new Intl.NumberFormat("fr-FR").format(form.montant)
                  : ""
              }
              onChange={(e) => {
                // On enlève tout sauf les chiffres
                const raw = e.target.value.replace(/\D/g, "");

                // Mise à jour du montant brut (sans format)
                setForm({
                  ...form,
                  montant: raw ? Number(raw) : 0,
                });
              }}
              disabled={loading}
            />

            {/* <input
              type="number"
              placeholder="Montant"
              value={
                    form.montant
                      ? new Intl.NumberFormat("fr-FR").format(form.montant)
                      : ""
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\s/g, "");
                    setForm({
                      ...form,
                      montant: Number(rawValue) || 0,
                    });
                  }}
              disabled={loading}
            /> */}
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              disabled={loading}
            />
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
