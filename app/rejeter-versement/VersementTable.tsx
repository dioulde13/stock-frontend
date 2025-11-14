'use client';
interface VersementTableProps {
  versements: any[];
  onAction: () => void;
}

export default function VersementTable({ versements, onAction }: VersementTableProps) {
  const handleAction = async (id: number, action: 'valider' | 'rejeter') => {
    try {
      await fetch(`/api/versement/${id}/${action}`, { method: 'PUT' });
      onAction();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du versement', error);
    }
  };

  return (
    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left">ID</th>
          <th className="px-4 py-2 text-left">Vendeur</th>
          <th className="px-4 py-2 text-left">Montant</th>
          <th className="px-4 py-2 text-left">Statut</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {versements.map((v) => (
          <tr key={v.id} className="border-t hover:bg-gray-50 transition">
            <td className="px-4 py-2">{v.id}</td>
            <td className="px-4 py-2">{v.vendeur?.nom || '—'}</td>
            <td className="px-4 py-2 font-semibold text-gray-700">{v.montant} GNF</td>
            <td className="px-4 py-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  v.status === 'VALIDÉ'
                    ? 'bg-green-100 text-green-700'
                    : v.status === 'REJETÉ'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {v.status}
              </span>
            </td>
            <td className="px-4 py-2 space-x-2">
              {v.status === 'EN_ATTENTE' && (
                <>
                  <button
                    onClick={() => handleAction(v.id, 'valider')}
                    className="text-green-600 hover:underline"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => handleAction(v.id, 'rejeter')}
                    className="text-red-600 hover:underline"
                  >
                    Rejeter
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
