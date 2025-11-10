"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Ce hook active l’intercepteur global une fois monté
export function useFetchInterceptor() {
  const router = useRouter();

  useEffect(() => {
    // Sauvegarde du fetch original
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = localStorage.getItem("token");
      const headers = {
        ...init?.headers,
        Authorization: token ? `Bearer ${token}` : "",
      };

      try {
        const response = await originalFetch(input, { ...init, headers });

        // Vérifie le code d’erreur d’authentification
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          if (!token) {
            // Redirection automatique si token manquant
            window.location.href = "/login";
          }
        }

        return response;
      } catch (error) {
        console.error("Erreur de requête:", error);
        throw error;
      }
    };

    // Nettoyage à la désactivation du composant
    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);
}
