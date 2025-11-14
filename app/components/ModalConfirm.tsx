'use client';
import React from "react";

interface ModalConfirmProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean; // 🟢 AJOUT
}

export default function ModalConfirm({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false
}: ModalConfirmProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <p className="text-gray-600 mb-5">{message}</p>

        <div className="flex justify-end gap-3">

          {/* Bouton Annuler */}
          <button
            disabled={loading}
            onClick={onCancel}
            className={`px-4 py-2 bg-gray-200 rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"
            }`}
          >
            Annuler
          </button>

          {/* Bouton Confirmer */}
          <button
            disabled={loading}
            onClick={onConfirm}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Chargement..." : "Confirmer"}
          </button>

        </div>
      </div>
    </div>
  );
}
