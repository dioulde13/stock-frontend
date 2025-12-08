// ModalHistorique.tsx
"use client";

import React from "react";

interface Modification {
  dateModification: string;
  nomUtilisateur: string;
}

interface ModalHistoriqueProps {
  modifications: Modification[];
  onClose: () => void;
}

export default function ModalHistorique({
  modifications,
  onClose,
}: ModalHistoriqueProps) {
  if (!modifications || modifications.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Historique des modifications
        </h2>

        {modifications.length === 0 ? (
          <p>Aucune modification disponible.</p>
        ) : (
          <ul className="space-y-2">
            {modifications.map((mod, index) => (
              <li
                key={index}
                className="border-b border-gray-200 pb-2 last:border-none"
              >
                <p className="text-sm text-gray-700">
                  {mod.nomUtilisateur} -{" "}
                  <span className="text-gray-500">
                    {new Date(mod.dateModification).toLocaleString()}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
