import { Link } from "react-router-dom";
import {
  Calendar,
  Heart,
  MapPin,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  Check,
  Crown,
} from "lucide-react";
import { Button } from "../components/ui/Button";

const Landing = () => {
  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Timeline Interactive",
      description:
        "Visualisez votre vie en un coup d'œil avec une frise chronologique intuitive",
      color: "bg-blue-900",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Moments Précieux",
      description:
        "Capturez et organisez tous vos souvenirs importants avec photos et détails",
      color: "bg-teal-500",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Contextes de Vie",
      description:
        "Suivez où vous habitiez, travailliez, et les étapes clés de votre parcours",
      color: "bg-emerald-500",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Catégories Flexibles",
      description:
        "Organisez par voyages, carrière, relations, véhicules et bien plus",
      color: "bg-blue-900",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Partage (Bientôt)",
      description:
        "Partagez vos timelines avec famille et amis, créez des souvenirs ensemble",
      color: "bg-teal-500",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Souvenirs Automatiques",
      description:
        "Recevez des rappels 'Il y a X ans aujourd'hui' de vos moments spéciaux",
      color: "bg-emerald-500",
    },
  ];

  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      period: "toujours",
      features: [
        "Jusqu'à 10 moments",
        "Jusqu'à 4 catégories",
        "3 photos par événement",
        "Export PDF basique",
      ],
      cta: "Commencer gratuitement",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "9€",
      period: "par mois",
      features: [
        "Moments illimités",
        "Catégories illimitées",
        "20 photos par événement",
        "Export PDF avancé",
        "Thèmes personnalisés",
        "Support prioritaire",
      ],
      cta: "Essayer Premium",
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-teal-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                LifeTimeline
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-[size:32px_32px]"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
              <Sparkles className="w-4 h-4" />
              <span>Votre vie, racontée en une timeline</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Capturez chaque
              <span className="bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">
                {" "}
                moment important{" "}
              </span>
              de votre vie
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Une timeline interactive pour préserver, organiser et revivre vos
              souvenirs les plus précieux.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                  Commencer gratuitement
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Voir la démo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des fonctionnalités pensées pour capturer et organiser votre
              histoire personnelle
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all"
              >
                <div
                  className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600">
              Commencez gratuitement, passez à Premium quand vous êtes prêt
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 ${
                  plan.highlighted
                    ? "ring-2 ring-blue-900 shadow-2xl relative"
                    : "border border-gray-200 shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Crown className="w-4 h-4" />
                      <span>Populaire</span>
                    </div>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-gray-600"
                    >
                      <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button
                    variant={plan.highlighted ? "primary" : "outline"}
                    size="lg"
                    fullWidth
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer votre timeline ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'utilisateurs qui préservent leurs souvenirs
            avec LifeTimeline
          </p>
          <Link to="/signup">
            <Button
              variant="secondary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="bg-white text-blue-900 hover:bg-blue-50"
            >
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-teal-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold">LifeTimeline</span>
            </div>
            <div className="text-sm">
              © 2025 LifeTimeline. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
