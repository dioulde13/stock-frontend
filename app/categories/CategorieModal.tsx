'use client';

import { useState } from "react";
import './CategorieModal.css';

interface CategorieModalProps {
  formData: { nom: string; utilisateurId: string };
  setFormData: (data: { nom: string; utilisateurId: string }) => void;
  onClose: () => void;
  handleSubmit: () => Promise<void>; // async
}

export default function CategorieModal({ formData, setFormData, onClose, handleSubmit }: CategorieModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);          // 🚀 Démarre le loading
    try {
      await handleSubmit();      // attend la fin de la création/modification
    } finally {
      setIsLoading(false);       // termine le loading
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Ajouter / Modifier une catégorie</h3>
          <button onClick={onClose} className="close-button" disabled={isLoading}>
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
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom de la catégorie"
              disabled={isLoading} // ⛔ désactive le champ pendant la création
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={isLoading}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Création en cours..." : "Valider"} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
