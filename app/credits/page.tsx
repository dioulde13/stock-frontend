"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import CreditsTable from "./CreditsTable";
import {
  getCredits,
  createCredit,
  updateCredit,
  deleteCredit,
  annulerCredit,
} from "./services/creditService";
import ReactPaginate from "react-paginate";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { formatMontant } from "../components/utils/formatters";

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

  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");

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
      const res = await fetch("http://localhost:3000/api/client/liste", {
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

  const handleAdd = async () => {
    if (!formData.clientId || !formData.type || !formData.montant) {
      // setModalType("error");
      setModalMessage("Veuillez remplir tous les champs");
      // setModalVisible(true);
      return;
    }

    try {
      const response = await createCredit({
        utilisateurId: Number(formData.utilisateurId),
        clientId: Number(formData.clientId),
        description: formData.description,
        type: formData.type,
        typeCredit: formData.typeCredit,
        montant: Number(formData.montant),
      });

      // setModalType("success");
      // setModalMessage(response.message || "Crédit créé avec succès.");
      // setModalVisible(true);

      showNotification(response.message);

      setShowForm(false);
      resetForm();
      fetchCredits();
    } catch (err) {
      console.error("Erreur lors de la création du crédit :", err);
      // showNotification(err);
      // setModalType("error");
      // setModalVisible(true);
    }
  };

  const handleEdit = async () => {
    if (editingId === null) return;
    if (!formData.clientId || !formData.type || !formData.montant) {
      return showNotification("Veuillez remplir tous les champs");
    }
    try {
      await updateCredit(editingId, {
        utilisateurId: Number(formData.utilisateurId),
        clientId: Number(formData.clientId),
        type: formData.type,
        typeCredit: formData.typeCredit,
        description: formData.description,
        montant: Number(formData.montant),
      });
      showNotification("Update reussi avec success");
      setShowForm(false);
      setEditingId(null);
      setMontantPaye(0);
      resetForm();
      fetchCredits();
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de la modification du crédit");
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

  const handleDelete = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce crédit ?")) {
      try {
        await deleteCredit(id);
        fetchCredits();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAnnuler = async (id: number) => {
    if (confirm("Voulez-vous vraiment annuler ce crédit ?")) {
      try {
        await annulerCredit(id);
        fetchCredits();
      } catch (err) {
        console.error(err);
      }
    }
  };

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

  // const totalMontant = filteredCredits.reduce((sum, c) => sum + c.montant, 0);
  // const totalPaye = filteredCredits.reduce((sum, c) => sum + c.montantPaye, 0);
  // const totalRestant = filteredCredits.reduce(
  //   (sum, c) => sum + c.montantRestant,
  //   0
  // );

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

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 1000);
  };

  return (
    <DashboardLayout title="Crédits">
      {/* {modalVisible && (
        <Modal
          title={modalType === "error" ? "Erreur" : "Succès"}
          onClose={() => setModalVisible(false)}
        >
          <p>{modalMessage}</p>
          <button onClick={() => setModalVisible(false)}>OK</button>
        </Modal>
      )} */}

      {notification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {notification}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gestion des crédits
            </h2>
            <p className="text-gray-600">
              Suivez les crédits accordés aux clients
            </p>
          </div>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 whitespace-nowrap"
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-gray-50 p-3 rounded-lg border">
          <input
            type="text"
            placeholder="Référence"
            value={filterReference}
            onChange={(e) => setFilterReference(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Tous les types</option>
            <option value="ENTRE">ENTRE</option>
            <option value="SORTIE">SORTIE</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
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
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
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
              onDelete={handleDelete}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                {editingId ? "Modifier le crédit" : "Ajouter un crédit"}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Entrer la description"
                />
              </div>
              <select
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">-- Client --</option>
                {dataClient.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.nom}
                  </option>
                ))}
              </select>

              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">-- Type --</option>
                <option value="ENTRE">Entre</option>
                <option value="SORTIE">Sortie</option>
              </select>

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
                  setFormData({ ...formData, montant: Number(rawValue) || 0 });
                }}
                className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg text-sm"
              />

              {editingId && (
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
                    setMontantPaye(Number(rawValue) || 0);
                  }}
                  className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg text-sm"
                />
              )}

              <div className="flex justify-end space-x-3 mt-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                  onClick={editingId ? handleEdit : handleAdd}
                >
                  {editingId ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
