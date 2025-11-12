'use client';

import './CategorieModal.css';

interface CategorieModalProps {
  formData: { nom: string; utilisateurId: string };
  setFormData: (data: { nom: string; utilisateurId: string }) => void;
  onClose: () => void;
  handleSubmit: () => void;
}

export default function CategorieModal({ formData, setFormData, onClose, handleSubmit }: CategorieModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Ajouter / Modifier une catégorie</h3>
          <button onClick={onClose} className="close-button">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="modal-form"
        >
          <div className="form-group">
            <label>Nom de la catégorie</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom de la catégorie"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Annuler
            </button>
            <button type="submit" className="btn-submit">
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
