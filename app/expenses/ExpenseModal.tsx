'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { createDepense, updateDepense } from './services/depenseService';

interface ExpenseModalProps {
  expense: any;
  onClose: () => void;
  onRefresh: () => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

let socket: Socket | null = null;

export default function ExpenseModal({
  expense,
  onClose,
  onRefresh,
  showNotification,
}: ExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [formMontant, setFormMontant] = useState<number>(0);
  const [utilisateurId, setUtilisateurId] = useState<number>(0);

  // 🔹 Initialiser Socket.io
  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3000', { transports: ['websocket'] });
    }

    socket.on('caisseMisAJour', () => {
      console.log('🪙 Caisse mise à jour (via socket)');
      onRefresh();
    });

    return () => {
      socket?.off('caisseMisAJour');
    };
  }, [onRefresh]);

  // 🔹 Récupérer l'utilisateur depuis localStorage
  useEffect(() => {
    const user = localStorage.getItem('utilisateur');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.id) setUtilisateurId(parsedUser.id);
      } catch (err) {
        console.error('Erreur utilisateur:', err);
      }
    }
  }, []);

  // 🔹 Pré-remplir si modification
  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setFormMontant(expense.montant || 0);
      setUtilisateurId(expense.utilisateurId || utilisateurId);
    } else {
      setDescription('');
      setFormMontant(0);
    }
  }, [expense, utilisateurId]);

  // 🔹 Soumission du formulaire
  const handleSubmit = async () => {
    try {
      if (expense) {
        await updateDepense(expense.id, { description, montant: formMontant, utilisateurId });
        showNotification('✅ Dépense modifiée avec succès', 'success');
      } else {
        await createDepense({ description, montant: formMontant, utilisateurId });
        showNotification('✅ Dépense ajoutée avec succès', 'success');
      }

      socket?.emit('depenseAjoutee', { description, montant: formMontant });
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      showNotification('❌ Erreur lors de l’opération', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 p-6 shadow-lg animate-fadeIn">
        <h2 className="text-xl font-bold mb-4">{expense ? 'Modifier la dépense' : 'Nouvelle dépense'}</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            type="text"
            placeholder="Montant"
            value={
              formMontant
                ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
                    formMontant
                  )
                : ''
            }
            onChange={e => {
              const rawValue = e.target.value.replace(/\s/g, '');
              setFormMontant(Number(rawValue) || 0);
            }}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-100">
            Annuler
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
            {expense ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
