import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  LogOut,
  Trash2,
  Save,
  X,
  Tag,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../lib/supabase";
import { SubscriptionCard } from "../components/ui/SubscriptionCard";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // États pour le profil
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // États pour le mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Mettre à jour les données quand le profile/user est chargé
  useEffect(() => {
    if (!isEditing) {
      if (profile?.username) {
        console.log("Setting username to:", profile.username);
        setUsername(profile.username);
      }
      if (profile?.email) {
        setEmail(profile.email);
      }
    }
  }, [profile?.username, profile?.email, isEditing]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await updateProfile({ username });

      if (error) {
        throw new Error(error);
      }

      setSuccessMessage("Profil mis à jour avec succès");
      setIsEditing(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        "Erreur lors de la mise à jour du profil" +
          (error instanceof Error ? `: ${error.message}` : "")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage("Mot de passe mis à jour avec succès");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        "Erreur lors de la mise à jour du mot de passe" +
          (error instanceof Error ? `: ${error.message}` : "")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        setErrorMessage("Erreur lors de la déconnexion");
      } else {
        navigate("/login");
      }
    } catch (error) {
      setErrorMessage(
        "Erreur lors de la déconnexion" +
          (error instanceof Error ? `: ${error.message}` : "")
      );
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implémenter la suppression du compte
      // Nécessite une fonction côté serveur pour supprimer l'utilisateur de auth.users
      alert("Fonctionnalité à venir");
      setShowDeleteConfirm(false);
    } catch (error) {
      setErrorMessage(
        "Erreur lors de la suppression du compte" +
          (error instanceof Error ? `: ${error.message}` : "")
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Subscription Section */}
        <div className="mb-6">
          <SubscriptionCard />
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personnalisation
          </h2>
          <button
            onClick={() => navigate("/categories")}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  Gérer les catégories
                </div>
                <div className="text-sm text-gray-600">
                  Créer, modifier et supprimer vos catégories d'événements
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Informations du profil
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Modifier
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-bold">
                {username?.[0]?.toUpperCase() ||
                  email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                    isEditing
                      ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                L'email ne peut pas être modifié
              </p>
            </div>

            {/* Save/Cancel buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Enregistrement..." : "Enregistrer"}</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(profile?.username || "");
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Mot de passe
            </h2>
            {!showPasswordSection && (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Changer
              </button>
            )}
          </div>

          {showPasswordSection ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Au moins 6 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Mise à jour..." : "Mettre à jour"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-600">••••••••</p>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl p-6 border border-red-200 mb-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4">
            Zone dangereuse
          </h2>

          <div className="space-y-4">
            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    Se déconnecter
                  </div>
                  <div className="text-sm text-gray-600">
                    Déconnexion de votre compte
                  </div>
                </div>
              </div>
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <div className="font-medium text-red-900">
                    Supprimer le compte
                  </div>
                  <div className="text-sm text-red-600">
                    Suppression permanente et irréversible
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Supprimer votre compte ?
            </h3>
            <p className="text-gray-600 mb-6">
              Cette action est irréversible. Toutes vos données seront
              définitivement supprimées.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
