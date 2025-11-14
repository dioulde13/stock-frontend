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
    utilisateurId: "",
    montant: "",
    description: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/versement/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          utilisateurId: Number(utilisateurId),
          montant: Number(form.montant),
        }),
      });

      if (res.ok) {
        onAdd();
      } else {
        console.error("Erreur création versement");
      }
    } catch (error) {
      console.error("Erreur serveur", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Nouveau Versement</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="number"
            placeholder="Montant"
            className="border p-2 w-full rounded"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="border p-2 w-full rounded"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
