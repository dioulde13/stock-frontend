'use client';

interface MouvemntModalProps {
    formData: {
        motif: string;
        quantite: number,
        typeMvtId: number,
        produitId: number,
        utilisateurId: string
    };
    setFormData: (data: {
        motif: string;
        quantite: number,
        typeMvtId: number,
        produitId: number,
        utilisateurId: string
    }) => void;
    dataProduit: any,
    dataType: any,
    onClose: () => void;
    handleSubmit: () => void;
}

export default function MouvemntModal({ formData, setFormData, onClose, handleSubmit, dataProduit, dataType }: MouvemntModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Ajouter / Modifier un mouvemnt</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={formData.motif}
                            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                            placeholder="Motif"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantite</label>
                        <input
                            type="text"
                            placeholder="Stock minimum"
                            value={
                                formData.quantite
                                    ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(formData.quantite)
                                    : ''
                            }
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/\s/g, '');
                                setFormData({ ...formData, quantite: Number(rawValue) || 0 });
                            }}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <select
                        value={formData.typeMvtId}
                        required
                        onChange={(e) => setFormData({ ...formData, typeMvtId: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">-- Type --</option>
                        {dataType.map((type: any) => (
                            <option key={type.id} value={type.id}>
                                {type.type}
                            </option>
                        ))}
                    </select>


                    <select
                        value={formData.produitId}
                        required
                        onChange={(e) => setFormData({ ...formData, produitId: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">-- Produit --</option>
                        {dataProduit.map((prod: any) => (
                            <option key={prod.id} value={prod.id}>
                                {prod.nom} - {prod.prix_achat} - {prod.prix_vente} - {prod.stock_actuel}
                            </option>
                        ))}
                    </select>


                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">
                            Valider
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
