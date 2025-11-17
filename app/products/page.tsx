"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProduitTable from "./ProductTable";
import ProduitModal from "./ProductModal";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { APP_URL } from "../environnement/environnements";


export default function ProductsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const [dataCategorie, setDataCategorie] = useState<any>(null);
  const [dataBoutique, setDataBoutique] = useState<any>(null);
  const [produits, setProduits] = useState<any[]>([]);
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
        console.log(parsedUser);
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

    console.log(utilisateur);


  const fetchBoutiques = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }

      const res = await fetch(`${APP_URL}/api/boutique/listeBoutiqueParAdmin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

      const res = await fetch(`${APP_URL}/api/categorie/liste`, {
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
      const token = localStorage.getItem("token"); // ou sessionStorage / cookie
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/produit/liste`, {
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

  // 🟢 Affichage des notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // 2s pour que ce soit plus visible
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
            utilisateur={utilisateur}
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

                const token = localStorage.getItem("token");
                if (!token) {
                  window.location.href = "/login";
                  return;
                }

                let response, data;

                if (selectedProduit) {
                  // 🔄 Modifier
                  response = await fetch(
                    `${APP_URL}/api/produit/${selectedProduit.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(payload),
                    }
                  );
                  data = await response.json();
                  if (!response.ok) {
                    showNotification(
                      data.message || "Erreur lors de la modification.",
                      "error"
                    );
                  } else {
                    showNotification(
                      data.message || "Produit modifié avec succès.",
                      "success"
                    );
                    setIsModalOpen(false);
                  }
                } else {
                  // ➕ Créer
                  response = await fetch(`${APP_URL}/api/produit/create`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  });
                  data = await response.json();
                  if (!response.ok) {
                    showNotification(
                      data.message || "Erreur lors de l'ajout.",
                      "error"
                    );
                  } else {
                    showNotification(
                      data.message || "Produit ajouté avec succès.",
                      "success"
                    );
                    setIsModalOpen(false);
                  }
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
              } catch (error: any) {
                console.error("Erreur API produit :", error);
                showNotification(
                  error.message || "Une erreur est survenue.",
                  "error"
                );
              }
            }}
          />
        )}

        {/* ✅ Notification */}
        {notification && (
          <div
            className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50 ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
