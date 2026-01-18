import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calculator, TrendingUp, Lightbulb, BookOpen, Brain, Sparkles, Search, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import modals from MathTutor
import { LessonModal, PracticeModal, QuizModal } from "./MathTutor";

export default function MathCurriculum() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState<{ name: string; category: string; mode: 'learn' | 'practice' | 'quiz' } | null>(null);

  // Get progress for Early Math category
  const { data: earlyMathProgress } = trpc.topic.getCategoryProgress.useQuery(
    { category: 'early-math' },
    { enabled: isAuthenticated }
  );

  const getTopicStatus = (topicName: string) => {
    if (!earlyMathProgress) return 'not-started';
    const progress = earlyMathProgress.find(p => p.topicName === topicName);
    return progress?.status || 'not-started';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'mastered':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">✓ Mastered</Badge>;
      case 'practicing':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">⚡ Practicing</Badge>;
      case 'learning':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">📖 Learning</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-400">Not Started</Badge>;
    }
  };

  const mathCategories = [
    {
      id: "early-math",
      title: "Early Math",
      subtitle: "Pre-K to Grade 2",
      icon: Sparkles,
      color: "from-pink-500 to-rose-500",
      gradeLevel: "Pre-K to Grade 2",
      topics: [
        "Counting and number recognition",
        "Comparing numbers (greater than, less than)",
        "Basic addition and subtraction (within 20)",
        "Shapes and basic geometry (2D and 3D shapes)",
        "Patterns and sorting",
        "Introduction to measurement (length, weight, volume)",
        "Telling time (hours, half-hours)",
        "Introduction to money (coins, bills, simple transactions)",
      ],
    },
    {
      id: "elementary",
      title: "Elementary Math",
      subtitle: "Grades 3-5",
      icon: Calculator,
      color: "from-blue-500 to-cyan-500",
      gradeLevel: "Grades 3-5",
      sections: [
        {
          name: "Arithmetic",
          topics: [
            "Multi-digit addition and subtraction",
            "Multiplication and division (up to 12×12)",
            "Fractions (basic concepts, equivalence, addition/subtraction)",
            "Decimals (place value, addition/subtraction)",
            "Word problems and problem-solving strategies",
          ],
        },
        {
          name: "Geometry & Measurement",
          topics: [
            "Area and perimeter",
            "Volume of simple shapes",
            "Angles (acute, obtuse, right)",
            "Symmetry and transformations (reflection, rotation)",
          ],
        },
        {
          name: "Data & Probability",
          topics: [
            "Reading and creating graphs (bar, line, pie)",
            "Mean, median, mode",
            "Basic probability concepts",
          ],
        },
      ],
    },
    {
      id: "middle-school",
      title: "Middle School Math",
      subtitle: "Grades 6-8",
      icon: Brain,
      color: "from-indigo-500 to-purple-500",
      gradeLevel: "Grades 6-8",
      sections: [
        {
          name: "Pre-Algebra",
          topics: [
            "Ratios and proportions",
            "Percentages and percent applications",
            "Integers and rational numbers",
            "Order of operations (PEMDAS/BODMAS)",
            "Exponents and square roots",
          ],
        },
        {
          name: "Algebra Foundations",
          topics: [
            "Variables and expressions",
            "Solving one-step and two-step equations",
            "Graphing on the coordinate plane",
            "Introduction to functions",
          ],
        },
        {
          name: "Geometry",
          topics: [
            "Pythagorean theorem",
            "Surface area and volume (prisms, cylinders, spheres)",
            "Circles (circumference, area)",
            "Similar and congruent figures",
          ],
        },
        {
          name: "Statistics & Probability",
          topics: [
            "Data analysis and interpretation",
            "Probability of compound events",
            "Scatter plots and trend lines",
          ],
        },
      ],
    },
    {
      id: "high-school",
      title: "High School Math",
      subtitle: "Grades 9-12",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      gradeLevel: "Grades 9-12",
      sections: [
        {
          name: "Algebra 1",
          topics: [
            "Linear equations and inequalities",
            "Systems of equations",
            "Quadratic equations and functions",
            "Polynomials (factoring, operations)",
            "Exponential functions",
          ],
        },
        {
          name: "Geometry",
          topics: [
            "Proofs (two-column, paragraph)",
            "Triangles (congruence, similarity, special right triangles)",
            "Trigonometry basics (sine, cosine, tangent)",
            "Circles (chords, tangents, arcs, sectors)",
            "3D geometry (polyhedra, surface area, volume)",
          ],
        },
        {
          name: "Algebra 2",
          topics: [
            "Complex numbers",
            "Rational expressions and equations",
            "Logarithmic and exponential functions",
            "Sequences and series",
            "Conic sections (parabolas, ellipses, hyperbolas)",
          ],
        },
        {
          name: "Pre-Calculus",
          topics: [
            "Advanced trigonometry (identities, equations, graphs)",
            "Polar coordinates and parametric equations",
            "Vectors and matrices",
            "Limits and continuity",
          ],
        },
        {
          name: "Calculus",
          topics: [
            "Derivatives (rules, applications)",
            "Integrals (definite, indefinite)",
            "Applications of calculus (optimization, related rates)",
            "Differential equations basics",
          ],
        },
        {
          name: "Statistics",
          topics: [
            "Descriptive statistics",
            "Probability distributions (normal, binomial)",
            "Hypothesis testing",
            "Confidence intervals",
            "Regression analysis",
          ],
        },
      ],
    },
    {
      id: "advanced",
      title: "Advanced Topics",
      subtitle: "College & Enrichment",
      icon: Lightbulb,
      color: "from-green-500 to-emerald-500",
      gradeLevel: "College",
      sections: [
        {
          name: "For Enrichment & Higher Ed Prep",
          topics: [
            "Discrete math (logic, sets, combinatorics)",
            "Linear algebra (vectors, matrices, linear transformations)",
            "Number theory basics",
            "Financial math (interest, loans, investments)",
            "Game theory basics",
            "Math puzzles and problem-solving strategies",
          ],
        },
        {
          name: "Applied Math",
          topics: [
            "Math for data science (statistics, visualizations)",
            "Math for programming (algorithms, complexity)",
            "Math for physics/engineering (vectors, calculus applications)",
          ],
        },
      ],
    },
    {
      id: "supplemental",
      title: "Supplemental Features",
      subtitle: "Resources & Exam Prep",
      icon: BookOpen,
      color: "from-yellow-500 to-amber-500",
      gradeLevel: "All Levels",
      topics: [
        "Math vocabulary / glossary",
        "Real-world applications (word problems, project-based learning)",
        "Math history (key mathematicians, discoveries)",
        "Exam prep (SAT, ACT, AP, GCSE, IB, etc.)",
        "Mental math & estimation techniques",
        "Common misconceptions & error analysis",
      ],
    },
  ];

  // Flatten all topics for filtering
  const allTopics = mathCategories.flatMap(category => {
    if ('topics' in category && Array.isArray(category.topics)) {
      return category.topics.map(topic => ({
        name: topic,
        category: category.id,
        categoryTitle: category.title,
        gradeLevel: category.gradeLevel,
        color: category.color,
      }));
    }
    if ('sections' in category && category.sections) {
      return category.sections.flatMap(section =>
        section.topics.map(topic => ({
          name: topic,
          category: category.id,
          categoryTitle: category.title,
          gradeLevel: category.gradeLevel,
          color: category.color,
          section: section.name,
        }))
      );
    }
    return [];
  });

  // Filter topics
  const filteredTopics = allTopics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesTopic = selectedTopicFilter === 'all' || topic.name === selectedTopicFilter;
    return matchesSearch && matchesCategory && matchesTopic;
  });

  const handleTopicAction = (topicName: string, category: string, mode: 'learn' | 'practice' | 'quiz') => {
    if (!isAuthenticated) {
      toast.error('Please sign in to access learning features');
      window.location.href = getLoginUrl();
      return;
    }

    // Only Early Math topics have full implementation
    if (category !== 'early-math') {
      toast.info('This feature is currently available for Early Math topics only');
      return;
    }

    setSelectedTopic({ name: topicName, category, mode });
  };

  const closeModal = () => {
    setSelectedTopic(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Navigation />
      
      <main className="flex-1 container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4">
            <Calculator className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">Complete Math Curriculum</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Math Learning Curriculum
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore 75+ topics from Pre-K through College level. Track your progress and master every concept.
          </p>
          <Link href="/math-tutor">
            <Button variant="outline" className="mt-6 border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
              ← Back to Math Tutor
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="early-math">Early Math</SelectItem>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="middle-school">Middle School</SelectItem>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="supplemental">Supplemental</SelectItem>
                </SelectContent>
              </Select>

              {/* Topic Filter */}
              <Select value={selectedTopicFilter} onValueChange={setSelectedTopicFilter}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Topics</SelectItem>
                  {allTopics.map((topic, idx) => (
                    <SelectItem key={idx} value={topic.name}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Showing {filteredTopics.length} of {allTopics.length} topics</span>
            </div>
          </CardContent>
        </Card>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic, idx) => {
            const status = topic.category === 'early-math' ? getTopicStatus(topic.name) : 'not-started';
            const isEarlyMath = topic.category === 'early-math';

            return (
              <Card key={idx} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className={`text-lg bg-gradient-to-r ${topic.color} bg-clip-text text-transparent`}>
                      {topic.name}
                    </CardTitle>
                    {isEarlyMath && getStatusBadge(status)}
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="text-gray-400">{topic.categoryTitle}</div>
                    {('section' in topic && topic.section) ? <div className="text-gray-500 text-sm">{topic.section as string}</div> : null}
                    <div className="text-gray-500 text-sm">{topic.gradeLevel}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTopicAction(topic.name, topic.category, 'learn')}
                      className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                      disabled={!isEarlyMath}
                    >
                      📖 Learn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTopicAction(topic.name, topic.category, 'practice')}
                      className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                      disabled={!isEarlyMath}
                    >
                      ✏️ Practice
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTopicAction(topic.name, topic.category, 'quiz')}
                      className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
                      disabled={!isEarlyMath}
                    >
                      ✅ Quiz
                    </Button>
                  </div>
                  {!isEarlyMath && (
                    <p className="text-xs text-gray-500 mt-2 text-center">Coming soon</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No topics found matching your filters.</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTopicFilter('all');
              }}
              variant="outline"
              className="mt-4 border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      {selectedTopic && selectedTopic.mode === 'learn' && (
        <LessonModal
          topicName={selectedTopic.name}
          category={selectedTopic.category}
          onClose={closeModal}
        />
      )}
      {selectedTopic && selectedTopic.mode === 'practice' && (
        <PracticeModal
          topicName={selectedTopic.name}
          category={selectedTopic.category}
          onClose={closeModal}
        />
      )}
      {selectedTopic && selectedTopic.mode === 'quiz' && (
        <QuizModal
          topicName={selectedTopic.name}
          category={selectedTopic.category}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
