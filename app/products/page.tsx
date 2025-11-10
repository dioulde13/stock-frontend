"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ProduitTable from "./ProductTable";
import ProduitModal from "./ProductModal";

export default function ProductsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const [dataCategorie, setDataCategorie] = useState<any>(null);
  const [dataBoutique, setDataBoutique] = useState<any>(null);
  const [produits, setProduits] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [utilisateur, setUtilisateur] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nom: "",
    prix_achat: 0,
    prix_vente: 0,
    stock_actuel: 0,
    stock_minimum: 0,
    categorieId: 0,
    utilisateurId: "",
    boutiqueId: 0,
  });

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUtilisateur(parsedUser);
      } catch {}
    }
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchProduits();
      fetchCategories();
      fetchBoutiques();
    }
  }, [router]);

  const fetchBoutiques = async () => {
    try {
      const token = localStorage.getItem("token");
     if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }

      const res = await fetch(
        "http://localhost:3000/api/boutique/listeBoutiqueParAdmin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setDataBoutique(data);
    } catch (error) {
      console.error("Erreur lors du fetch des boutiques:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }

      const res = await fetch("http://localhost:3000/api/categorie/liste", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDataCategorie(data);
    } catch (error) {
      console.error("Erreur lors du fetch des catégories:", error);
    }
  };

  const fetchProduits = async () => {
    try {
      // const res = await fetch('http://localhost:3000/api/produit/liste');
      const token = localStorage.getItem("token"); // ou sessionStorage / cookie
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch("http://localhost:3000/api/produit/liste", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
        },
      });

      if (!res.ok) throw new Error("Erreur lors du chargement du produit");
      const data = await res.json();
      const filteredData = data.filter(
        (produit: any) => produit.status !== "ANNULER"
      );
      console.log(filteredData);
      setProduits(filteredData);
    } catch (error) {
      console.error("Erreur lors du fetch des produits:", error);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 1000);
  };

  const handleOpenModal = (produit: any = null) => {
    setSelectedProduit(produit);

    const user = localStorage.getItem("utilisateur");
    let utilisateurId = "";
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        utilisateurId = parsedUser.id ? String(parsedUser.id) : "";
      } catch {}
    }

    if (produit) {
      setFormData({
        nom: produit.nom || "",
        prix_achat: produit.prix_achat || 0,
        prix_vente: produit.prix_vente || 0,
        stock_actuel: produit.stock_actuel || 0,
        stock_minimum: produit.stock_minimum || 0,
        categorieId: produit.categorieId || 0,
        boutiqueId: produit.boutiqueId || 0,
        utilisateurId: String(produit.utilisateurId || utilisateurId),
      });
    } else {
      setFormData({
        nom: "",
        prix_achat: 0,
        prix_vente: 0,
        stock_actuel: 0,
        stock_minimum: 0,
        categorieId: 0,
        boutiqueId: 0,
        utilisateurId,
      });
    }

    setIsModalOpen(true);
  };

  return (
    <DashboardLayout title="Liste des produits">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des produits
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter un produit</span>
          </button>
        </div>

        <ProduitTable
          produits={produits}
          utilisateur={utilisateur}
          fetchProduits={fetchProduits}
          showNotification={showNotification}
          handleOpenModal={handleOpenModal}
          formData={formData}
          setFormData={setFormData}
          selectedProduit={selectedProduit}
          setSelectedProduit={setSelectedProduit}
        />

        {isModalOpen && (
          <ProduitModal
            dataCategorie={dataCategorie}
            dataBoutique={dataBoutique}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            handleSubmit={async () => {
              try {
                const payload = {
                  nom: formData.nom,
                  prix_achat: formData.prix_achat,
                  prix_vente: formData.prix_vente,
                  stock_actuel: formData.stock_actuel,
                  stock_minimum: formData.stock_minimum,
                  categorieId: formData.categorieId,
                  boutiqueId: formData.boutiqueId,
                  utilisateurId: Number(formData.utilisateurId),
                };
                if (!payload.utilisateurId)
                  return alert("Utilisateur non trouvé !");

                if (selectedProduit) {
                  await fetch(
                    `http://localhost:3000/api/produit/${selectedProduit.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    }
                  );
                  showNotification("Produit modifiée avec succès.");
                } else {
                  await fetch("http://localhost:3000/api/produit/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  console.log(payload);
                  showNotification("Produit ajoutée avec succès.");
                }

                await fetchProduits();
                setSelectedProduit(null);
                setFormData({
                  nom: "",
                  prix_achat: 0,
                  prix_vente: 0,
                  stock_actuel: 0,
                  stock_minimum: 0,
                  categorieId: 0,
                  boutiqueId: 0,
                  utilisateurId: "",
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
