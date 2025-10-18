import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, TrendingUp, AlertTriangle } from "lucide-react";
import { useSubscription } from "../../hooks/useSubscription";

export function SubscriptionCard() {
  const navigate = useNavigate();
  const { subscription, isPremium, downgradeToFree } = useSubscription();
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleDowngrade = async () => {
    setIsDowngrading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await downgradeToFree();

    if (result.success) {
      setSuccessMessage("Vous êtes maintenant sur le plan gratuit");
      setShowDowngradeConfirm(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage(result.error || "Une erreur est survenue");
    }

    setIsDowngrading(false);
  };

  if (!subscription) return null;

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Abonnement
        </h2>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* Plan actuel */}
        <div className={`p-4 rounded-lg mb-4 ${
          isPremium
            ? 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {isPremium ? (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <div>
                <h3 className={`font-semibold ${isPremium ? 'text-purple-900' : 'text-gray-900'}`}>
                  {isPremium ? 'Plan Premium' : 'Plan Gratuit'}
                </h3>
                <p className={`text-sm ${isPremium ? 'text-purple-700' : 'text-gray-600'}`}>
                  {isPremium ? 'Accès illimité' : 'Limité'}
                </p>
              </div>
            </div>
          </div>

          {/* Limites */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={isPremium ? 'text-purple-700' : 'text-gray-600'}>
                Catégories
              </span>
              <span className={`font-semibold ${isPremium ? 'text-purple-900' : 'text-gray-900'}`}>
                {isPremium ? 'Illimitées' : `${subscription.limits.maxCategories} max`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={isPremium ? 'text-purple-700' : 'text-gray-600'}>
                Événements
              </span>
              <span className={`font-semibold ${isPremium ? 'text-purple-900' : 'text-gray-900'}`}>
                {isPremium ? 'Illimités' : `${subscription.limits.maxEvents} max`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={isPremium ? 'text-purple-700' : 'text-gray-600'}>
                Photos par événement
              </span>
              <span className={`font-semibold ${isPremium ? 'text-purple-900' : 'text-gray-900'}`}>
                {subscription.limits.maxPhotosPerEvent}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isPremium ? (
          <button
            onClick={() => setShowDowngradeConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            <span>Passer au plan gratuit</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <Crown className="w-4 h-4" />
            <span>Passer à Premium</span>
          </button>
        )}
      </div>

      {/* Modal de confirmation de downgrade */}
      {showDowngradeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Revenir au plan gratuit ?
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              Vous perdrez l'accès aux fonctionnalités premium :
            </p>

            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Limitation à <strong>4 catégories</strong> maximum</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Limitation à <strong>10 événements</strong> maximum</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Limitation à <strong>3 photos</strong> par événement</span>
              </li>
            </ul>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-orange-800">
                <strong>Attention :</strong> Si vous avez déjà plus de catégories ou d'événements que la limite gratuite, vous ne pourrez plus en créer de nouveaux.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDowngrade}
                disabled={isDowngrading}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isDowngrading ? "Modification..." : "Confirmer"}
              </button>
              <button
                onClick={() => setShowDowngradeConfirm(false)}
                disabled={isDowngrading}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
