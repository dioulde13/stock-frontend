"use client";

import { APP_URL } from "@/app/environnement/environnements";

export const getPayments = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirection automatique si token manquant
    window.location.href = "/login";
    return; // On arrête l'exécution
  }
  const res = await fetch(`${APP_URL}/api/payementCredit/liste`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des paiements");
  return res.json();
};

export const addPayment = async (data: {
  reference: string;
  utilisateurId: number;
  montant: number;
}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const res = await fetch(`${APP_URL}/api/payementCredit/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json(); // 👈 Récupère message du backend

  if (!res.ok) {
    // 👈 renvoie VRAI message du backend
    throw new Error(result.message || "Erreur lors de l'ajout du paiement");
  }

  return result;
};

export const annulerPayment = async (id: number) => {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirection automatique si token manquant
    window.location.href = "/login";
    return; // On arrête l'exécution
  }
  const res = await fetch(`${APP_URL}/api/payementCredit/annuler/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Erreur lors de l'annulation");
  return res.json();
};

export const deletePayment = async (id: number) => {
  const res = await fetch(`${APP_URL}/api/payementCredit/supprimer/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
  return res.json();
};
