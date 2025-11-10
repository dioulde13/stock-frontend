"use client";

interface FournisseursModalProps {
  formData: {
    nom: string;
    telephone: string; // passer en string pour gérer le 0 initial
    utilisateurId: string;
  };
  setFormData: (data: {
    nom: string;
    telephone: string;
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

    // supprimer tous les caractères non numériques
    value = value.replace(/\D/g, "");

    // limiter à 9 chiffres
    if (value.length > 9) value = value.slice(0, 9);

    // forcer le premier chiffre à être 6
    if (value && value[0] !== "6") {
      value = "6" + value.slice(1);
    }

    setFormData({ ...formData, telephone: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Ajouter / Modifier un fournisseur
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              placeholder="Nom du fournisseur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={formData.telephone}
              onChange={handleTelephoneChange}
              placeholder="Téléphone du fournisseur"
            />
            <p className="text-xs text-gray-500 mt-1">
              9 chiffres, doit commencer par 6
            </p>
          </div>

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
