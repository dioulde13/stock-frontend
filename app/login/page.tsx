// LoginPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import LoginHeader from './LoginHeader';
import { APP_URL } from '@/environnement/environnements';

type ApiResponse = {
  message?: string;
  token?: string;
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
    // Note: ton API attend "email" et "mot_de_passe" d'après ce que tu as envoyé.
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${APP_URL}/api/utilisateur/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // envoyer mot_de_passe selon ton API Node.js
        body: JSON.stringify({ email, mot_de_passe: password }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        // si ton API renvoie { message: "..." } en cas d'erreur, on l'utilise
        throw new Error(data.message || 'Échec de la connexion');
      }

      if (!data.token || !data.utilisateur) {
        throw new Error('Réponse invalide du serveur');
      }
      console.log(data.token);

      // Stockage (ou tu peux utiliser cookies / httpOnly selon sécurité désirée)
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));

      // redirection vers le dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        <LoginHeader />
        {error && <p className="text-red-500 text-center">{error}</p>}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  );
}
