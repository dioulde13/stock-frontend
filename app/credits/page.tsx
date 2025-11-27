"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import CreditsTable from "./CreditsTable";
import "./credit.css";

import {
  getCredits,
  createCredit,
  updateCredit,
  annulerCredit,
} from "./services/creditService";
import ReactPaginate from "react-paginate";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { formatMontant } from "../components/utils/formatters";
import { APP_URL } from "../environnement/environnements";
import ModalConfirm from "../components/ModalConfirm";

export default function CreditsPage() {
  const router = useRouter();
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    utilisateurId: "",
    clientId: 0,
    type: "",
    typeCredit: "",
    description: "",
    montant: 0,
  });
  const [dataClient, setClients] = useState<any[]>([]);
  const [montantPaye, setMontantPaye] = useState<number>(0);

  // const [modalMessage, setModalMessage] = useState("");

  // 🔍 Filtres
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterReference, setFilterReference] = useState("");
  const [dateDebut, setDateDebut] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [dateFin, setDateFin] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 📄 Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const [utilisateur, setUtilisateur] = useState<any[]>([]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUtilisateur(parsedUser);
        const utilisateurId = parsedUser.id ? String(parsedUser.id) : "";
        setFormData((prev) => ({ ...prev, utilisateurId }));
      } catch {}
    }

    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchCredits();
      fetchClients();
    }
  }, [router]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirection automatique si token manquant
        window.location.href = "/login";
        return; // On arrête l'exécution
      }
      const res = await fetch(`${APP_URL}/api/client/liste`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Erreur lors du fetch des clients:", error);
    }
  };

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const data = await getCredits();
      console.log(data);
      setCredits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!formData.clientId || !formData.type || !formData.montant) {
      return showNotification("Veuillez remplir tous les champs", "error");
    }
    setIsLoading(true);

    try {
      const response = await createCredit({
        utilisateurId: Number(formData.utilisateurId),
        clientId: Number(formData.clientId),
        description: formData.description,
        type: formData.type,
        typeCredit: formData.typeCredit,
        montant: Number(formData.montant),
      });
      setShowForm(false);

      // Affiche le message renvoyé par l'API
      showNotification(
        response.message || "Crédit créé avec succès",
        "success"
      );

      resetForm();
      fetchCredits();
    } catch (err: any) {
      setShowForm(false);

      console.error("Erreur lors de la création du crédit :", err);

      let message = "Erreur de connexion au serveur";

      // Si le message est un JSON
      try {
        if (err.message) {
          const parsed = JSON.parse(err.message);
          if (parsed?.message) message = parsed.message;
        }
      } catch (_) {
        message = err.message || message;
      }

      showNotification(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (editingId === null) return;

    if (!formData.clientId || !formData.type || !formData.montant) {
      setShowForm(false);
      return showNotification("Veuillez remplir tous les champs", "error");
    }

    try {
      const response = await updateCredit(editingId, {
        utilisateurId: Number(formData.utilisateurId),
        clientId: Number(formData.clientId),
        type: formData.type,
        typeCredit: formData.typeCredit,
        description: formData.description,
        montant: Number(formData.montant),
      });
      setShowForm(false);
      showNotification(
        response?.message || "Modification réussie avec succès",
        "success"
      );

      setEditingId(null);
      setMontantPaye(0);
      resetForm();
      fetchCredits();
    } catch (err: any) {
      console.error(err);
      showNotification(
        err.error.message || "Erreur lors de la modification du crédit",
        "error"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      utilisateurId: formData.utilisateurId,
      clientId: 0,
      type: "",
      typeCredit: "",
      description: "",
      montant: 0,
    });
  };

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [creditIdToCancel, setCreditIdToCancel] = useState<number | null>(null);

  const handleAnnuler = (id: number) => {
    setCreditIdToCancel(id);
    setCancelModalOpen(true);
  };

  const confirmAnnuler = async () => {
    if (!creditIdToCancel) return;

    try {
      const response = await annulerCredit(creditIdToCancel);
      fetchCredits();

      showNotification(
        response?.message || "Crédit annulé avec succès",
        "success"
      );
    } catch (err) {
      console.error(err);

      const backendMessage =
        err instanceof Error ? err.message : "Erreur lors de l'annulation";

      showNotification(backendMessage, "error");
    }

    setCancelModalOpen(false);
    setCreditIdToCancel(null);
  };

  // const handleDelete = async (id: number) => {
  //   if (confirm("Voulez-vous vraiment supprimer ce crédit ?")) {
  //     try {
  //       await deleteCredit(id);
  //       fetchCredits();
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  // };

  // const handleAnnuler = async (id: number) => {
  //   if (confirm("Voulez-vous vraiment annuler ce crédit ?")) {
  //     try {
  //       await annulerCredit(id);
  //       fetchCredits();
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  // };

  const openEditForm = (credit: any) => {
    setFormData({
      utilisateurId: String(credit.utilisateurId),
      clientId: credit.clientId,
      description: credit.description,
      type: credit.type,
      typeCredit: credit.typeCredit,
      montant: credit.montant,
    });
    setMontantPaye(credit.montantPaye || 0);
    setEditingId(credit.id);
    setShowForm(true);
  };

  const filteredCredits = useMemo(() => {
    return credits.filter((credit) => {
      const date = new Date(credit.createdAt);

      const matchType = filterType ? credit.type === filterType : true;
      const matchStatus = filterStatus ? credit.status === filterStatus : true;
      const matchRef = filterReference
        ? credit.reference
            ?.toLowerCase()
            .includes(filterReference.toLowerCase())
        : true;

      let matchDate = true;
      if (dateDebut && dateFin) {
        const start = new Date(dateDebut);
        start.setHours(0, 0, 0, 0);

        const end = new Date(dateFin);
        end.setHours(23, 59, 59, 999);

        matchDate = date >= start && date <= end;
      }

      return matchType && matchStatus && matchRef && matchDate;
    });
  }, [credits, filterType, filterStatus, filterReference, dateDebut, dateFin]);

  const pageCount = Math.ceil(filteredCredits.length / itemsPerPage);
  const paginatedCredits = filteredCredits.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const creditsActifs = filteredCredits.filter((c) => c.status !== "ANNULER");

  const totalMontant = creditsActifs.reduce((sum, c) => sum + c.montant, 0);
  const totalPaye = creditsActifs.reduce((sum, c) => sum + c.montantPaye, 0);
  const totalRestant = creditsActifs.reduce(
    (sum, c) => sum + c.montantRestant,
    0
  );

  const creditsAnnulerActifs = filteredCredits.filter(
    (c) => c.status === "ANNULER"
  );

  const totalAnnulerMontant = creditsAnnulerActifs.reduce(
    (sum, c) => sum + c.montant,
    0
  );
  const totalAnnulerPaye = creditsAnnulerActifs.reduce(
    (sum, c) => sum + c.montantPaye,
    0
  );
  const totalAnnulerRestant = creditsAnnulerActifs.reduce(
    (sum, c) => sum + c.montantRestant,
    0
  );

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
    setTimeout(() => setNotification(null), 4000); // 2s pour que ce soit plus visible
  };


   if (loading) {
      return (
        <DashboardLayout title="Chargement...">
          <div className="flex justify-center items-center h-64 text-gray-500">
            Chargement des données...
          </div>
        </DashboardLayout>
      );
    }

  return (
    <DashboardLayout title="Crédits">
      <ModalConfirm
        open={cancelModalOpen}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir annuler ce crédit ?"
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={confirmAnnuler}
      />

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

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            {/* <h2 className="text-2xl font-bold text-gray-900">
              Gestion des crédits
            </h2>
            <p className="text-gray-600">
              Suivez les crédits accordés aux clients
            </p> */}
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => {
              resetForm();
              setEditingId(null);
              setMontantPaye(0);
              setShowForm(true);
            }}
          >
            <i className="ri-bank-card-line"></i>
            <span>Nouveau crédit</span>
          </button>
        </div>

        {/* 🧭 Filtres */}
        <div
          className="bg-gray-50 p-3 rounded-lg border
                grid grid-cols-1 gap-2 space-y-2
                md:grid-cols-5 md:gap-2 md:space-y-0"
        >
          <input
            type="text"
            placeholder="Référence"
            value={filterReference}
            onChange={(e) => setFilterReference(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm w-52"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm w-52"
          >
            <option value="">Tous les types</option>
            <option value="ENTRE">ENTRE</option>
            <option value="SORTIE">SORTIE</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm w-52"
          >
            <option value="">Tous les statuts</option>
            <option value="PAYER">Payé</option>
            <option value="NON PAYER">Non Payé</option>
            <option value="EN COURS">En Cours</option>
          </select>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm w-52"
          />
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm w-52"
          />
        </div>

        {/* Totaux */}
        <div className="flex flex-wrap gap-4 bg-white border rounded-lg p-4 text-sm">
          <div>
            Total Montant : <b>{formatMontant(totalMontant)}</b>
          </div>
          <div>
            Total Payé : <b>{formatMontant(totalPaye)}</b>
          </div>
          <div>
            Total Restant : <b>{formatMontant(totalRestant)}</b>
          </div>

          <div>
            Total Annuler Montant : <b>{formatMontant(totalAnnulerMontant)}</b>
          </div>
          <div>
            Total Annuler Payé : <b>{formatMontant(totalAnnulerPaye)}</b>
          </div>
          <div>
            Total Annuler Restant : <b>{formatMontant(totalAnnulerRestant)}</b>
          </div>
        </div>

        {/* Table + Pagination */}
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <>
            <CreditsTable
              credits={paginatedCredits}
              onDelete={handleAnnuler}
              handleAnnuler={handleAnnuler}
              handleEdit={openEditForm}
              utilisateur={utilisateur}
            />
            {pageCount > 1 && (
              <div className="flex justify-center mt-4">
                <ReactPaginate
                  previousLabel={"← Précédent"}
                  nextLabel={"Suivant →"}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  onPageChange={(e) => setCurrentPage(e.selected)}
                  containerClassName={"flex items-center space-x-2"}
                  pageClassName={"px-3 py-1 border rounded"}
                  activeClassName={"bg-indigo-600 text-white"}
                />
              </div>
            )}
          </>
        )}

        {/* Formulaire Modal */}
        {showForm && (
          <div className="modalOverlay">
            <div className="modalContent">
              <h3>{editingId ? "Modifier le crédit" : "Ajouter un crédit"}</h3>

              <div>
                <label>Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Entrer la description"
                />
              </div>

              <div>
                <label>Client</label>
                <select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clientId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">-- Client --</option>
                  {dataClient.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="">-- Type --</option>
                  <option value="ENTRE">Entre</option>
                  <option value="SORTIE">Sortie</option>
                </select>
              </div>

              <div>
                <label>Montant</label>
                <input
                  type="text"
                  placeholder="Montant"
                  value={
                    formData.montant
                      ? new Intl.NumberFormat("fr-FR").format(formData.montant)
                      : ""
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\s/g, "");
                    setFormData({
                      ...formData,
                      montant: Number(rawValue) || 0,
                    });
                  }}
                />
              </div>

              {editingId && (
                <div>
                  <label>Montant payé</label>
                  <input
                    type="text"
                    placeholder="Montant payé"
                    value={
                      montantPaye
                        ? new Intl.NumberFormat("fr-FR").format(montantPaye)
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\s/g, "");
                      setMontantPaye && setMontantPaye(Number(rawValue) || 0);
                    }}
                  />
                </div>
              )}

              <div className="modalActions">
                <button
                  type="button"
                  className="cancelBtn"
                  onClick={() => setShowForm(false)}
                  disabled={isLoading}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className={`submitBtn ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={editingId ? handleEdit : handleAdd}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="loader"></span> Chargement...
                    </span>
                  ) : editingId ? (
                    "Modifier"
                  ) : (
                    "Ajouter"
                  )}
                </button>
              </div>

              {/* <div className="modalActions">
                <button
                  type="button"
                  className="cancelBtn"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="submitBtn"
                  onClick={editingId ? handleEdit : handleAdd}
                >
                  {editingId ? "Modifier" : "Ajouter"}
                </button>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
