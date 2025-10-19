// src/pages/Onboarding.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  MapPin,
  Heart,
  Briefcase,
  GraduationCap,
  Home,
  Plane,
  HeartHandshake,
  Activity,
  Palette,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useProfile } from "../hooks/useProfile";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface OnboardingData {
  birthdate: string;
  location: string;
  bio: string;
  firstMemory: {
    title: string;
    date: string;
    description: string;
  };
  selectedCategories: string[];
}

const DEFAULT_CATEGORIES = [
  { slug: "work", name: "Travail & Carrière", icon: Briefcase, color: "bg-blue-500", description: "Jobs, promotions, projets professionnels" },
  { slug: "education", name: "Études & Formation", icon: GraduationCap, color: "bg-purple-500", description: "Diplômes, cours, apprentissages" },
  { slug: "housing", name: "Logement", icon: Home, color: "bg-green-500", description: "Déménagements, achats immobiliers" },
  { slug: "travel", name: "Voyages", icon: Plane, color: "bg-teal-500", description: "Vacances, découvertes, aventures" },
  { slug: "relationship", name: "Relations", icon: HeartHandshake, color: "bg-pink-500", description: "Rencontres, mariages, amitiés" },
  { slug: "health", name: "Santé & Bien-être", icon: Activity, color: "bg-red-500", description: "Sport, santé, développement personnel" },
  { slug: "hobbies", name: "Loisirs & Passions", icon: Palette, color: "bg-orange-500", description: "Hobbies, projets créatifs" },
  { slug: "finance", name: "Finances", icon: Wallet, color: "bg-emerald-500", description: "Investissements, achats importants" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { createCategory } = useCategories();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    birthdate: "",
    location: "",
    bio: "",
    firstMemory: {
      title: "",
      date: "",
      description: "",
    },
    selectedCategories: ["work", "housing", "travel", "relationship"], // Pré-sélectionné
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleCategory = (slug: string) => {
    setData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(slug)
        ? prev.selectedCategories.filter((s) => s !== slug)
        : [...prev.selectedCategories, slug],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // 1. Mettre à jour le profil avec les nouvelles infos
      const age = data.birthdate
        ? new Date().getFullYear() - new Date(data.birthdate).getFullYear()
        : null;

      // 1. Mettre à jour le profil dans la table users
      await updateProfile({
        username: user?.email?.split("@")[0] || "user",
        birthdate: data.birthdate,
        location: data.location,
        bio: data.bio,
        onboarding_completed: true,
      });

      // Aussi sauvegarder dans les metadata Supabase pour cohérence
      await supabase.auth.updateUser({
        data: {
          birthdate: data.birthdate,
          location: data.location,
          bio: data.bio,
          age: age,
          onboarding_completed: true,
        },
      });

      // 2. Créer les catégories sélectionnées
      const categoryPromises = data.selectedCategories.map((slug, index) => {
        const category = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
        if (!category) return Promise.resolve();

        return createCategory({
          name: category.name,
          slug: category.slug,
          icon: category.slug,
          color: category.color,
          description: category.description,
          display_order: index,
        });
      });

      await Promise.all(categoryPromises);

      // 3. Créer le premier événement si renseigné
      if (data.firstMemory.title && data.firstMemory.date) {
        const firstCategory = data.selectedCategories[0];
        const categoryData = DEFAULT_CATEGORIES.find((c) => c.slug === firstCategory);

        if (categoryData) {
          // On va d'abord récupérer l'ID de la catégorie créée
          const { data: categories } = await supabase
            .from("categories")
            .select("id")
            .eq("user_id", user?.id)
            .eq("slug", firstCategory)
            .single();

          if (categories) {
            await supabase.from("events").insert({
              user_id: user?.id,
              category_id: categories.id,
              title: data.firstMemory.title,
              description: data.firstMemory.description,
              start_date: new Date(data.firstMemory.date).toISOString(),
              end_date: null,
            });
          }
        }
      }

      // 4. Rediriger vers le dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors de l'onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-teal-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Étape {step} sur {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-900 to-teal-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Profil Personnel */}
          {step === 1 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-teal-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Parlez-nous de vous
                  </h2>
                  <p className="text-gray-600">
                    Ces informations nous aident à personnaliser votre expérience
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Date de naissance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={data.birthdate}
                    onChange={(e) => setData({ ...data, birthdate: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Nous l'utiliserons pour contextualiser votre timeline
                  </p>
                </div>

                {/* Lieu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Où vivez-vous actuellement ?
                  </label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    placeholder="Paris, France"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart className="w-4 h-4 inline mr-2" />
                    Qui êtes-vous en une phrase ?
                  </label>
                  <textarea
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder="Ex: Développeur passionné, amateur de voyages et de photographie"
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-sm text-gray-500 text-right">
                    {data.bio.length}/200
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Premier Souvenir */}
          {step === 2 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-teal-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Votre premier souvenir
                  </h2>
                  <p className="text-gray-600">
                    Commencez votre timeline avec un moment marquant (optionnel)
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quel moment souhaitez-vous immortaliser ?
                  </label>
                  <input
                    type="text"
                    value={data.firstMemory.title}
                    onChange={(e) =>
                      setData({
                        ...data,
                        firstMemory: { ...data.firstMemory, title: e.target.value },
                      })
                    }
                    placeholder="Ex: Mon premier jour d'école, Rencontre avec mon conjoint..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quand était-ce ?
                  </label>
                  <input
                    type="date"
                    value={data.firstMemory.date}
                    onChange={(e) =>
                      setData({
                        ...data,
                        firstMemory: { ...data.firstMemory, date: e.target.value },
                      })
                    }
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Racontez ce moment
                  </label>
                  <textarea
                    value={data.firstMemory.description}
                    onChange={(e) =>
                      setData({
                        ...data,
                        firstMemory: {
                          ...data.firstMemory,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder="Décrivez ce souvenir, ce que vous avez ressenti..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 text-sm">
                    💡 <strong>Astuce :</strong> Vous pourrez ajouter plus de détails et de photos plus tard !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Catégories */}
          {step === 3 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-teal-600 rounded-xl flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Organisez votre vie
                  </h2>
                  <p className="text-gray-600">
                    Sélectionnez les catégories qui vous correspondent
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {DEFAULT_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isSelected = data.selectedCategories.includes(category.slug);

                  return (
                    <button
                      key={category.slug}
                      onClick={() => toggleCategory(category.slug)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-blue-900 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-teal-900 text-sm">
                  ✨ <strong>{data.selectedCategories.length} catégorie(s) sélectionnée(s)</strong> - Vous pourrez en créer d'autres plus tard !
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} icon={ChevronLeft}>
                Retour
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button variant="primary" onClick={handleNext} icon={ChevronRight}>
                Suivant
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={loading || data.selectedCategories.length === 0}
                icon={Sparkles}
              >
                {loading ? "Création..." : "Commencer mon aventure"}
              </Button>
            )}
          </div>

          {/* Skip link */}
          {step === 2 && (
            <div className="text-center mt-4">
              <button
                onClick={handleNext}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Passer cette étape
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
