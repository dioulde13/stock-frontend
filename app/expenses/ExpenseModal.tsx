'use client';
import './depense.css';
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

  useEffect(() => {
    if (!socket) socket = io('http://localhost:3000', { transports: ['websocket'] });

    socket.on('caisseMisAJour', () => onRefresh());
    return () => { socket?.off('caisseMisAJour'); };
  }, [onRefresh]);

  useEffect(() => {
    const user = localStorage.getItem('utilisateur');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser?.id) setUtilisateurId(parsedUser.id);
      } catch { }
    }
  }, []);

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

  const handleSubmit = async () => {
    try {
      if (expense) {
        await updateDepense(expense.id, { description, montant: formMontant, utilisateurId });
        showNotification('✅ Dépense modifiée', 'success');
      } else {
        await createDepense({ description, montant: formMontant, utilisateurId });
        showNotification('✅ Dépense ajoutée', 'success');
      }
      socket?.emit('depenseAjoutee', { description, montant: formMontant });
      onRefresh();
      onClose();
    } catch {
      showNotification('❌ Erreur lors de l’opération', 'error');
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2>{expense ? 'Modifier la dépense' : 'Nouvelle dépense'}</h2>

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Montant"
          value={
            formMontant
              ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(formMontant)
              : ''
          }
          onChange={e => {
            const rawValue = e.target.value.replace(/\s/g, '');
            setFormMontant(Number(rawValue) || 0);
          }}
        />

        <div className="modalActions">
          <button type="button" className="cancelBtn" onClick={onClose}>Annuler</button>
          <button type="button" className="submitBtn" onClick={handleSubmit}>
            {expense ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
