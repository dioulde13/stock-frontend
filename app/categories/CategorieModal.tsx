"use client";

import { useState } from "react";
import "./CategorieModal.css";

interface CategorieModalProps {
  formData: { nom: string; utilisateurId: string };
  setFormData: (data: { nom: string; utilisateurId: string }) => void;
  onClose: () => void;
  handleSubmit: () => Promise<void>; // async
  isEditing: boolean;
}

export default function CategorieModal({
  formData,
  setFormData,
  onClose,
  handleSubmit,
  isEditing
}: CategorieModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // 🚀 Démarre le loading
    try {
      await handleSubmit(); // attend la fin de la création/modification
    } finally {
      setIsLoading(false); // termine le loading
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isEditing? "Modifier une catégorie" : "Ajouter une catégorie"}</h3>
          <button
            onClick={onClose}
            className="close-button"
            disabled={isLoading}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="form-group">
            <label>Nom de la catégorie</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              placeholder="Nom de la catégorie"
              disabled={isLoading} // ⛔ désactive le champ pendant la création
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isLoading}
            >
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
              {isEditing
                ? isLoading
                  ? "Modification..."
                  : "Appliquer"
                : isLoading
                ? "Ajout en cours..."
                : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
