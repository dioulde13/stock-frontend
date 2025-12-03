"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import CreditPaymentsTable from "./CreditPaymentsTable";
import { addPayment, getPayments } from "./services/payementCreditService";
import DashboardLayout from "../components/Layout/DashboardLayout";
import "./paiement.css";

export default function CreditPaymentsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    utilisateurId: "",
    montant: 0,
  });
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Recherche + filtre dates
  const [searchTerm, setSearchTerm] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

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

  useEffect(() => {
    const user = localStorage.getItem("utilisateur");
    let utilisateurId = "";
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        utilisateurId = parsedUser.id ? String(parsedUser.id) : "";
        setFormData((prev) => ({ ...prev, utilisateurId }));
      } catch {}
    }
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) router.push("/login");
    fetchPayments();
  }, [router]);

  const fetchPayments = async () => {
    try {
      // setLoading(true);
      const data = await getPayments();
      console.log(data);
      setPayments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.reference || !formData.utilisateurId || !formData.montant) {
      setIsModalOpen(false);
      return showNotification("Veuillez remplir tous les champs", "error");
    }

    try {
      const response = await addPayment({
        reference: formData.reference,
        utilisateurId: Number(formData.utilisateurId),
        montant: Number(formData.montant),
      });

      setIsModalOpen(false);

      showNotification(
        response?.message || "Paiement enregistré avec succès !",
        "success"
      );

      setFormData({
        reference: "",
        utilisateurId: formData.utilisateurId,
        montant: 0,
      });

      await fetchPayments();
    } catch (error: any) {
      setIsModalOpen(false);

      showNotification(
        error?.message || "Erreur lors de l'enregistrement du paiement",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtrage + Pagination + Dates
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const refMatch = payment.Credit?.reference
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const date = new Date(payment.createdAt);
      const afterStart = dateStart ? date >= new Date(dateStart) : true;
      const beforeEnd = dateEnd
        ? date <= new Date(dateEnd + "T23:59:59")
        : true;
      return refMatch && afterStart && beforeEnd;
    });
  }, [payments, searchTerm, dateStart, dateEnd]);

  const pageCount = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const creditsAnnulerActifs = filteredPayments.filter(
    (c) => c.status === "ANNULER"
  );

  const creditsActifs = filteredPayments.filter((c) => c.status !== "ANNULER");

  const totalMontant = creditsActifs.reduce((sum, p) => sum + p.montant, 0);

  const totalAnnulerMontant = creditsAnnulerActifs.reduce(
    (sum, p) => sum + p.montant,
    0
  );

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
    <DashboardLayout title="Paiement crédits">
      {/* ✅ Notification */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 ${
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
            <h2 className="text-2xl font-bold text-gray-900">
              Paiements de crédits
            </h2>
            <p className="text-gray-600">
              Suivez les paiements des crédits clients
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-money-dollar-circle-line"></i>
            <span>Enregistrer un paiement</span>
          </button>
        </div>

        {/* Total montant */}
        <div className="bg-white border rounded-lg p-3 text-sm font-medium flex flex-col md:flex-row justify-between gap-3 md:gap-0">
          {/* Totaux */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div>
              Total Montant Valider:{" "}
              <span className="text-teal-600">{totalMontant} GNF</span>
            </div>
            <div>
              Total Montant Annuler:{" "}
              <span className="text-teal-600">{totalAnnulerMontant} GNF</span>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-3 items-start md:items-end">
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-sm font-medium mb-1">Date début</label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="border px-2 py-1 rounded w-40"
              />
            </div>
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-sm font-medium mb-1">Date fin</label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="border px-2 py-1 rounded w-40"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <CreditPaymentsTable
          payments={paginatedPayments}
          onRefresh={fetchPayments}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-4">
            <button
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded mx-1"
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ← Précédent
            </button>
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 border rounded mx-1 ${
                  currentPage === i ? "bg-teal-600 text-white" : ""
                }`}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === pageCount - 1}
              className="px-3 py-1 border rounded mx-1"
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Suivant →
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="modalOverlay">
            <div className="modalContent">
              <h3>Enregistrer un paiement</h3>

              <input
                type="text"
                name="reference"
                placeholder="Référence du crédit"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
              />

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
              />

              <div className="modalActions">
                <button
                  type="button"
                  className="cancelBtn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className={`submitBtn ${loading ? "disabled" : ""}`}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
