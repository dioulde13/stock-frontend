"use client";
import React from "react";
import "./ProduitModal.css"; // ✅ Import du CSS

interface CategorieModalProps {
  dataCategorie: any;
  dataBoutique: any;
  formData: {
    nom: string;
    prix_achat: number;
    prix_vente: number;
    stock_actuel: number;
    stock_minimum: number;
    categorieId: number;
    boutiqueId: number;
    utilisateurId: string;
  };
  setFormData: (data: any) => void;
  onClose: () => void;
  handleSubmit: () => void;
}

export default function ProduitModal({
  formData,
  setFormData,
  onClose,
  handleSubmit,
  dataCategorie,
  dataBoutique,
}: CategorieModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Ajouter / Modifier un produit</h3>
          <button onClick={onClose} className="close-btn">
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
          {/* Nom du produit */}
          <div className="form-group">
            <label>Nom du produit</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              placeholder="Nom du produit"
            />
          </div>

          {/* Prix Achat / Vente */}
          <div className="form-row">
            <div className="form-group">
              <label>Prix d'achat</label>
              <input
                type="text"
                placeholder="Prix Achat"
                value={
                  formData.prix_achat
                    ? new Intl.NumberFormat("fr-FR").format(formData.prix_achat)
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\s/g, "");
                  setFormData({
                    ...formData,
                    prix_achat: Number(rawValue) || 0,
                  });
                }}
                required
              />
            </div>

            <div className="form-group">
              <label>Prix de vente</label>
              <input
                type="text"
                placeholder="Prix Vente"
                value={
                  formData.prix_vente
                    ? new Intl.NumberFormat("fr-FR").format(formData.prix_vente)
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\s/g, "");
                  setFormData({
                    ...formData,
                    prix_vente: Number(rawValue) || 0,
                  });
                }}
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div className="form-row">
            <div className="form-group">
              <label>Stock actuel</label>
              <input
                type="text"
                placeholder="Stock actuel"
                value={formData.stock_actuel || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_actuel:
                      Number(e.target.value.replace(/\s/g, "")) || 0,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Stock minimum</label>
              <input
                type="text"
                placeholder="Stock minimum"
                value={formData.stock_minimum || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_minimum:
                      Number(e.target.value.replace(/\s/g, "")) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          {/* Catégorie / Boutique */}
          <div className="form-row">
            <div className="form-group">
              <label>Catégorie</label>
              <select
                value={formData.categorieId}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categorieId: Number(e.target.value),
                  })
                }
              >
                <option value="">-- Catégorie --</option>
                {dataCategorie.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Boutique</label>
              <select
                value={formData.boutiqueId}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    boutiqueId: Number(e.target.value),
                  })
                }
              >
                <option value="">-- Boutique --</option>
                {dataBoutique.map((bout: any) => (
                  <option key={bout.id} value={bout.id}>
                    {bout.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Boutons */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="submit-btn">
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
