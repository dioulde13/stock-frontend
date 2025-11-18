'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import LoginHeader from './LoginHeader';
import { APP_URL } from '../environnement/environnements';

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
  const [redirectReady, setRedirectReady] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${APP_URL}/api/utilisateur/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) throw new Error(data.message || 'Échec de la connexion');
      if (!data.token || !data.utilisateur) throw new Error('Réponse invalide du serveur');

      localStorage.setItem('token', data.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));

      setRedirectReady(true);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && redirectReady) {
      router.push('/dashboard');
    }
  }, [isLoading, redirectReady, router]);

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
