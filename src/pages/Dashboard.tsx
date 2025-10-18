// src/pages/Dashboard.tsx
import { useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Briefcase,
  Home,
  Car,
  Plane,
  Heart,
  Plus,
  ArrowRight,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "../components/ui/Cards/StatsCard";
import { EventCard } from "../components/ui/Cards/EventCard";
import { ActionButton } from "../components/ui/Buttons/ActionButton";
import { CategoryItem } from "../components/ui/CategoryItem";
import { MemoryCard } from "../components/ui/Cards/MemoryCard";

// Import du type depuis Timeline.tsx
import { useProfile } from "../hooks/useProfile";
import { useEvents } from "../hooks/useEvents";
import { useCategories } from "../hooks/useCategories";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { events } = useEvents();
  const { categories: userCategories, getCategoryById } = useCategories();

  // Récupérer le nom d'utilisateur depuis le profil
  const userName = profile?.username || "Utilisateur";

  // Calculer les vraies statistiques basées sur les événements
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const eventsThisYear = events.filter(
      (e) => e.startDate.getFullYear() === currentYear
    );

    const uniqueLocations = new Set(
      events.filter((e) => e.location).map((e) => e.location)
    );

    const years = events.map((e) => e.startDate.getFullYear());
    const yearsCovered =
      years.length > 0 ? Math.max(...years) - Math.min(...years) + 1 : 0;

    return [
      {
        label: "Événements",
        value: events.length.toString(),
        icon: Calendar,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        label: "Cette année",
        value: eventsThisYear.length.toString(),
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        label: "Lieux visités",
        value: uniqueLocations.size.toString(),
        icon: MapPin,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        label: "Années couvertes",
        value: yearsCovered.toString(),
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
    ];
  }, [events]);

  // Événements récents (5 derniers)
  const recentEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .slice(0, 5)
      .map((event) => {
        const category = getCategoryById(event.category_id);
        return {
          id: event.id,
          title: event.title,
          date: event.startDate,
          category: category?.name || "Sans catégorie",
          color: category?.color || "bg-gray-100 text-gray-700",
        };
      });
  }, [events, getCategoryById]);

  // Souvenirs récents (3 événements les plus récents avec année)
  const memories = useMemo(() => {
    return [...events]
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .slice(0, 3)
      .map((event) => {
        const year = event.startDate.getFullYear();
        const now = new Date();
        const monthsAgo = Math.floor(
          (now.getTime() - event.startDate.getTime()) /
            (1000 * 60 * 60 * 24 * 30)
        );

        let description = "";
        if (monthsAgo < 1) description = "Ce mois-ci";
        else if (monthsAgo < 12) description = `Il y a ${monthsAgo} mois`;
        else {
          const yearsAgo = Math.floor(monthsAgo / 12);
          description = `Il y a ${yearsAgo} an${yearsAgo > 1 ? "s" : ""}`;
        }

        const colors = [
          "bg-gradient-to-br from-pink-400 to-purple-500",
          "bg-gradient-to-br from-blue-400 to-cyan-500",
          "bg-gradient-to-br from-green-400 to-emerald-500",
        ];

        return {
          year,
          title: event.title,
          description,
          gradient: colors[Math.floor(Math.random() * colors.length)],
        };
      });
  }, [events]);

  // Compter les événements par catégorie
  const categories = useMemo(() => {
    // Compter les événements par category_id
    const counts = events.reduce((acc, event) => {
      acc[event.category_id] = (acc[event.category_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Mapper les icônes par défaut selon le slug de la catégorie
    const getIconForSlug = (slug: string | null) => {
      if (!slug) return Calendar;
      const iconMap: Record<string, typeof Briefcase> = {
        work: Briefcase,
        housing: Home,
        vehicle: Car,
        travel: Plane,
        relationship: Heart,
      };
      return iconMap[slug] || Calendar;
    };

    // Créer une liste de catégories avec leur compte
    return userCategories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      icon: getIconForSlug(cat.slug),
      count: counts[cat.id] || 0,
      color: cat.color,
    }));
  }, [events, userCategories]);

  // Événement "ce jour" (événement qui s'est passé le même jour d'une année précédente)
  const todayMemory = useMemo(() => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const pastEvents = events.filter((event) => {
      const eventDate = event.startDate;
      return (
        eventDate.getMonth() === todayMonth &&
        eventDate.getDate() === todayDate &&
        eventDate.getFullYear() < today.getFullYear()
      );
    });

    if (pastEvents.length === 0) return null;

    // Prendre l'événement le plus récent parmi ceux du même jour
    const mostRecent = pastEvents.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    )[0];

    const yearsAgo = today.getFullYear() - mostRecent.startDate.getFullYear();

    return {
      title: mostRecent.title,
      yearsAgo,
      description: mostRecent.description,
    };
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Bonjour {userName} 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenue sur votre timeline personnelle
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/settings")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Paramètres"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/timeline")}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Ma Timeline</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionButton
              label="Ajouter un événement"
              icon={Plus}
              variant="primary"
              onClick={() => navigate("/timeline")}
            />
            <ActionButton
              label="Voir la timeline"
              icon={Calendar}
              variant="secondary"
              onClick={() => navigate("/timeline")}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <div className="lg:col-span-2 space-y-8">
            {/* Memories Section */}
            {memories.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Souvenirs récents
                  </h2>
                  <button
                    onClick={() => navigate("/timeline")}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                  >
                    <span>Voir tout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {memories.map((memory, index) => (
                    <MemoryCard
                      key={index}
                      year={memory.year}
                      title={memory.title}
                      description={memory.description}
                      gradient={memory.gradient}
                      onClick={() => navigate("/timeline")}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Timeline Events */}
            {recentEvents.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Événements récents
                </h2>
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={event.date}
                      category={event.category}
                      color={event.color}
                      onClick={() => navigate("/timeline")}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {events.length === 0 && (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun événement
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par ajouter votre premier événement
                </p>
                <button
                  onClick={() => navigate("/timeline")}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter un événement</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories Overview */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Par catégorie
              </h2>
              <div className="space-y-3">
                {categories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    label={category.label}
                    icon={category.icon}
                    count={category.count}
                    color={category.color}
                  />
                ))}
              </div>
            </div>

            {/* This Day */}
            {todayMemory ? (
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5" />
                  <h3 className="font-semibold">Ce jour dans l'histoire</h3>
                </div>
                <p className="text-sm text-blue-100 mb-4">
                  Il y a {todayMemory.yearsAgo} an
                  {todayMemory.yearsAgo > 1 ? "s" : ""}
                </p>
                <h4 className="font-medium mb-2">{todayMemory.title}</h4>
                {todayMemory.description && (
                  <p className="text-sm text-blue-100">
                    {todayMemory.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5" />
                  <h3 className="font-semibold">Ce jour dans l'histoire</h3>
                </div>
                <p className="text-sm text-blue-100">
                  Aucun événement ne s'est produit ce jour-là dans le passé
                </p>
              </div>
            )}

            {/* Progress Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Votre année {new Date().getFullYear()}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Événements ajoutés</span>
                    <span className="font-medium text-gray-900">
                      {
                        events.filter(
                          (e) =>
                            e.startDate.getFullYear() ===
                            new Date().getFullYear()
                        ).length
                      }{" "}
                      / 100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (events.filter(
                            (e) =>
                              e.startDate.getFullYear() ===
                              new Date().getFullYear()
                          ).length /
                            100) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Lieux visités</span>
                    <span className="font-medium text-gray-900">
                      {
                        new Set(
                          events
                            .filter(
                              (e) =>
                                e.startDate.getFullYear() ===
                                  new Date().getFullYear() && e.location
                            )
                            .map((e) => e.location)
                        ).size
                      }{" "}
                      / 20
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (new Set(
                            events
                              .filter(
                                (e) =>
                                  e.startDate.getFullYear() ===
                                    new Date().getFullYear() && e.location
                              )
                              .map((e) => e.location)
                          ).size /
                            20) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
