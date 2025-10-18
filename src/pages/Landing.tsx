import { useState } from "react";
import {
  Calendar,
  Heart,
  MapPin,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

const Landing = () => {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Timeline Interactive",
      description:
        "Visualisez votre vie en un coup d'œil avec une frise chronologique intuitive",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Moments Précieux",
      description:
        "Capturez et organisez tous vos souvenirs importants avec photos et détails",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Contextes de Vie",
      description:
        "Suivez où vous habitiez, travailliez, et les étapes clés de votre parcours",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Catégories Flexibles",
      description:
        "Organisez par voyages, carrière, relations, véhicules et bien plus",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Partage (Bientôt)",
      description:
        "Partagez vos timelines avec famille et amis, créez des souvenirs ensemble",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Souvenirs Automatiques",
      description:
        "Recevez des rappels 'Il y a X ans aujourd'hui' de vos moments spéciaux",
    },
  ];

  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      period: "toujours",
      features: [
        "Jusqu'à 50 événements",
        "100 MB de stockage photos",
        "1 timeline personnelle",
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
        "Événements illimités",
        "5 GB de stockage photos",
        "Timelines illimitées",
        "Export PDF avancé",
        "Thèmes personnalisés",
        "Support prioritaire",
      ],
      cta: "Essai gratuit 14 jours",
      highlighted: true,
    },
    {
      name: "Pro",
      price: "19€",
      period: "par mois",
      features: [
        "Tout du Premium",
        "50 GB de stockage photos",
        "Timelines collaboratives",
        "API d'accès",
        "Support dédié",
        "Fonctionnalités avancées",
      ],
      cta: "Contactez-nous",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LifeTimeline
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-white/50 transition-all">
              Connexion
            </button>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              S'inscrire
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            ✨ Nouvelle façon de raconter votre histoire
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Votre vie en une
            <br />
            chronologie interactive
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Capturez, organisez et revivez tous les moments qui comptent. Des
            vacances aux changements de carrière, gardez une trace de votre
            parcours unique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:w-80 px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
            />
            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center space-x-2 group">
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Aucune carte bancaire requise • 50 événements gratuits
          </p>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border border-gray-200">
            <div className="space-y-4">
              {/* Timeline preview mockup */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <div className="h-4 bg-blue-200 rounded w-48 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-purple-300 rounded-lg" />
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <div className="h-4 bg-purple-200 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-lg" />
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <div className="flex-1">
                  <div className="h-4 bg-pink-200 rounded w-56 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-28" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-orange-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-gray-600">
            Des outils puissants pour capturer votre histoire
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-blue-50/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Tarifs simples et transparents
          </h2>
          <p className="text-xl text-gray-600">
            Commencez gratuitement, évoluez quand vous êtes prêt
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-2xl shadow-lg border-2 ${
                plan.highlighted
                  ? "border-blue-500 scale-105 relative"
                  : "border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Le plus populaire
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/ {plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à commencer votre voyage ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers d'utilisateurs qui préservent leurs souvenirs
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl">
            Créer mon compte gratuitement
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-600">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">LifeTimeline</span>
          </div>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Fonctionnalités
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Tarifs
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Blog
            </a>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm mt-8">
          © 2025 LifeTimeline. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
