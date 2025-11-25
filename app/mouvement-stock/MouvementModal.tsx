"use client";
import { useState } from "react";
import "./mouvement.css";
import Select from "react-select";

interface MouvemntModalProps {
  formData: {
    motif: string;
    quantite: number;
    typeMvtId: number;
    produitId: number;
    utilisateurId: string;
  };
  setFormData: (data: {
    motif: string;
    quantite: number;
    typeMvtId: number;
    produitId: number;
    utilisateurId: string;
  }) => void;
  dataProduit: any;
  dataType: any;
  onClose: () => void;
  handleSubmit: () => void;
}

export default function MouvemntModal({
  formData,
  setFormData,
  onClose,
  handleSubmit,
  dataProduit,
  dataType,
}: MouvemntModalProps) {
  const [isLoading, setIsLoading] = useState(false); // 🚀 état loading

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // démarre le loading
    try {
      await handleSubmit(); // attend que l'API se termine
    } finally {
      setIsLoading(false); // termine le loading
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <div className="modalHeader">
          <h3>Ajouter / Modifier un mouvemnt</h3>
          <button onClick={onClose} disabled={isLoading}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="modalForm">
          <div>
            <label>Nom</label>
            <input
              type="text"
              required
              value={formData.motif}
              onChange={(e) =>
                setFormData({ ...formData, motif: e.target.value })
              }
              placeholder="Motif"
            />
          </div>

          <div>
            <label>Sélectionner un produit</label>
            <Select
              options={dataProduit.map((prod: any) => ({
                value: prod.id,
                label: `${prod.nom} - ${prod.prix_achat} - ${prod.prix_vente} - ${prod.stock_actuel}`,
              }))}
              value={dataProduit
                .map((prod: any) => ({
                  value: prod.id,
                  label: `${prod.nom} - ${prod.prix_achat} - ${prod.prix_vente} - ${prod.stock_actuel}`,
                }))
                .find(
                  (option: any) =>
                    option.value.toString() === formData.produitId
                )}
              onChange={(selected: any) => {
                setFormData({
                  ...formData,
                  produitId: selected ? selected.value : null,
                });
              }}
              placeholder="-- Sélectionner un produit --"
              isClearable
            />
          </div>

          <div>
            <label>Quantite</label>
            <input
              type="text"
              value={
                formData.quantite
                  ? new Intl.NumberFormat("fr-FR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(formData.quantite)
                  : ""
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\s/g, "");
                setFormData({ ...formData, quantite: Number(rawValue) || 0 });
              }}
              required
              placeholder="Quantite"
            />
          </div>

          <div>
            <label>Type</label>
            <select
              value={formData.typeMvtId}
              required
              onChange={(e) =>
                setFormData({ ...formData, typeMvtId: Number(e.target.value) })
              }
            >
              <option value="">-- Type --</option>
              {dataType.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.type}
                </option>
              ))}
            </select>
          </div>

          <div className="modalActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={onClose}
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
              {isLoading ? "Création en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
