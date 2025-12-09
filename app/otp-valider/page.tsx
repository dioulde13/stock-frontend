"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  FormEvent,
} from "react";
import { APP_URL } from "../environnement/environnements";

type ApiResponse = {
  message: string;
  token?: string;
  utilisateur?: {
    id: number;
    email: string;
    nom: string;
    role?: string | null;
  };
};

export default function OTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      showNotification(
        "Aucun email trouvé. Veuillez vous reconnecter.",
        "error"
      );
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = value[0] || "";
    setOtp(newOtp);

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key;
    const newOtp = [...otp];

    if (key === "Backspace") {
      e.preventDefault();
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }

    if (key === "Delete") {
      e.preventDefault();
      newOtp[index] = "";
      setOtp(newOtp);
    }

    if (key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (key === "ArrowRight" && index < inputsRef.current.length - 1)
      inputsRef.current[index + 1]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) {
      showNotification("Veuillez remplir les 4 chiffres de l'OTP", "error");
      return;
    }

    if (!email) {
      showNotification(
        "Email introuvable. Veuillez vous reconnecter.",
        "error"
      );
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${APP_URL}/api/utilisateur/verifierOtp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.token && data.utilisateur) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));

        showNotification("OTP validé avec succès !", "success");
        router.push("/dashboard");
      } else {
        showNotification(
          data.message || "Erreur lors de la validation de l'OTP",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      showNotification("Une erreur est survenue. Veuillez réessayer.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const response = await fetch(`${APP_URL}/api/utilisateur/renvoyerOtp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("OTP renvoyé avec succès !", "success");
      } else {
        showNotification(data.message || "Erreur lors du renvoi", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors du renvoi de l'OTP", "error");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/loginPhoto.jpg')" }}
    >
      <div className="max-w-md w-full space-y-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-center mb-4">
          Entrez votre code OTP
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => {
                  if (el) inputsRef.current[index] = el;
                }}
                className="w-14 h-14 text-center text-2xl border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          <div className="flex gap-3 w-full justify-between">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex-1 bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500 transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition flex justify-center items-center gap-1"
            >
              {loading ? "Validation..." : "Valider le code"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleResend}
            className="text-blue-500 hover:underline mt-2"
          >
            Vous n'avez pas reçu le code ? Renvoyer
          </button>
        </form>

        {notification && (
          <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 text-center max-w-md w-full ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}
