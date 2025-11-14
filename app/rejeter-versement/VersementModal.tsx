"use client";
import { useEffect, useState } from "react";
import { APP_URL } from "../environnement/environnements";

interface VersementModalProps {
  onClose: () => void;
  onAdd: () => void;
}

export default function VersementModal({
  onClose,
  onAdd,
}: VersementModalProps) {
  const [utilisateurId, setUtilisateurId] = useState<number>(0);
  const [loading, setLoading] = useState(false); // ⬅️ Loading state

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.id) setUtilisateurId(parsedUser.id);
      } catch {}
    }
  }, []);

  const [form, setForm] = useState({
    montant: "",
    description: "",
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true); // ⬅️ Début du loading

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
      } else {
        showNotification(message, "error");
      }
    } catch (error) {
      console.error("Erreur serveur", error);
      showNotification("Erreur serveur. Veuillez réessayer.", "error");
    } finally {
      setLoading(false); // ⬅️ Fin du loading
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
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

      <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Nouveau Versement</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="number"
            placeholder="Montant"
            className="border p-2 w-full rounded"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value })}
            disabled={loading} // ⬅️ Désactive le champ pendant le loading
          />

          <textarea
            placeholder="Description"
            className="border p-2 w-full rounded"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={loading} // ⬅️ Désactive le champ pendant le loading
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              disabled={loading} // ⬅️ Désactive le bouton Annuler
            >
              Annuler
            </button>

            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading} // ⬅️ Désactive le bouton Enregistrer
            >
              {loading ? "Chargement..." : "Enregistrer"} {/* ⬅️ Texte du bouton */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
