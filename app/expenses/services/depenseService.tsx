export async function getDepenses() {
  const token = localStorage.getItem("token");
   if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch("http://localhost:3000/api/depense/liste", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des dépenses");
  return res.json();
}

export async function getDepense(id: number) {
  const res = await fetch(`http://localhost:3000/api/depense/consulter/${id}`);
  if (!res.ok) throw new Error("Erreur lors du chargement de la dépense");
  return res.json();
}


  // Fonction pour récupérer les caisses et retourner les données
export const fetchCaisses = async () => {
  try {
    const token = localStorage.getItem('token');
     if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }

    const res = await fetch('http://localhost:3000/api/caisse/listeParRole', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Erreur API caisses');

    const data = await res.json();
    return data; // ✅ retourner les caisses pour actualiser l'UI
  } catch (err) {
    console.error('Erreur fetchCaisses:', err);
    return null;
  }
};

export async function createDepense(depense: any) {
  const token = localStorage.getItem("token");
   if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }

  const res = await fetch("http://localhost:3000/api/depense/create", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(depense),
  });

  if (!res.ok) throw new Error("Erreur lors de la création de la dépense");

  const depenseCree = await res.json();

  // 🔄 Actualiser les caisses après création
  const caissesActualisees = await fetchCaisses();

  return { depense: depenseCree, caisses: caissesActualisees };
}


// export async function createDepense(depense: any) {
//   const token = localStorage.getItem("token");
//   const res = await fetch("http://localhost:3000/api/depense/create", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`,},
//     body: JSON.stringify(depense),
//   });
//   fetchCaisses();
//   if (!res.ok) throw new Error("Erreur lors de la création de la dépense");
//   return res.json();
// }

export async function updateDepense(id: number, depense: any) {
  const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch(`http://localhost:3000/api/depense/modifier/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" ,  Authorization: `Bearer ${token}`},
    body: JSON.stringify(depense),
  });
  if (!res.ok) throw new Error("Erreur lors de la modification de la dépense");
  return res.json();
}

export async function deleteDepense(id: number) {
  const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch(`http://localhost:3000/api/depense/supprimer/${id}`, {
    method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },

  });
  if (!res.ok) throw new Error("Erreur lors de la suppression de la dépense");
  return res.json();
}

export async function annulerDepense(id: number) {
  const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
  const res = await fetch(`http://localhost:3000/api/depense/annuler/${id}`, {
    method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },

  });
  if (!res.ok) throw new Error("Erreur lors de la suppression de la dépense");
  return res.json();
}
