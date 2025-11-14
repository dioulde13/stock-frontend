"use client";
import './fournisseur.css';
import { useState } from "react";

interface FournisseursModalProps {
  formData: {
    nom: string;
    telephone: number;
    utilisateurId: string;
  };
  setFormData: (data: {
    nom: string;
    telephone: number;
    utilisateurId: string;
  }) => void;
  onClose: () => void;
  handleSubmit: () => Promise<void>; // 🔹 handleSubmit doit retourner une Promise
}

export default function FournisseurModal({
  formData,
  setFormData,
  onClose,
  handleSubmit,
}: FournisseursModalProps) {
  const [isLoading, setIsLoading] = useState(false); // ⬅️ Loading state

  const handleTelephoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    if (value.length > 9) value = value.slice(0, 9);
    if (value && value[0] !== "6") value = "6" + value.slice(1);

    const numericValue = value ? Number(value) : 0;
    setFormData({ ...formData, telephone: numericValue });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <div className="modalHeader">
          <h3>Ajouter / Modifier un fournisseur</h3>
          <button onClick={onClose}><i className="ri-close-line"></i></button>
        </div>

        <form onSubmit={onSubmit} className="modalForm">
          <div>
            <label>Nom</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom du fournisseur"
              disabled={isLoading}
            />
          </div>

          <div>
            <label>Téléphone</label>
            <input
              type="tel"
              required
              inputMode="numeric"
              value={formData.telephone || ""}
              onChange={handleTelephoneChange}
              placeholder="Téléphone du fournisseur"
              disabled={isLoading}
            />
            <p>9 chiffres, doit commencer par 6</p>
          </div>

          <div className="modalActions">
            <button type="button" className="cancelBtn" onClick={onClose} disabled={isLoading}>
              Annuler
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Création en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
