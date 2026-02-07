import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Wallet, Heart, Languages, GraduationCap, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Hubs() {
  const { translate } = useLanguage();

  const hubs = [
    {
      title: translate("Money Hub"),
      description: translate("Take control of your financial future with AI-powered money management tools"),
      icon: Wallet,
      href: "/hubs/money",
      gradient: "from-green-500 to-emerald-600",
      features: [
        translate("Budget Tracking"),
        translate("Debt Management"),
        translate("Financial Goals"),
        translate("Learn Finance")
      ]
    },
    {
      title: translate("Wellness Hub"),
      description: translate("Your personal wellness companion for mental health, fitness, and overall wellbeing"),
      icon: Heart,
      href: "/hubs/wellness",
      gradient: "from-pink-500 to-rose-600",
      features: [
        translate("Mental Health Support"),
        translate("Fitness Tracking"),
        translate("Meditation & Mindfulness"),
        translate("Wellness Insights")
      ]
    },
    {
      title: translate("Translation Hub"),
      description: translate("Break language barriers with real-time translation and language learning"),
      icon: Languages,
      href: "/hubs/translate",
      gradient: "from-blue-500 to-indigo-600",
      features: [
        translate("Real-time Translation"),
        translate("Voice Translation"),
        translate("Multi-language Support"),
        translate("Language Learning")
      ]
    },
    {
      title: translate("Learning Hub"),
      description: translate("Personalized learning experiences with AI-powered tutoring and curriculum"),
      icon: GraduationCap,
      href: "/hubs/learning",
      gradient: "from-purple-500 to-violet-600",
      features: [
        translate("Math Tutoring"),
        translate("Science Lab"),
        translate("Language Learning"),
        translate("Verified Learning")
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            {translate("Explore Our Hubs")}
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {translate("Discover specialized AI-powered tools and features designed to enhance every aspect of your life")}
          </p>
        </div>

        {/* Hubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <Link key={hub.href} href={hub.href}>
                <a className="group block h-full">
                  <div className="h-full bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${hub.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {hub.title}
                    </h2>
                    <p className="text-slate-400 mb-6">
                      {hub.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {hub.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:gap-4 transition-all">
                      {translate("Explore Hub")}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
