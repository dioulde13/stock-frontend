"use client";
import "./depense.css";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { createDepense, updateDepense } from "./services/depenseService";



interface ExpenseModalProps {
  expense: any;
  onClose: () => void;
  onRefresh: () => void;
  showNotification: (message: string, type?: "success" | "error") => void;
}

let socket: Socket | null = null;

export default function ExpenseModal({
  expense,
  onClose,
  onRefresh,
  showNotification,
}: ExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [formMontant, setFormMontant] = useState<number>(0);
  const [utilisateurId, setUtilisateurId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);


  // 🔌 Connexion Socket.IO
  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:3000", { transports: ["websocket"] });
    }

    socket.on("caisseMisAJour", onRefresh);

    return () => {
      socket?.off("caisseMisAJour");
    };
  }, [onRefresh]);

  // 📌 Récupérer l'utilisateur
  useEffect(() => {
    try {
      const stored = localStorage.getItem("utilisateur");
      if (stored) {
        const parsed = JSON.parse(stored);
        //  console.log(parsed);
        // setUtilisateur(parsed);
        if (parsed?.id) setUtilisateurId(parsed.id);
      }
    } catch {}
  }, []);

  // 📝 Pré-remplir si on modifie
  useEffect(() => {
    if (expense) {
      setDescription(expense.description || "");
      setFormMontant(expense.montant || 0);
      setUtilisateurId(expense.utilisateurId || utilisateurId);
    } else {
      setDescription("");
      setFormMontant(0);
    }
  }, [expense, utilisateurId]);

  // 📨 Soumission du formulaire
  const handleSubmit = async () => {
  if (!description.trim()) {
    showNotification("La description est obligatoire", "error");
    return;
  }
  if (!formMontant || formMontant <= 0) {
    showNotification("Le montant doit être supérieur à 0", "error");
    return;
  }

  setIsLoading(true);

  try {
    if (expense) {
      await updateDepense(expense.id, {
        description,
        montant: formMontant,
        utilisateurId,
      });
      showNotification("✅ Dépense modifiée", "success");
    } else {
      await createDepense({
        description,
        montant: formMontant,
        utilisateurId,
      });
      showNotification("✅ Dépense ajoutée", "success");
    }

    socket?.emit("depenseAjoutee", { description, montant: formMontant });

    onRefresh();
    onClose();

  } catch (err: any) {
    showNotification(err.message || "❌ Erreur lors de l’opération", "error");
  }

  setIsLoading(false);
};


  return (
    <div className="modalOverlay">
      <div className="modalContent">
   
            <h2>{expense ? "Modifier la dépense" : "Nouvelle dépense"}</h2>
        
        {/* Description */}
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Montant avec formatage */}
        <input
          type="text"
          placeholder="Montant"
          value={
            formMontant
              ? new Intl.NumberFormat("fr-FR", {
                  minimumFractionDigits: 0,
                }).format(formMontant)
              : ""
          }
          onChange={(e) => {
            const rawValue = e.target.value.replace(/\s/g, "");
            setFormMontant(Number(rawValue) || 0);
          }}
        />

        {/* Boutons */}
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
            type="button"
            className={`submitBtn ${isLoading ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading
              ? expense
                ? "Modification..."
                : "Création en cours..."
              : expense
              ? "Modifier"
              : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
