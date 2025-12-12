"use client";

import { APP_URL } from "@/app/environnement/environnements";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import useSound from "use-sound";

interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  role: string;
  boutique: any;
  boutiqueId: number;
}

interface Notification {
  id?: number;
  message: string;
  type: string;
  montant?: number;
  benefice?: number;
  timestamp: string;
  read?: boolean;
}

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Header({
  onMenuClick,
  title = "Tableau de bord",
}: HeaderProps) {
  const [caisses, setCaisses] = useState<{ CAISSE?: number }>({});
  const [prevCaisse, setPrevCaisse] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [utilisateurId, setUtilisateurId] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [play] = useSound("/notification1.wav", { volume: 0.5 });
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [boutiqueNom, setBoutiqueNom] = useState<string>("");

  // === Fetch initial caisse ===
  const fetchCaisses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${APP_URL}/api/caisse/listeParRole`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      const data = await res.json();
      setCaisses(data);
    } catch (err) {
      console.error("Erreur fetch caisse:", err);
    }
  };

  useEffect(() => {
    fetchCaisses();
  }, []);

  useEffect(() => {
    const current = caisses?.CAISSE ?? 0;
    if (current !== prevCaisse) setPrevCaisse(current);
  }, [caisses?.CAISSE, prevCaisse]);

  // === Récupérer utilisateur ===
useEffect(() => {
  const user = localStorage.getItem("utilisateur");
  if (user) {
    try {
      const parsed = JSON.parse(user);
      console.log(parsed);
      setUtilisateur(parsed);
      if (parsed.id) setUtilisateurId(Number(parsed.id));

      // Récupération du nom de la boutique
      if (parsed.boutique) {
        setBoutiqueNom(parsed.boutique.nom);
      } else {
        setBoutiqueNom(""); // pas de boutique → ne rien afficher
      }
    } catch (err) {
      console.error("Erreur lecture utilisateur:", err);
    }
  }
}, []);


  // === Notifications ===
  useEffect(() => {
    if (!utilisateurId) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${APP_URL}/api/notification/${utilisateurId}`);
        const data: Notification[] = await res.json();
        setNotifications(data.map((n) => ({ ...n, read: n.read ?? false })));
      } catch (err) {
        console.error("Erreur fetch notifications :", err);
      }
    };
    fetchNotifications();
  }, [utilisateurId]);

  // === Socket.io ===
  useEffect(() => {
    if (!utilisateurId) return;

    const s = io(`${APP_URL}`);
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connecté:", s.id);
      s.emit("registerUser", utilisateurId);
    });

    s.on("notification", (data: Notification) => {
      setNotifications((prev) => [{ ...data, read: false }, ...prev]);
      play();
    });

    s.on(
      "notificationGlobale",
      (data: { message: string; timestamp: string }) => {
        const notif: Notification = {
          message: data.message,
          type: "globale",
          timestamp: data.timestamp,
          read: false,
        };
        setNotifications((prev) => [notif, ...prev]);
        play();
      }
    );

    s.on("caisseMisAJour", () => {
      fetchCaisses();
    });

    return () => {
      s.disconnect();
    };
  }, [utilisateurId, play]);

  // === Fermer menus si clic en dehors ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const notifDropdown = document.getElementById("notif-dropdown");
      const userMenu = document.getElementById("user-menu");

      if (
        notifDropdown &&
        !notifDropdown.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("#notif-button")
      ) {
        setIsNotifOpen(false);
      }

      if (
        userMenu &&
        !userMenu.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("#user-button")
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const toggleNotif = () => setIsNotifOpen((prev) => !prev);
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    window.location.href = "/login";
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
          >
            <i className="ri-menu-line text-xl text-gray-600"></i>
          </button>

          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

            {/* --- CACHER POUR ADMIN --- */}
            {utilisateur?.role !== "ADMIN" && (
              <span className="text-gray-700 font-bold text-lg">
                Caisse: {(caisses?.CAISSE ?? 0).toLocaleString()} GNF
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 relative">
          <div className="relative">
            <button
              id="user-button"
              onClick={toggleUserMenu}
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600"
            >
              <i className="ri-user-line text-white"></i>
            </button>

            {isUserMenuOpen && (
              <div
                id="user-menu"
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50"
              >
                <button
                  onClick={() => (window.location.href = "/profil")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-800">
              {utilisateur?.role}
            </p>
            <p className="text-sm font-medium text-gray-800">{boutiqueNom}</p>
            <p className="text-xs text-gray-500">{utilisateur?.email}</p>
            <p className="text-xs text-gray-500">{utilisateur?.nom}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
