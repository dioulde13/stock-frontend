'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  { href: '/dashboard', icon: 'ri-dashboard-line', label: 'Tableau de bord' },
  { href: '/categories', icon: 'ri-box-3-line', label: 'Catégories' },
  { href: '/products', icon: 'ri-box-3-line', label: 'Produits' },
  { href: '/mouvement-stock', icon: 'ri-box-3-line', label: 'Mouvement stock' },
  { href: '/stock-minimum', icon: 'ri-box-3-line', label: 'Stock minimum' },
  { href: '/ventes', icon: 'ri-shopping-cart-line', label: 'Ventes' },
  { href: '/achats', icon: 'ri-shopping-bag-line', label: 'Achats' },
  { href: '/clients', icon: 'ri-user-line', label: 'Clients' },
  { href: '/fournisseurs', icon: 'ri-truck-line', label: 'Fournisseurs' },
  { href: '/credits', icon: 'ri-bank-card-line', label: 'Crédits' },
  { href: '/credit-payments', icon: 'ri-money-dollar-circle-line', label: 'Paiement crédits' },
  { href: '/expenses', icon: 'ri-money-dollar-box-line', label: 'Dépenses' },
  { href: '/utilisateurs', icon: 'ri-user-settings-line', label: 'Utilisateurs' },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('utilisateur');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
    } catch (error) {
      localStorage.removeItem('token');
      router.push('/login');
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

  const filteredMenuItems = utilisateur?.role === 'VENDEUR'
    ? menuItems.filter(item => item.href !== '/utilisateurs')
    : menuItems;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 flex flex-col
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold font-pacifico text-gray-800">logo</h1>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <i className="ri-close-line text-gray-600"></i>
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                ${pathname === item.href
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
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
        </nav>

        {/* Section Déconnexion fixée en bas */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <Link
            href="/login"
            className="flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('utilisateur');
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
