"use client";
import './fournisseur.css';

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
  handleSubmit: () => void;
}

export default function FournisseurModal({
  formData,
  setFormData,
  onClose,
  handleSubmit,
}: FournisseursModalProps) {

  const handleTelephoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    if (value.length > 9) value = value.slice(0, 9);
    if (value && value[0] !== "6") value = "6" + value.slice(1);

    const numericValue = value ? Number(value) : 0;
    setFormData({ ...formData, telephone: numericValue });
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <div className="modalHeader">
          <h3>Ajouter / Modifier un fournisseur</h3>
          <button onClick={onClose}><i className="ri-close-line"></i></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="modalForm">
          <div>
            <label>Nom</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom du fournisseur"
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
            />
            <p>9 chiffres, doit commencer par 6</p>
          </div>

          <div className="modalActions">
            <button type="button" className="cancelBtn" onClick={onClose}>Annuler</button>
            <button type="submit" className="submitBtn">Valider</button>
          </div>
        </form>
      </div>
    </div>
  );
}
