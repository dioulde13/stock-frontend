"use client";

import React, { useState } from "react";
import "./ProduitModal.css";

interface CategorieModalProps {
  dataCategorie: any;
  dataBoutique: any;
  utilisateur: any;
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
  isEditing: boolean; // ✅ ajout de la prop
}

export default function ProduitModal({
  formData,
  setFormData,
  onClose,
  handleSubmit,
  dataCategorie,
  dataBoutique,
  utilisateur,
  isEditing,
}: CategorieModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [prixErreur, setPrixErreur] = useState("");
  const [quantiteErreur, setQuantiteErreur] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isEditing ? "Modifier un produit" : "Ajouter un produit"}</h3>
          <button onClick={onClose} className="close-btn">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="modal-form">
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
                  const prixVente = Number(rawValue) || 0;

                  setFormData({
                    ...formData,
                    prix_vente: prixVente,
                  });

                  if (prixVente <= formData.prix_achat) {
                    setPrixErreur(
                      "Le prix de vente doit être supérieur au prix d'achat."
                    );
                  } else {
                    setPrixErreur("");
                  }
                }}
                required
              />
              {prixErreur && (
                <p style={{ color: "red", marginTop: 5, fontSize: 14 }}>
                  {prixErreur}
                </p>
              )}
            </div>
          </div>

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
                    stock_actuel: Number(e.target.value.replace(/\s/g, "")) || 0,
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
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\s/g, "");
                  const stock_minimum = Number(rawValue) || 0;

                  setFormData({
                    ...formData,
                    stock_minimum,
                  });

                  if (stock_minimum >= formData.stock_actuel) {
                    setQuantiteErreur(
                      "Le stock minimum doit être inférieur au stock actuel."
                    );
                  } else {
                    setQuantiteErreur("");
                  }
                }}
                required
              />
              {quantiteErreur && (
                <p style={{ color: "red", marginTop: 5, fontSize: 14 }}>
                  {quantiteErreur}
                </p>
              )}
            </div>
          </div>

          {utilisateur?.role === "ADMIN" ? (
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
                  {dataCategorie?.map((cat: any) => (
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
                  {dataBoutique?.map((bout: any) => (
                    <option key={bout.id} value={bout.id}>
                      {bout.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="form-group w-full">
              <label>Catégorie</label>
              <select
                className="w-full"
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
                {dataCategorie?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                isLoading || prixErreur || quantiteErreur
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isLoading || prixErreur !== "" || quantiteErreur !== ""}
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
