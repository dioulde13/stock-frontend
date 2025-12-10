"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";
import LoginHeader from "./LoginHeader";
import { APP_URL } from "../environnement/environnements";

type ApiResponse = {
  message?: string;
  token?: string;
  step?: string;
  utilisateur?: {
    id: number;
    email: string;
    nom: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${APP_URL}/api/utilisateur/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) throw new Error(data.message || "Échec de la connexion");

      // Enregistrer l'email dans localStorage
      localStorage.setItem("email", email);

      // // Vérifier si l'étape OTP est requise
      // if (data.step === "otp_required") {
      //   router.push("/otp-valider"); // rediriger vers la page OTP
      //   return;
      // }

      // Si pas d'OTP, connexion normale
      if (data.token && data.utilisateur) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));

        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/loginPhoto.jpg')" }}
    >
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8">
        <LoginHeader />
        {error && <p className="text-red-500 text-center">{error}</p>}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  );
}
