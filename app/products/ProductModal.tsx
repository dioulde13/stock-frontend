"use client";

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
  setFormData: (data: {
    nom: string;
    prix_achat: number;
    prix_vente: number;
    stock_actuel: number;
    stock_minimum: number;
    categorieId: number;
    boutiqueId: number;
    utilisateurId: string;
  }) => void;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[100vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Ajouter / Modifier un produit
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-6 space-y-4"
        >
          {/* Nom du produit - toute la largeur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              placeholder="Nom du produit"
            />
          </div>

          {/* Deux champs par ligne */}
          <div className="grid grid-cols-2 gap-4">
            {/* Prix Achat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix d'achat
              </label>
              <input
                type="text"
                placeholder="Prix Achat"
                value={
                  formData.prix_achat
                    ? new Intl.NumberFormat("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(formData.prix_achat)
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Prix Vente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de vente
              </label>
              <input
                type="text"
                placeholder="Prix Vente"
                value={
                  formData.prix_vente
                    ? new Intl.NumberFormat("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(formData.prix_vente)
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stock actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock actuel
              </label>
              <input
                type="text"
                placeholder="Stock actuel"
                value={
                  formData.stock_actuel
                    ? new Intl.NumberFormat("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(formData.stock_actuel)
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\s/g, "");
                  setFormData({
                    ...formData,
                    stock_actuel: Number(rawValue) || 0,
                  });
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Stock minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock minimum
              </label>
              <input
                type="text"
                placeholder="Stock minimum"
                value={
                  formData.stock_minimum
                    ? new Intl.NumberFormat("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(formData.stock_minimum)
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\s/g, "");
                  setFormData({
                    ...formData,
                    stock_minimum: Number(rawValue) || 0,
                  });
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={formData.categorieId}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categorieId: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">-- Catégorie --</option>
                {dataCategorie.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Boutique */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Boutique
              </label>
              <select
                value={formData.boutiqueId}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    boutiqueId: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
