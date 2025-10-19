import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Lock,
  LogOut,
  Trash2,
  Shield,
  AlertTriangle,
  Palette,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../lib/supabase";
import { SubscriptionCard } from "../components/ui/SubscriptionCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isEditing && profile?.username) {
      setUsername(profile.username);
    }
  }, [profile?.username, isEditing]);

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

      setSuccessMessage("Mot de passe modifié avec succès");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de la modification du mot de passe"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        profile?.id || ""
      );

      if (error) {
        throw error;
      }

      await signOut();
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du compte"
      );
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-blue-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
            >
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Abonnement */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Abonnement
            </h2>
            <SubscriptionCard />
          </div>

          {/* Profil */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profil
            </h2>
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{username || "Non défini"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{profile?.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setUsername(profile?.username || "");
                        }}
                        disabled={isSaving}
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Modifier le profil
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Gestion */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Gestion
            </h2>
            <Card className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Catégories
                    </h3>
                    <p className="text-sm text-gray-500">
                      Gérer vos catégories d'événements
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/categories")}
                >
                  Gérer
                </Button>
              </div>
            </Card>
          </div>

          {/* Sécurité */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sécurité
            </h2>
            <Card>
              {!showPasswordSection ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-900" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Mot de passe
                        </h3>
                        <p className="text-sm text-gray-500">
                          Modifiez votre mot de passe
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordSection(true)}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      placeholder="Minimum 6 caractères"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      placeholder="Répétez le mot de passe"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSaving}
                    >
                      {isSaving ? "Modification..." : "Modifier le mot de passe"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      disabled={isSaving}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Zone de danger */}
          <div>
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Zone de danger</span>
            </h2>
            <Card className="border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Supprimer mon compte
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cette action est irréversible. Toutes vos données seront
                    définitivement supprimées.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Supprimer
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Supprimer votre compte ?
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous absolument sûr ? Cette action est <strong>irréversible</strong>.
              Toutes vos données (événements, catégories, photos) seront
              définitivement supprimées.
            </p>
            <div className="flex items-center space-x-3">
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteAccount}
                fullWidth
              >
                Oui, supprimer définitivement
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDeleteConfirm(false)}
                fullWidth
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
