"use client";
import React from "react";
import "./ModalConfirm.css";

interface ModalConfirmProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ModalConfirm({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: ModalConfirmProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-buttons">
          <button onClick={onCancel} disabled={loading} className="cancel-btn">
            Annuler
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="confirm-btn"
          >
            {loading && <span className="spinner"></span>}
            {loading ? "Chargement..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
