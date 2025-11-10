"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import MouvementTable from "./MouvementTable";
import MouvementModal from "./MouvementModal";
import styles from "./mouvement.module.css";

type TypeMvt = {
  id: number;
  type: string;
};

export default function MouvementPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMouvement, setSelectedMouvement] = useState<any>(null);
  const [mouvement, setMouvement] = useState<any[]>([]);
  const [dataProduit, setProduit] = useState<any[]>([]);
  const [dataType, setTypeMouvement] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const [dataTypeMvt, setDataTypeMvt] = useState<TypeMvt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "edit" | "delete" | "add" | "addTypeMvt" | null
  >(null);

  const [formTypeMvt, setFormTypeMvt] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [utilisateur, setUtilisateur] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    motif: "",
    quantite: 0,
    typeMvtId: 0,
    produitId: 0,
    utilisateurId: "",
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
      fetchTypeMvt();
      fetchMouvement();
      fetchProduit();
      fetchTypeMouvemnt();
    }
  }, [router]);

  const fetchProduit = async () => {
    try {
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

      let data = await res.json();

      // Exclure les produits annulés
      data = data.filter((produit: any) => produit.status !== "ANNULER");

      setProduit(data);
    } catch (error) {
      console.error("Erreur lors du fetch des produit:", error);
    }
  };

  const fetchTypeMouvemnt = async () => {
    try {
      const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch("http://localhost:3000/api/typeMvtStock/liste", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
        },
      });
      const data = await res.json();
      setTypeMouvement(data);
    } catch (error) {
      console.error("Erreur lors du fetch des types:", error);
    }
  };

  const fetchMouvement = async () => {
    try {
      const token = localStorage.getItem("token");
 if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(
        "http://localhost:3000/api/mouvementStock/liste",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🔑 ajout du token ici
          },
        }
      );
      let data = await res.json();

      data = data.filter((mvt: any) => mvt.status !== "ANNULER");
      setMouvement(data);
      console.log(data);
    } catch (error) {
      console.error("Erreur lors du fetch des mouvements:", error);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 1000);
  };

  const handleOpenModal = (mouvement: any = null) => {
    setSelectedMouvement(mouvement);

    const user = localStorage.getItem("utilisateur");
    let utilisateurId = "";
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        utilisateurId = parsedUser.id ? String(parsedUser.id) : "";
      } catch {}
    }

    if (mouvement) {
      setFormData({
        motif: mouvement.motif || "",
        quantite: mouvement.quantite || 0,
        typeMvtId: mouvement.typeMvtId || 0,
        produitId: mouvement.produitId || 0,
        utilisateurId: String(mouvement.utilisateurId || utilisateurId),
      });
    } else {
      setFormData({
        motif: "",
        quantite: 0,
        typeMvtId: 0,
        produitId: 0,
        utilisateurId,
      });
    }

    setIsModalOpen(true);
  };

  // POST (ajouter type mouvement stock)
  const handleAddTypeMvt = async () => {
    if (!formTypeMvt) {
      alert("Merci de remplir le champ obligatoire (Type)");
      return;
    }
    try {
      setLoadingSubmit(true);
      const newTypeMvt = { type: formTypeMvt };
      const res = await fetch("http://localhost:3000/api/typeMvtStock/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTypeMvt),
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout");

      closeModal();
      fetchTypeMvt();
      showNotification("Type mouvement Stock ajouté avec succès.");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
  };

  const fetchTypeMvt = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/typeMvtStock/liste");
      if (!res.ok) throw new Error("Erreur lors du chargement des types");
      const typeMvtStock: TypeMvt[] = await res.json();
      setDataTypeMvt(typeMvtStock);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: "addTypeMvt") => {
    setModalType(type);
    setModalOpen(true);
    if (type === "addTypeMvt") {
      setFormTypeMvt("");
    }
  };

  return (
    <DashboardLayout title="Liste des mouvements de stocks">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des mouvements de stocks
          </h2>
          <button
            onClick={() => openModal("addTypeMvt")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Ajouter type
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            <span>Ajouter un mouvement de stock</span>
          </button>
        </div>

        <MouvementTable
          mouvement={mouvement}
          utilisateur={utilisateur}
          fetchMouvement={fetchMouvement}
          showNotification={showNotification}
          handleOpenModal={handleOpenModal}
          formData={formData}
          setFormData={setFormData}
          selectedMouvement={selectedMouvement}
          setSelectedMouvement={setSelectedMouvement}
        />

        {/* Modal pour Ajouter un type */}
        {modalOpen && modalType === "addTypeMvt" && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <>
                <h2>Ajouter un type de mouvements de stock</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTypeMvt();
                  }}
                >
                  <select
                    value={formTypeMvt ?? ""}
                    onChange={(e) => setFormTypeMvt(e.target.value)}
                  >
                    <option value="">-- Type --</option>
                    <option value="ENTRE">ENTRE</option>
                    <option value="SORTIE">SORTIE</option>
                  </select>

                  <div className="mt-4 flex space-x-2">
                    <button
                      type="submit"
                      disabled={loadingSubmit}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      {loadingSubmit ? "Chargement..." : "Ajouter"}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                      disabled={loadingSubmit}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </>
            </div>
          </div>
        )}

        {/* Modal pour Mouvement */}
        {isModalOpen && (
          <MouvementModal
            dataProduit={dataProduit}
            dataType={dataType}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            handleSubmit={async () => {
              try {
                const payload = {
                  motif: formData.motif,
                  quantite: formData.quantite,
                  typeMvtId: formData.typeMvtId,
                  produitId: formData.produitId,
                  utilisateurId: Number(formData.utilisateurId),
                };

                if (!payload.utilisateurId)
                  return alert("Utilisateur non trouvé !");

                let response;
                if (selectedMouvement) {
                  const token = localStorage.getItem("token");

                  response = await fetch(
                    `http://localhost:3000/api/mouvementStock/modifier/${selectedMouvement.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(payload),
                    }
                  );
                } else {
                  const token = localStorage.getItem("token");

                  response = await fetch(
                    "http://localhost:3000/api/mouvementStock/create",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(payload),
                    }
                  );
                }

                const data = await response.json();
                if (!response.ok) {
                  return showNotification(data.message || "Erreur inconnue");
                }

                showNotification(data.message);
                await fetchMouvement();
                setSelectedMouvement(null);
                setFormData({
                  motif: "",
                  quantite: 0,
                  typeMvtId: 0,
                  produitId: 0,
                  utilisateurId: "",
                });
                setIsModalOpen(false);
              } catch (error) {
                console.error("Erreur API mouvement :", error);
                showNotification("Erreur de connexion au serveur");
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
