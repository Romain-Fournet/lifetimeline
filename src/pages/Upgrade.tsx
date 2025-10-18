import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Check, Sparkles } from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";

const Upgrade = () => {
  const navigate = useNavigate();
  const { subscription, upgradeToPremium, isPremium } = useSubscription();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await upgradeToPremium({ code });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsSubmitting(false);
  };

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vous êtes Premium !
          </h2>
          <p className="text-gray-600 mb-6">
            Vous avez déjà accès à toutes les fonctionnalités premium.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="Retour au dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-4 text-lg md:text-xl font-semibold text-gray-900">
            Passer à Premium
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Comparaison des plans */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Débloquez toutes les fonctionnalités
              </h2>
            </div>

            {/* Plan Gratuit */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Plan Gratuit
                </h3>
                {subscription?.tier === 'free' && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    Actuel
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    Jusqu'à <strong>4 catégories</strong>
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    Jusqu'à <strong>10 événements</strong>
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">
                    3 photos par événement
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Premium */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">Plan Premium</h3>
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                    Recommandé
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Catégories illimitées</strong>
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Événements illimités</strong>
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>20 photos par événement</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Fonctionnalités futures prioritaires</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de code */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Activer Premium
            </h3>
            <p className="text-gray-600 mb-6">
              Entrez votre code d'accès pour débloquer toutes les fonctionnalités.
            </p>

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">
                      Premium activé !
                    </p>
                    <p className="text-sm text-green-700">
                      Redirection vers le dashboard...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Code d'accès
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="PREMIUM2024"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !code.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Vérification...</span>
                  ) : (
                    <>
                      <Crown className="w-5 h-5" />
                      <span>Activer Premium</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Codes de test disponibles :
              </p>
              <div className="space-y-1 font-mono text-xs text-gray-600">
                <div className="bg-gray-50 px-3 py-2 rounded">PREMIUM2024</div>
                <div className="bg-gray-50 px-3 py-2 rounded">LIFETIMELINE-PRO</div>
                <div className="bg-gray-50 px-3 py-2 rounded">UPGRADE-NOW</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
