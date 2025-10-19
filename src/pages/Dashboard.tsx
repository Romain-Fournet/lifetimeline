// src/pages/Dashboard.tsx
import { useMemo } from "react";
import {
  Calendar,
  Plus,
  Settings,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { SubscriptionBanner } from "../components/ui/SubscriptionBanner";
import { useProfile } from "../hooks/useProfile";
import { useEvents } from "../hooks/useEvents";
import { useCategories } from "../hooks/useCategories";
import { useSubscription } from "../hooks/useSubscription";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { events } = useEvents();
  const { getCategoryById } = useCategories();
  const { isPremium } = useSubscription();

  const userName = profile?.username || "Utilisateur";

  // Obtenir l'heure pour le message personnalisé
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  // Événement "ce jour" pour le Hero
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

    const mostRecent = pastEvents.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    )[0];

    const yearsAgo = today.getFullYear() - mostRecent.startDate.getFullYear();

    return {
      title: mostRecent.title,
      yearsAgo,
      description: mostRecent.description,
      date: mostRecent.startDate,
    };
  }, [events]);

  // Stats simples pour "Votre vie en un coup d'œil"
  const lifeStats = useMemo(() => {
    if (events.length === 0) return null;

    const years = events.map((e) => e.startDate.getFullYear());
    const firstYear = Math.min(...years);
    const lastYear = Math.max(...years);
    const yearsCovered = lastYear - firstYear + 1;

    const lastEvent = [...events].sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    )[0];

    const uniqueLocations = new Set(
      events.filter((e) => e.location).map((e) => e.location)
    ).size;

    return {
      firstYear,
      lastYear,
      yearsCovered,
      totalEvents: events.length,
      lastEvent,
      uniqueLocations,
    };
  }, [events]);

  // Événements récents enrichis pour le feed
  const recentMoments = useMemo(() => {
    return [...events]
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .slice(0, 6)
      .map((event) => {
        const category = getCategoryById(event.category_id);
        const now = new Date();
        const monthsAgo = Math.floor(
          (now.getTime() - event.startDate.getTime()) /
            (1000 * 60 * 60 * 24 * 30)
        );

        let timeAgo = "";
        if (monthsAgo < 1) timeAgo = "Ce mois-ci";
        else if (monthsAgo < 12) timeAgo = `Il y a ${monthsAgo} mois`;
        else {
          const yearsAgo = Math.floor(monthsAgo / 12);
          timeAgo = `Il y a ${yearsAgo} an${yearsAgo > 1 ? "s" : ""}`;
        }

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.startDate,
          timeAgo,
          category: category?.name || "Sans catégorie",
          categoryColor: category?.color || "bg-gray-500",
          location: event.location,
        };
      });
  }, [events, getCategoryById]);

  // Suggestions contextuelles
  const suggestions = useMemo(() => {
    const suggestions = [];

    // Vérifier les années manquantes
    if (events.length > 0) {
      const currentYear = new Date().getFullYear();
      const eventsThisYear = events.filter(
        (e) => e.startDate.getFullYear() === currentYear
      );
      if (eventsThisYear.length === 0) {
        suggestions.push({
          text: `Vous n'avez rien ajouté en ${currentYear}. Complétez votre année!`,
          action: () => navigate("/timeline"),
          icon: Calendar,
        });
      }
    }

    return suggestions;
  }, [events, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple et discret */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-900">LifeTimeline</h1>
              {isPremium && (
                <Badge variant="premium" icon={Sparkles} size="sm">
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={Settings}
                onClick={() => navigate("/settings")}
              />
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => navigate("/timeline")}
              >
                <span className="hidden sm:inline">Ajouter un moment</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner d'abonnement pour les événements */}
        <div className="mb-6">
          <SubscriptionBanner
            currentCount={events.length}
            limitType="events"
          />
        </div>

        {/* Hero Section */}
        {todayMemory ? (
          <div className="mb-8 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-600 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {todayMemory.date.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Ce jour, il y a {todayMemory.yearsAgo} an
                {todayMemory.yearsAgo > 1 ? "s" : ""}
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-4">
                {todayMemory.title}
              </p>
              {todayMemory.description && (
                <p className="text-blue-100 max-w-2xl">
                  {todayMemory.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-600 rounded-2xl p-8 md:p-12 text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {getGreeting()}, {userName}
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Votre timeline de vie vous attend
            </p>
            <Button
              variant="secondary"
              size="lg"
              icon={Plus}
              onClick={() => navigate("/timeline")}
              className="bg-white text-blue-900 hover:bg-blue-50"
            >
              Ajouter votre premier moment
            </Button>
          </div>
        )}

        {/* Votre vie en un coup d'œil */}
        {lifeStats && (
          <div className="mb-8 bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Votre vie en un coup d'œil
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Timeline visuelle */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="h-2 bg-gradient-to-r from-blue-900 via-teal-500 to-emerald-500 rounded-full"></div>
                      <div className="absolute -left-1 -top-1 w-4 h-4 bg-blue-900 rounded-full border-2 border-white"></div>
                      <div className="absolute -right-1 -top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-blue-900">
                      {lifeStats.firstYear}
                    </div>
                    <div className="text-gray-500">Premier moment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {lifeStats.yearsCovered}
                    </div>
                    <div className="text-gray-500">
                      année{lifeStats.yearsCovered > 1 ? "s" : ""} capturée
                      {lifeStats.yearsCovered > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-500">
                      {lifeStats.lastYear}
                    </div>
                    <div className="text-gray-500">Aujourd'hui</div>
                  </div>
                </div>
              </div>

              {/* Stats complémentaires */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {lifeStats.totalEvents}
                    </div>
                    <div className="text-sm text-gray-600">
                      moment{lifeStats.totalEvents > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                {lifeStats.uniqueLocations > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {lifeStats.uniqueLocations}
                      </div>
                      <div className="text-sm text-gray-600">
                        lieu{lifeStats.uniqueLocations > 1 ? "x" : ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions contextuelles */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={suggestion.action}
                className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-left hover:bg-amber-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <suggestion.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.text}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Feed de moments récents */}
        {recentMoments.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Vos moments récents
              </h3>
              <button
                onClick={() => navigate("/timeline")}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center space-x-1 transition-colors"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recentMoments.map((moment) => (
                <button
                  key={moment.id}
                  onClick={() => navigate("/timeline")}
                  className="w-full bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-1 h-12 ${moment.categoryColor} rounded-full`}
                      ></div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                          {moment.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {moment.timeAgo}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">
                            {moment.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {moment.date.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  {moment.description && (
                    <p className="text-gray-600 line-clamp-2 mb-2">
                      {moment.description}
                    </p>
                  )}
                  {moment.location && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{moment.location}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-blue-900" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Votre timeline vous attend
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Commencez à capturer les moments importants de votre vie. Créez
              votre premier événement dès maintenant.
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={Plus}
              onClick={() => navigate("/timeline")}
            >
              Ajouter votre premier moment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
