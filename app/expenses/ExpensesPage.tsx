"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ExpensesTable from "./ExpensesTable";
import ExpenseModal from "./ExpenseModal";
import DashboardLayout from "../components/Layout/DashboardLayout";

interface Utilisateur {
  role: string;
}

export default function ExpensesPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null); // null = création
  const [refreshTable, setRefreshTable] = useState(false); // pour rafraîchir le tableau
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);

  // 🔹 Notifications globales
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    }
    const stored = localStorage.getItem("utilisateur");
    if (stored) {
      const parsed = JSON.parse(stored);
      //  console.log(parsed);
      setUtilisateur(parsed);
    }
  }, [router]);

  const handleAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleRefresh = () => setRefreshTable((prev) => !prev);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <DashboardLayout title="Dépenses">
      <div className="space-y-6">
        <>
          {utilisateur?.role !== "ADMIN" ? (
            <div className="flex items-center justify-between">
              <button
                onClick={handleAdd}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 whitespace-nowrap"
              >
                <i className="ri-money-dollar-box-line"></i>
                <span>Nouvelle dépense</span>
              </button>
            </div>
          ) : (
            ""
          )}
        </>
        {/* Tableau des dépenses */}
        <ExpensesTable onEdit={handleEdit} refreshTrigger={refreshTable} />

        {/* Modal */}
        {isModalOpen && (
          <ExpenseModal
            expense={editingExpense}
            onClose={() => setIsModalOpen(false)}
            onRefresh={handleRefresh}
            showNotification={showNotification}
          />
        )}

        {/* 🔔 Notification globale */}
        {notification && (
          <div
            className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white z-50 transition-all duration-300 ${
              notificationType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {notification}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
