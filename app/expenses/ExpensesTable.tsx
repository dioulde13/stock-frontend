"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getDepenses,
  deleteDepense,
  annulerDepense,
} from "./services/depenseService";
import { formatMontant } from "../components/utils/formatters";

type Depense = {
  id: number;
  description: string;
  montant: number;
  status: string;
  utilisateurId: number;
  createdAt: string;
};

export default function ExpensesTable({
  // onEdit,
  refreshTrigger,
}: {
  onEdit?: (expense: Depense) => void;
  refreshTrigger?: boolean;
}) {
  const [expenses, setExpenses] = useState<Depense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  // 🔹 Modal d’annulation
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Depense | null>(null);

  const [utilisateur, setUtilisateur] = useState<any>({});

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

  // 🔹 Récupération des dépenses
const fetchDepenses = async () => {
  try {
    const data = await getDepenses();

    const filteredData = data
      .filter((depense: any) => depense.status !== "ANNULER")
      .sort((a: any, b: any) => {
        // Tri décroissant par createdAt si présent
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Sinon tri décroissant par id
        return b.id - a.id;
      });

    setExpenses(filteredData);
  } catch (error) {
    console.error(error);
    showNotification("Erreur lors du chargement des dépenses", "error");
  }
};


  useEffect(() => {
    fetchDepenses();
    const user = localStorage.getItem("utilisateur");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUtilisateur(parsedUser);
      } catch {}
    }
  }, [refreshTrigger]);


  // 🔹 Clic sur "Annuler"
  const handleAnnulerClick = (expense: Depense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  // 🔹 Confirmation d’annulation
  const confirmAnnulation = async () => {
    if (!selectedExpense) return;

    try {
      const res = await annulerDepense(selectedExpense.id);

      showNotification(res.message || "Dépense annulée avec succès", "success");

      setExpenses((prev) =>
        prev.map((d) =>
          d.id === selectedExpense.id ? { ...d, status: "ANNULER" } : d
        )
      );

      setShowModal(false);
      setSelectedExpense(null);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Erreur lors de l’annulation";
      showNotification(errorMessage, "error");
    }
  };

  // 🔹 Filtrage des dépenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.id.toString().includes(searchTerm);
      const date = new Date(expense.createdAt);
      const afterStart = dateStart ? date >= new Date(dateStart) : true;
      const beforeEnd = dateEnd
        ? date <= new Date(dateEnd + "T23:59:59")
        : true;
      return matchesSearch && afterStart && beforeEnd;
    });
  }, [expenses, searchTerm, dateStart, dateEnd]);

  const pageCount = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalMontant = filteredExpenses.reduce((sum, d) => sum + d.montant, 0);

  return (
    <div className="relative bg-white rounded-lg shadow-lg border border-gray-200">
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

      {/* 🔹 Filtres */}
    <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-end flex-wrap">
  {/* Search */}
  <div className="flex-1 relative w-full sm:w-auto">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <i className="ri-search-line text-gray-400"></i>
    </div>
    <input
      type="text"
      placeholder="Rechercher une dépense..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="block w-50 sm:w-[250px] pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
    />
  </div>

  {/* Date début */}
  <div className="flex flex-col w-50 sm:w-auto">
    <label className="text-sm font-medium mb-1">Date début</label>
    <input
      type="date"
      value={dateStart}
      onChange={(e) => setDateStart(e.target.value)}
      className="border px-2 py-1 rounded w-50 sm:w-auto"
    />
  </div>

  {/* Date fin */}
  <div className="flex flex-col w-50 sm:w-auto">
    <label className="text-sm font-medium mb-1">Date fin</label>
    <input
      type="date"
      value={dateEnd}
      onChange={(e) => setDateEnd(e.target.value)}
      className="border px-2 py-1 rounded w-50 sm:w-auto"
    />
  </div>

  {/* Total Montant */}
  <div className="bg-red-50 text-red-700 px-3 py-1 rounded text-sm font-medium w-50 sm:w-auto text-center sm:text-left">
    Total Montant : {formatMontant(totalMontant)}
  </div>
</div>


      {/* 🔹 Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Dépense
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Statut
              </th>
              {utilisateur.role ==='ADMIN' ? (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              ) : (
                ""
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(expense.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {expense.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatMontant(expense.montant)}
                </td>
                <td
                  className={`px-6 py-4 text-sm font-semibold ${
                    expense.status === "VALIDER"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {expense.status}
                </td>
                {utilisateur.role ==='ADMIN' ? (
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAnnulerClick(expense)}
                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Annuler
                      </button>
                    </div>
                  </td>
                ) : (
                  ""
                )}
              </tr>
            ))}
            {paginatedExpenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Aucune dépense trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Pagination */}
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
                currentPage === i ? "bg-red-600 text-white" : ""
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

      {/* 🔹 Modal d’annulation */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Annuler la dépense
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler la dépense{" "}
              <strong>{selectedExpense.description}</strong> ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Non
              </button>
              <button
                onClick={confirmAnnulation}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
