'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FournisseursTable from './FournisseursTable';
import FournisseursModal from './FournisseursModal';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { APP_URL } from '../environnement/environnements';

export default function FournisseurPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [fournisseur, setFournisseurs] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: 0,
    utilisateurId: ''
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchFournisseurs();
    }
  }, [router]);

  const fetchFournisseurs = async () => {
    try {
      const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/fournisseur/liste`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
                },
            });

      const data = await res.json();
      console.log(data);
      setFournisseurs(data);
    } catch (error) {
      console.error("Erreur lors du fetch des fournisseurs:", error);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 1000);
  };

  const handleOpenModal = (fournisseur: any = null) => {
    setSelectedFournisseur(fournisseur);

    const user = localStorage.getItem('utilisateur');
    let utilisateurId = '';
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        utilisateurId = parsedUser.id ? String(parsedUser.id) : '';
      } catch { }
    }

    if (fournisseur) {

      setFormData({
        nom: fournisseur.nom || '',
        telephone: fournisseur.telephone || 0,
        utilisateurId: String(fournisseur.utilisateurId || utilisateurId)
      });
    } else {
      setFormData({
        nom: '',
        telephone: 0,
        utilisateurId
      });
    }

    setIsModalOpen(true);
  };

  return (
    <DashboardLayout title="Liste des fournisseurs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {/* <h2 className="text-2xl font-bold text-gray-900">Gestion des fournisseurs</h2> */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter</span>
          </button>
        </div>

        <FournisseursTable
          fournisseur={fournisseur}
          fetchFournisseurs={fetchFournisseurs}
          showNotification={showNotification}
          handleOpenModal={handleOpenModal}
          formData={formData}
          setFormData={setFormData}
          selectedFournisseur={selectedFournisseur}
          setSelectedFournisseur={setSelectedFournisseur}
        />

        {isModalOpen && (
          <FournisseursModal
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            handleSubmit={async () => {
              try {
                const payload = {
                  nom: formData.nom,
                  telephone: formData.telephone,
                  utilisateurId: Number(formData.utilisateurId
                  )
                };
                if (!payload.utilisateurId) return alert("Utilisateur non trouvé !");

                if (selectedFournisseur) {
                   const token = localStorage.getItem("token");

                  await fetch(`${APP_URL}/api/fournisseur/modifier/${selectedFournisseur.id}`, {
                    method: "PUT",
                    headers: { 
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`, 
                     },
                    body: JSON.stringify(payload),
                  });
                  showNotification("Fournisseur modifiée avec succès.");
                } else {
                  const token = localStorage.getItem("token");
                
                  await fetch(`${APP_URL}/api/fournisseur/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
                    body: JSON.stringify(payload),
                  });
                  showNotification("Fournisseur ajouté avec succès.");
                }

                await fetchFournisseurs();
                setSelectedFournisseur(null);
                setFormData({
                  nom: '',
                  telephone: 0,
                  utilisateurId: ''
                });
                setIsModalOpen(false);
              } catch (error) {
                console.error("Erreur API catégorie :", error);
              }
            }}
          />
        )}

        {notification && (
          <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {notification}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
