// services/creditService.ts

// Récupérer tous les crédits
export const getCredits = async () => {
  const token = localStorage.getItem("token");
   if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch("http://localhost:3000/api/credit/liste", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des crédits");
  return res.json();
};

// Récupérer un crédit par ID
export const getCreditById = async (id: number) => {
  const res = await fetch(`http://localhost:3000/api/credit/${id}`);
  if (!res.ok) throw new Error("Erreur lors de la récupération du crédit");
  return res.json();
};

// Ajouter un crédit
export const createCredit = async (data: any) => {
  const token = localStorage.getItem("token");
   if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch("http://localhost:3000/api/credit/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorMessage = await res.text(); // Lire la réponse en tant que texte
    throw new Error(errorMessage || "Erreur lors de la création du crédit");
  }

  const responseBody = await res.json(); // Lire la réponse en tant que JSON
  return responseBody;
};



// Modifier un crédit
export const updateCredit = async (id: number, data:
  {
    utilisateurId: number;
    clientId: number;
    type: string,
    typeCredit: string,
    description: string,
    // montantPaye: number,
    montant: number;
  }) => {
  const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch(`http://localhost:3000/api/credit/modifier/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la modification du crédit");
  return res.json();
};


// Supprimer un crédit
export const annulerCredit = async (id: number) => {
  const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch(`http://localhost:3000/api/credit/annuler/${id}`, {
    method: "DELETE",
     headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
    },
  });
  if (!res.ok) throw new Error("Erreur lors de l'annulation du crédit");
  return res.json();
};

// Supprimer un crédit
export const deleteCredit = async (id: number) => {
  const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch(`http://localhost:3000/api/credit/supprimer/${id}`, {
    method: "DELETE",
     headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression du crédit");
  return res.json();
};
