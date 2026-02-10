import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  BookOpen,
  Microscope,
  Globe,
  TrendingUp,
  Code,
  Palette,
  Heart,
  Briefcase,
  Brain,
  Languages,
  Calculator,
  Atom,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function SpecializedLearning() {
  const { isAuthenticated } = useAuth();

  const learningPaths = [
    {
      category: "Business & Finance",
      emoji: "📊",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      paths: [
        { title: "Accounting", topics: ["Financial Statements", "Auditing", "Tax"], icon: Calculator },
        { title: "Marketing", topics: ["Digital Marketing", "SEO", "Brand Strategy"], icon: TrendingUp },
        { title: "Finance", topics: ["Investment", "Risk Management", "Corporate Finance"], icon: Briefcase },
        { title: "Entrepreneurship", topics: ["Startup Strategy", "Funding", "Growth Hacking"], icon: Star },
      ],
    },
    {
      category: "Technology",
      emoji: "💻",
      icon: Code,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      paths: [
        { title: "Programming", topics: ["Python", "JavaScript", "Data Structures"], icon: Code },
        { title: "Web Development", topics: ["HTML/CSS", "React", "Backend APIs"], icon: Globe },
        { title: "Data Science", topics: ["Machine Learning", "Statistics", "Visualization"], icon: TrendingUp },
        { title: "Cybersecurity", topics: ["Network Security", "Cryptography", "Ethical Hacking"], icon: Microscope },
      ],
    },
    {
      category: "Humanities",
      emoji: "📚",
      icon: BookOpen,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      paths: [
        { title: "History", topics: ["World History", "Ancient Civilizations", "Modern Era"], icon: BookOpen },
        { title: "Literature", topics: ["Classic Literature", "Poetry", "Literary Analysis"], icon: BookOpen },
        { title: "Philosophy", topics: ["Ethics", "Logic", "Metaphysics"], icon: Brain },
        { title: "Psychology", topics: ["Cognitive Psychology", "Social Psychology", "Development"], icon: Heart },
      ],
    },
    {
      category: "Creative Arts",
      emoji: "🎨",
      icon: Palette,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
      paths: [
        { title: "Visual Arts", topics: ["Drawing", "Painting", "Digital Art"], icon: Palette },
        { title: "Music Theory", topics: ["Harmony", "Composition", "Ear Training"], icon: Star },
        { title: "Creative Writing", topics: ["Fiction", "Poetry", "Screenwriting"], icon: BookOpen },
        { title: "Design", topics: ["UI/UX", "Graphic Design", "Typography"], icon: Palette },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="container mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
            <span className="text-purple-400 font-semibold text-sm">SPECIALIZED LEARNING PATHS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-6xl md:text-7xl">🎯</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
              Specialized Learning
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Deep-dive into curated learning paths across multiple disciplines with AI-powered guidance and structured curricula
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-6 text-lg">
              <a href={getLoginUrl()}>
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          )}
        </div>

        {/* Featured Learning Paths */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">🎯 Featured Learning Experiences</h2>
          <p className="text-slate-300 mb-8 text-center max-w-2xl mx-auto">Interactive learning with structured lessons and hands-on practice</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Learn Finance Card */}
            <a
              href="/hubs/learning/finance"
              className="block p-6 bg-gradient-to-br from-yellow-900/40 to-orange-900/40 hover:from-yellow-800/50 hover:to-orange-800/50 border-2 border-yellow-500/30 hover:border-yellow-400/60 rounded-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">💰</div>
                <ArrowRight className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-200 mb-3 group-hover:text-yellow-100">Learn Finance</h3>
              <p className="text-sm text-slate-300 mb-4">Master personal finance with practical lessons on budgeting, investing, and building wealth for everyday life</p>
              <div className="flex items-center text-sm text-yellow-400 font-semibold">
                <span>Start Learning</span>
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </a>

            {/* Math Tutor Card */}
            <a
              href="/hubs/learning/math"
              className="block p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 hover:from-blue-800/50 hover:to-cyan-800/50 border-2 border-blue-500/30 hover:border-blue-400/60 rounded-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">🧮</div>
                <ArrowRight className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-blue-200 mb-3 group-hover:text-blue-100">Math Tutor</h3>
              <p className="text-sm text-slate-300 mb-4">Step-by-step problem solving with detailed explanations across all math topics</p>
              <div className="flex items-center text-sm text-blue-400 font-semibold">
                <span>Start Solving</span>
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </a>

            {/* Language Learning Card */}
            <a
              href="/hubs/learning/language"
              className="block p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 hover:from-purple-800/50 hover:to-pink-800/50 border-2 border-purple-500/30 hover:border-purple-400/60 rounded-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">🌍</div>
                <ArrowRight className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-purple-200 mb-3 group-hover:text-purple-100">Language Learning</h3>
              <p className="text-sm text-slate-300 mb-4">Master new languages with interactive conversations, vocabulary practice, and cultural insights</p>
              <div className="flex items-center text-sm text-purple-400 font-semibold">
                <span>Start Learning</span>
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </a>

            {/* Science Lab Card */}
            <a
              href="/hubs/learning/science"
              className="block p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 hover:from-green-800/50 hover:to-emerald-800/50 border-2 border-green-500/30 hover:border-green-400/60 rounded-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">🧪</div>
                <ArrowRight className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-green-200 mb-3 group-hover:text-green-100">Science Lab</h3>
              <p className="text-sm text-slate-300 mb-4">Virtual experiments in physics, chemistry, and biology with step-by-step procedures and AI feedback</p>
              <div className="flex items-center text-sm text-green-400 font-semibold">
                <span>Start Experimenting</span>
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </a>
          </div>
        </div>

        {/* Learning Path Categories */}
        <div className="space-y-16">
          {learningPaths.map((category, idx) => (
            <div key={idx} className="relative">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-xl ${category.bgColor} border ${category.borderColor}`}>
                  <span className="text-5xl">{category.emoji}</span>
                </div>
                <div>
                  <h2 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.category}
                  </h2>
                  <p className="text-slate-400 mt-1">Explore {category.paths.length} specialized learning paths</p>
                </div>
              </div>

              {/* Learning Paths Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.paths.map((path, pathIdx) => {
                  const IconComponent = path.icon;
                  return (
                    <Card key={pathIdx} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <IconComponent className="h-8 w-8 text-purple-400" />
                          <Badge variant="outline" className="text-xs">
                            {path.topics.length} Topics
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-white">{path.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {path.topics.map((topic, topicIdx) => (
                            <li key={topicIdx} className="flex items-start gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                          disabled={!isAuthenticated}
                        >
                          {isAuthenticated ? "Start Learning" : "Sign In to Start"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl text-white">Ready to Master New Skills?</CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Join thousands of learners advancing their knowledge with AI-powered education
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 text-lg">
                  <a href={getLoginUrl()}>
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
