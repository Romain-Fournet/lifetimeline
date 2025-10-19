// src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    // Récupérer l'email depuis localStorage (sauvegardé lors du signup)
    const signupEmail = localStorage.getItem("pendingVerificationEmail");
    if (signupEmail) {
      setEmail(signupEmail);
    } else {
      // Si pas d'email en attente, rediriger vers login
      navigate("/login");
    }
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        console.error("Erreur lors du renvoi:", error);
      } else {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-teal-600 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Vérifiez votre email
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Nous avons envoyé un email de confirmation à
          </p>

          {/* Email */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 font-medium text-center break-all">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-900 text-sm font-semibold">1</span>
              </div>
              <p className="text-gray-700 text-sm">
                Ouvrez votre boîte email
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-900 text-sm font-semibold">2</span>
              </div>
              <p className="text-gray-700 text-sm">
                Cliquez sur le lien de confirmation
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-900 text-sm font-semibold">3</span>
              </div>
              <p className="text-gray-700 text-sm">
                Vous serez redirigé pour compléter votre profil
              </p>
            </div>
          </div>

          {/* Success message if resent */}
          {resent && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-900 text-sm">Email renvoyé avec succès !</p>
            </div>
          )}

          {/* Resend button */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-3">
              Vous n'avez pas reçu l'email ?
            </p>
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={resending || resent}
              icon={RefreshCw}
              className={resending ? "animate-spin" : ""}
            >
              {resending ? "Envoi en cours..." : resent ? "Email renvoyé" : "Renvoyer l'email"}
            </Button>
          </div>

          {/* Helper text */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm">
              💡 <strong>Astuce :</strong> Vérifiez vos spams ou promotions si vous ne voyez pas l'email.
            </p>
          </div>

          {/* Back to login */}
          <div className="text-center">
            <button
              onClick={() => {
                localStorage.removeItem("pendingVerificationEmail");
                navigate("/login");
              }}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium inline-flex items-center space-x-1"
            >
              <span>Retour à la connexion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Additional help */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Problème avec la vérification ?{" "}
            <a href="mailto:support@lifetimeline.com" className="text-teal-600 hover:text-teal-700 font-medium">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
