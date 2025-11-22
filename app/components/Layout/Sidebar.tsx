"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  role: string;
  boutiqueId: number;
}

const menuItems = [
  { href: "/dashboard", icon: "ri-dashboard-line", label: "Tableau de bord" },
  { href: "/categories", icon: "ri-folder-2-line", label: "Catégories" },
  { href: "/products", icon: "ri-archive-2-line", label: "Produits" },
  {
    href: "/mouvement-stock",
    icon: "ri-exchange-box-line",
    label: "Mouvement stock",
  },
  { href: "/stock-minimum", icon: "ri-alert-line", label: "Stock minimum" },
  { href: "/ventes", icon: "ri-shopping-cart-line", label: "Ventes" },
  { href: "/achats", icon: "ri-shopping-bag-3-line", label: "Achats" },
  { href: "/clients", icon: "ri-user-smile-line", label: "Clients" },
  { href: "/fournisseurs", icon: "ri-truck-line", label: "Fournisseurs" },
  { href: "/credits", icon: "ri-bank-card-line", label: "Crédits" },
  { href: "/credit-payments", icon: "ri-cash-line", label: "Paiement crédits" },
  { href: "/expenses", icon: "ri-money-dollar-circle-line", label: "Dépenses" },
  {
    href: "/versement",
    icon: "ri-money-dollar-circle-line",
    label: "Versements",
  },
  {
    href: "/utilisateurs",
    icon: "ri-user-settings-line",
    label: "Utilisateurs",
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("utilisateur");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
    } catch (error) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setUtilisateur(userData);
      } catch (err) {
        console.error("Erreur lors du parsing de l'utilisateur :", err);
      }
    }
  }, [router]);

  const filteredMenuItems =
    utilisateur?.role === "VENDEUR"
      ? menuItems.filter((item) => item.href !== "/utilisateurs")
      : menuItems;

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
    fixed top-0 left-0 bg-white border-r border-gray-200 z-50
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:fixed lg:z-auto
    w-64 flex flex-col

    h-[100vh]      /* mobile */
    sm:h-[100vh]   /* sm */
    md:h-[80vh]    /* md : 80% */
    lg:h-[100vh]   /* lg et + */
  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Image
            src="/logo.webp"
            alt="Logo"
            width={150}
            height={60}
            className="rounded-full"
          />
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <i className="ri-close-line text-gray-600"></i>
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                ${
                  pathname === item.href
                    ? "bg-yellow-200 text-yellow-800 border-2 border-yellow-500"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
              onClick={() => window.innerWidth < 1024 && onToggle()}
            >
              <div className="w-5 h-5 flex items-center justify-center mr-3">
                <i className={`${item.icon} text-lg`}></i>
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Section Déconnexion fixée en bas */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/login"
            className="flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("utilisateur");
              window.innerWidth < 1024 && onToggle();
            }}
          >
            <div className="w-5 h-5 flex items-center justify-center mr-3">
              <i className="ri-logout-box-line text-lg"></i>
            </div>
            <span className="font-medium">Déconnexion</span>
          </Link>
        </div>
      </div>
    </>
  );
}
