import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calculator, CheckCircle2, Lightbulb, TrendingUp, XCircle, ChevronDown, ChevronRight, BookOpen, Brain, Sparkles, Trophy, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

interface Step {
  stepNumber: number;
  title: string;
  explanation: string;
  work: string;
  result: string;
}

interface Solution {
  steps: Step[];
  answer: string;
  explanation: string;
  commonMistakes: string[];
  relatedConcepts: string[];
}

function MathCurriculumSection() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{name: string, category: string} | null>(null);
  const [modalMode, setModalMode] = useState<'lesson' | 'practice' | 'quiz' | null>(null);
  const { isAuthenticated } = useAuth();
  const trpcUtils = trpc.useUtils();

  // Topic progress query
  const { data: categoryProgress } = trpc.topic.getCategoryProgress.useQuery(
    { category: 'early-math' },
    { enabled: isAuthenticated && expandedCategory === 'early-math' }
  );

  const getTopicStatus = (topicName: string) => {
    if (!categoryProgress) return 'not_started';
    const progress = categoryProgress.find(p => p.topicName === topicName);
    return progress?.status || 'not_started';
  };

  const handleTopicAction = (topicName: string, category: string, mode: 'lesson' | 'practice' | 'quiz') => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSelectedTopic({ name: topicName, category });
    setModalMode(mode);
  };

  const closeModal = () => {
    setSelectedTopic(null);
    setModalMode(null);
    // Refresh progress
    if (isAuthenticated) {
      trpcUtils.topic.getCategoryProgress.invalidate();
    }
  };

  const mathCategories = [
    {
      id: "early-math",
      title: "Early Math",
      subtitle: "Pre-K to Grade 2",
      icon: Sparkles,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
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
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      sections: [
        {
          name: "Arithmetic & Number Sense",
          topics: [
            "Multiplication and division facts",
            "Multi-digit arithmetic",
            "Fractions (concepts, equivalence, addition/subtraction)",
            "Decimals (basics, addition/subtraction)",
            "Place value (up to millions)",
            "Rounding and estimation",
            "Factors and multiples",
            "Prime and composite numbers",
          ],
        },
        {
          name: "Geometry",
          topics: [
            "Perimeter and area",
            "Angles and lines (parallel, perpendicular)",
            "Symmetry",
            "Coordinate plane introduction",
          ],
        },
        {
          name: "Measurement & Data",
          topics: [
            "Time (elapsed time, conversions)",
            "Money (making change, word problems)",
            "Units of measurement (metric and customary)",
            "Bar graphs, pictographs, line plots",
            "Introduction to mean, median, mode (basic)",
          ],
        },
      ],
    },
    {
      id: "middle-school",
      title: "Middle School",
      subtitle: "Grades 6-8",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      sections: [
        {
          name: "Pre-Algebra & Number Systems",
          topics: [
            "Negative numbers and integers",
            "Rational numbers (fractions, decimals, percentages)",
            "Ratios, rates, and proportions",
            "Exponents and square roots",
            "Scientific notation",
            "Order of operations (PEMDAS)",
          ],
        },
        {
          name: "Algebra Foundations",
          topics: [
            "Variables and expressions",
            "One-step and two-step equations",
            "Inequalities",
            "Graphing linear equations (slope, intercepts)",
            "Functions (basic concepts)",
          ],
        },
        {
          name: "Geometry",
          topics: [
            "Area and volume of 2D/3D shapes",
            "Pythagorean theorem",
            "Transformations (translation, rotation, reflection)",
            "Congruence and similarity",
            "Angles in polygons",
          ],
        },
        {
          name: "Probability & Statistics",
          topics: [
            "Probability (basic, compound events)",
            "Data displays (histograms, box plots, scatter plots)",
            "Measures of central tendency and spread",
          ],
        },
      ],
    },
    {
      id: "high-school",
      title: "High School",
      subtitle: "Algebra, Geometry, Calculus",
      icon: Trophy,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      sections: [
        {
          name: "Algebra 1",
          topics: [
            "Linear equations and inequalities",
            "Systems of equations",
            "Polynomials (operations, factoring)",
            "Quadratic equations and functions",
            "Exponential functions",
            "Radical expressions and equations",
          ],
        },
        {
          name: "Geometry",
          topics: [
            "Formal proofs",
            "Triangle theorems",
            "Circles (arcs, chords, sectors)",
            "Trigonometry basics (right triangles, sine/cosine/tangent)",
            "3D geometry (surface area, volume)",
          ],
        },
        {
          name: "Algebra 2 / Advanced Algebra",
          topics: [
            "Complex numbers",
            "Matrices and determinants",
            "Logarithms",
            "Sequences and series (arithmetic, geometric)",
            "Rational functions",
            "Conic sections",
          ],
        },
        {
          name: "Pre-Calculus",
          topics: [
            "Trigonometry (unit circle, identities, equations)",
            "Vectors",
            "Polar coordinates",
            "Limits and continuity (introduction)",
            "Introduction to derivatives (optional, as bridge to calculus)",
          ],
        },
        {
          name: "Calculus",
          topics: [
            "Limits and continuity",
            "Derivatives (rules, applications)",
            "Integrals (definite/indefinite, applications)",
            "Differential equations (basics)",
          ],
        },
        {
          name: "Statistics & Probability",
          topics: [
            "Probability distributions (binomial, normal)",
            "Sampling and experimental design",
            "Hypothesis testing",
            "Regression and correlation",
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
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
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
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="space-y-4">
      {mathCategories.map((category) => {
        const IconComponent = category.icon;
        const isExpanded = expandedCategory === category.id;

        return (
          <Card key={category.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-slate-700/30 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${category.bgColor} border ${category.borderColor}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className={`text-xl sm:text-2xl bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">{category.subtitle}</CardDescription>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-6 w-6 text-gray-400" />
                ) : (
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                {category.id === 'early-math' && 'topics' in category ? (
                  <ul className="grid grid-cols-1 gap-3">
                    {category.topics?.map((topic, idx) => {
                      const status = getTopicStatus(topic);
                      return (
                        <li
                          key={idx}
                          className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-pink-500/50 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              status === 'mastered' ? 'text-green-400' :
                              status === 'practicing' ? 'text-yellow-400' :
                              status === 'learning' ? 'text-blue-400' :
                              'text-gray-600'
                            }`} />
                            <div className="flex-1">
                              <span className="text-white font-medium">{topic}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  status === 'mastered' ? 'bg-green-500/20 text-green-400' :
                                  status === 'practicing' ? 'bg-yellow-500/20 text-yellow-400' :
                                  status === 'learning' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {status === 'not_started' ? 'Not Started' :
                                   status === 'learning' ? 'Learning' :
                                   status === 'practicing' ? 'Practicing' :
                                   'Mastered'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                              onClick={() => handleTopicAction(topic, 'early-math', 'lesson')}
                            >
                              📖 Learn
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                              onClick={() => handleTopicAction(topic, 'early-math', 'practice')}
                            >
                              ✏️ Practice
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                              onClick={() => handleTopicAction(topic, 'early-math', 'quiz')}
                            >
                              ✅ Quiz
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : "sections" in category && category.sections ? (
                  <div className="space-y-6">
                    {category.sections.map((section, idx) => (
                      <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                          {section.name}
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {section.topics.map((topic, topicIdx) => (
                            <li
                              key={topicIdx}
                              className="flex items-start gap-2 text-sm text-gray-300 p-2 hover:bg-slate-800/50 rounded transition-colors"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {category.topics.map((topic, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-300 p-3 bg-slate-900/50 rounded hover:bg-slate-800/50 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Modals for Learn/Practice/Quiz */}
      {selectedTopic && modalMode && (
        <TopicModal
          topicName={selectedTopic.name}
          category={selectedTopic.category}
          mode={modalMode}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// Topic Modal Component
function TopicModal({
  topicName,
  category,
  mode,
  onClose,
}: {
  topicName: string;
  category: string;
  mode: 'lesson' | 'practice' | 'quiz';
  onClose: () => void;
}) {
  if (mode === 'lesson') {
    return <LessonModal topicName={topicName} category={category} onClose={onClose} />;
  } else if (mode === 'practice') {
    return <PracticeModal topicName={topicName} category={category} onClose={onClose} />;
  } else {
    return <QuizModal topicName={topicName} category={category} onClose={onClose} />;
  }
}

// Lesson Modal
export function LessonModal({ topicName, category, onClose }: { topicName: string; category: string; onClose: () => void }) {
  const { data: lessonData, isLoading } = trpc.topic.getLessonContent.useQuery({ topicName, category });
  const completeLessonMutation = trpc.topic.completeLesson.useMutation({
    onSuccess: () => {
      toast.success('Lesson completed! Ready for practice! 🎉');
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-800 border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-blue-400 flex items-center gap-2">
            📖 {topicName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : lessonData ? (
          <div className="space-y-6 text-white">
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-2">{lessonData.title}</h3>
              <p className="text-gray-300">{lessonData.introduction}</p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">📚 Explanation</h4>
              <p className="text-gray-300">{lessonData.explanation}</p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">💡 Examples</h4>
              <div className="space-y-3">
                {lessonData.examples.map((ex: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <h5 className="font-medium text-blue-400 mb-1">{ex.title}</h5>
                    <p className="text-sm text-gray-300 mb-2">{ex.description}</p>
                    <p className="text-xs text-gray-400 italic">{ex.visual}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">🌍 Real-World Uses</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {lessonData.realWorldApplications.map((app: string, idx: number) => (
                  <li key={idx}>{app}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">🎉 Fun Facts</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {lessonData.funFacts.map((fact: string, idx: number) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">⚠️ Common Mistakes</h4>
              <ul className="list-disc list-inside space-y-1 text-orange-300">
                {lessonData.commonMistakes.map((mistake: string, idx: number) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-lg text-green-400 mb-2">✅ Key Takeaways</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {lessonData.keyTakeaways.map((takeaway: string, idx: number) => (
                  <li key={idx}>{takeaway}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => completeLessonMutation.mutate({ topicName, category })}
                disabled={completeLessonMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {completeLessonMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Completing...</>
                ) : (
                  '✅ Mark as Complete'
                )}
              </Button>
              <Button onClick={onClose} variant="outline" className="border-slate-600">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Failed to load lesson content.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Practice Modal (Full Implementation)
export function PracticeModal({ topicName, category, onClose }: { topicName: string; category: string; onClose: () => void }) {
  const [problems, setProblems] = useState<any[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [sessionComplete, setSessionComplete] = useState(false);

  const generateProblemsMutation = trpc.topic.generatePracticeProblems.useMutation();
  const submitAnswerMutation = trpc.topic.submitPracticeAnswer.useMutation();
  const completeSessionMutation = trpc.topic.completePracticeSession.useMutation();

  // Generate problems on mount
  useEffect(() => {
    generateProblemsMutation.mutate(
      { topicName, category, count: 10 },
      {
        onSuccess: (data) => {
          setProblems(data.problems);
        },
        onError: () => {
          toast.error('Failed to generate practice problems');
          onClose();
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentProblem = problems[currentProblemIndex];
  const isLastProblem = currentProblemIndex === problems.length - 1;

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    submitAnswerMutation.mutate(
      {
        topicName,
        category,
        question: currentProblem.question,
        userAnswer: userAnswer.trim(),
        correctAnswer: currentProblem.answer,
        usedHint: showHint,
      },
      {
        onSuccess: (data) => {
          setFeedback({
            isCorrect: data.isCorrect,
            message: data.feedback,
          });
          if (data.isCorrect) {
            setCorrectCount(correctCount + 1);
          }
        },
      }
    );
  };

  const handleNextProblem = () => {
    if (isLastProblem) {
      // Complete session
      const duration = Math.floor((Date.now() - startTime) / 1000);
      completeSessionMutation.mutate(
        {
          topicName,
          category,
          problemsSolved: problems.length,
          problemsCorrect: correctCount,
          hintsUsed,
          duration,
        },
        {
          onSuccess: (data) => {
            setSessionComplete(true);
          },
        }
      );
    } else {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setUserAnswer('');
      setShowHint(false);
      setFeedback(null);
    }
  };

  const handleShowHint = () => {
    if (!showHint) {
      setHintsUsed(hintsUsed + 1);
    }
    setShowHint(true);
  };

  if (generateProblemsMutation.isPending) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-400">✏️ Practice: {topicName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
            <p className="text-gray-300">Generating practice problems...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (sessionComplete) {
    const accuracy = Math.round((correctCount / problems.length) * 100);
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-400">🎉 Practice Complete!</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-purple-400 mb-2">{accuracy}%</div>
              <p className="text-gray-300">Accuracy</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{correctCount}</div>
                <p className="text-sm text-gray-400">Correct</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{problems.length - correctCount}</div>
                <p className="text-sm text-gray-400">Incorrect</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{hintsUsed}</div>
                <p className="text-sm text-gray-400">Hints Used</p>
              </div>
            </div>

            <div className="text-center text-gray-300">
              <p>Time: {minutes}m {seconds}s</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-300 text-center">
                {completeSessionMutation.data?.message || 'Great practice session!'}
              </p>
            </div>

            <Button onClick={onClose} className="w-full bg-purple-500 hover:bg-purple-600">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentProblem) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-400 flex items-center justify-between">
            <span>✏️ Practice: {topicName}</span>
            <span className="text-sm text-gray-400">
              Problem {currentProblemIndex + 1} of {problems.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentProblemIndex + 1) / problems.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
            <p className="text-lg text-white leading-relaxed">{currentProblem.question}</p>
          </div>

          {/* Answer Input */}
          {!feedback && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Answer:</label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Type your answer here..."
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={submitAnswerMutation.isPending}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  {submitAnswerMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
                <Button
                  onClick={handleShowHint}
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                >
                  💡 {showHint ? 'Hint' : 'Show Hint'}
                </Button>
              </div>
            </div>
          )}

          {/* Hint */}
          {showHint && !feedback && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-400 mb-1">💡 Hint:</p>
              <p className="text-blue-300">{currentProblem.hint}</p>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-4 border ${
                  feedback.isCorrect
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-orange-500/10 border-orange-500/30'
                }`}
              >
                <p
                  className={`font-semibold mb-2 ${
                    feedback.isCorrect ? 'text-green-400' : 'text-orange-400'
                  }`}
                >
                  {feedback.isCorrect ? '✅ Correct!' : '❌ Not Quite'}
                </p>
                <p className="text-gray-300">{feedback.message}</p>
              </div>

              {/* Explanation */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-400 mb-1">📚 Explanation:</p>
                <p className="text-gray-300">{currentProblem.explanation}</p>
                {!feedback.isCorrect && (
                  <p className="text-green-400 mt-2">Correct answer: {currentProblem.answer}</p>
                )}
              </div>

              <Button
                onClick={handleNextProblem}
                disabled={completeSessionMutation.isPending}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                {completeSessionMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Completing...</>
                ) : isLastProblem ? (
                  'Complete Practice Session'
                ) : (
                  'Next Problem →'
                )}
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-between text-sm text-gray-400 pt-2 border-t border-slate-700">
            <span>Correct: {correctCount}/{currentProblemIndex + (feedback ? 1 : 0)}</span>
            <span>Hints Used: {hintsUsed}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quiz Modal (Simplified)
export function QuizModal({ topicName, category, onClose }: { topicName: string; category: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-green-400">✅ Quiz: {topicName}</DialogTitle>
        </DialogHeader>
        <div className="text-center py-12">
          <p className="text-gray-300 mb-4">Quiz mode coming soon! This will include:</p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-400">
            <li>• 10 multiple-choice questions</li>
            <li>• Timed assessment</li>
            <li>• Detailed score breakdown</li>
            <li>• Mastery level calculation</li>
          </ul>
          <Button onClick={onClose} className="mt-6 bg-green-500 hover:bg-green-600">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MathTutor() {
  const { user, loading, isAuthenticated } = useAuth();
  const [problemText, setProblemText] = useState("");
  const [topic, setTopic] = useState("");
  const [solution, setSolution] = useState<Solution | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"beginner" | "intermediate" | "advanced" | "all">("all");
  const [showPracticeLibrary, setShowPracticeLibrary] = useState(false);

  const solveMutation = trpc.math.solveProblem.useMutation({
    onSuccess: (data) => {
      setSolution(data as Solution);
      setCheckResult(null);
      toast.success("Problem solved! Check out the step-by-step solution below.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to solve problem");
    },
  });

  const submitAnswerMutation = trpc.math.submitAnswer.useMutation({
    onSuccess: (data) => {
      setCheckResult(data);
      if (data.isCorrect) {
        toast.success("Correct! " + data.feedback);
      } else {
        toast.error("Not quite right. " + data.feedback);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check answer");
    },
  });

  const progressQuery = trpc.math.getProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const solutionHistoryQuery = trpc.math.getSolutionHistory.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  const practiceProblemsQuery = trpc.math.getPracticeProblems.useQuery(
    {
      topic: selectedTopic === "all" ? undefined : selectedTopic,
      difficulty: selectedDifficulty === "all" ? undefined : (selectedDifficulty as "beginner" | "intermediate" | "advanced"),
      limit: 20,
    },
    { enabled: isAuthenticated && showPracticeLibrary }
  );

  const handleSolveProblem = () => {
    if (!problemText.trim()) {
      toast.error("Please enter a math problem");
      return;
    }

    solveMutation.mutate({
      problemText: problemText.trim(),
      topic: topic || undefined,
    });
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    submitAnswerMutation.mutate({
      problemText: problemText.trim(),
      userAnswer: userAnswer.trim(),
    });
  };

  const handleNewProblem = () => {
    setProblemText("");
    setTopic("");
    setUserAnswer("");
    setSolution(null);
    setCheckResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to access the Math Tutor</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4" style={{ height: "70px" }}>
            🧮 Math Tutor
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Step-by-step problem solving with SASS-E's guidance
          </p>
        </div>

        {/* Progress Stats */}
        {progressQuery.data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                  {progressQuery.data.totalProblemsAttempted}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Problems Attempted</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-green-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-green-400">
                  {progressQuery.data.totalProblemsSolved}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Problems Solved</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {progressQuery.data.currentStreak}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Day Streak</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-pink-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-pink-400">
                  {JSON.parse(progressQuery.data.topicsExplored || "[]").length}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Topics Explored</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Problem Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calculator className="h-5 w-5" />
                  Enter Your Math Problem
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Type any math problem and SASS-E will solve it step-by-step
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problem" className="text-white">Math Problem</Label>
                  <Textarea
                    id="problem"
                    placeholder="e.g., Solve for x: 2x + 5 = 13"
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    className="min-h-[100px] bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-white">Topic (Optional)</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="algebra">Algebra</SelectItem>
                      <SelectItem value="calculus">Calculus</SelectItem>
                      <SelectItem value="geometry">Geometry</SelectItem>
                      <SelectItem value="trigonometry">Trigonometry</SelectItem>
                      <SelectItem value="statistics">Statistics</SelectItem>
                      <SelectItem value="arithmetic">Arithmetic</SelectItem>
                      <SelectItem value="linear_algebra">Linear Algebra</SelectItem>
                      <SelectItem value="differential_equations">Differential Equations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSolveProblem}
                    disabled={solveMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {solveMutation.isPending ? "Solving..." : "Solve Problem"}
                  </Button>
                  <Button
                    onClick={() => setShowPracticeLibrary(!showPracticeLibrary)}
                    variant="outline"
                    className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-900/30"
                  >
                    {showPracticeLibrary ? "Hide Library" : "Practice Library"}
                  </Button>
                  <Button
                    onClick={handleNewProblem}
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                  >
                    New Problem
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Practice Library */}
            {showPracticeLibrary && (
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    📚 Practice Problem Library
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Browse curated problems by topic and difficulty
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="filterTopic" className="text-white">Filter by Topic</Label>
                      <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                          <SelectValue placeholder="All topics" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Topics</SelectItem>
                          <SelectItem value="algebra">Algebra</SelectItem>
                          <SelectItem value="calculus">Calculus</SelectItem>
                          <SelectItem value="geometry">Geometry</SelectItem>
                          <SelectItem value="trigonometry">Trigonometry</SelectItem>
                          <SelectItem value="statistics">Statistics</SelectItem>
                          <SelectItem value="arithmetic">Arithmetic</SelectItem>
                          <SelectItem value="linear_algebra">Linear Algebra</SelectItem>
                          <SelectItem value="differential_equations">Differential Equations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterDifficulty" className="text-white">Filter by Difficulty</Label>
                      <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as any)}>
                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                          <SelectValue placeholder="All difficulties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Difficulties</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Problem List */}
                  {practiceProblemsQuery.isLoading ? (
                    <p className="text-gray-400 text-sm">Loading problems...</p>
                  ) : practiceProblemsQuery.data && practiceProblemsQuery.data.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {practiceProblemsQuery.data.map((problem) => (
                        <div
                          key={problem.id}
                          className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setProblemText(problem.problemText);
                            setTopic(problem.topic);
                            setShowPracticeLibrary(false);
                            setSolution(null);
                            setCheckResult(null);
                            toast.success("Problem loaded! Click 'Solve Problem' to see the solution.");
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-white text-sm font-medium flex-1">
                              {problem.problemText}
                            </p>
                            <div className="flex gap-1 flex-shrink-0">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                problem.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400 border border-green-500/50' :
                                problem.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                                'bg-red-900/30 text-red-400 border border-red-500/50'
                              }`}>
                                {problem.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-blue-400 capitalize">
                              {problem.topic.replace('_', ' ')}
                            </span>
                            {problem.subtopic && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-500 capitalize">
                                  {problem.subtopic.replace('_', ' ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No problems found. Try different filters.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Solution Display */}
            {solution && (
              <Card className="bg-slate-800/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    Step-by-Step Solution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Steps */}
                  {solution.steps.map((step) => (
                    <div key={step.stepNumber} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-white">{step.title}</h4>
                          <p className="text-gray-300 text-sm">{step.explanation}</p>
                          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            <code className="text-purple-300 font-mono text-sm">{step.work}</code>
                          </div>
                          <p className="text-green-400 font-medium">→ {step.result}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Final Answer */}
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <h4 className="font-bold text-white">Final Answer</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{solution.answer}</p>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      Concept Explanation
                    </h4>
                    <p className="text-gray-300 text-sm">{solution.explanation}</p>
                  </div>

                  {/* Common Mistakes */}
                  {solution.commonMistakes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-400" />
                        Common Mistakes to Avoid
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                        {solution.commonMistakes.map((mistake, idx) => (
                          <li key={idx}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Concepts */}
                  {solution.relatedConcepts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        Related Concepts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {solution.relatedConcepts.map((concept, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-900/30 border border-blue-500/50 rounded-full text-blue-300 text-sm"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Answer Check */}
                  <div className="space-y-3 pt-4 border-t border-slate-700">
                    <Label htmlFor="userAnswer" className="text-white">Try solving it yourself!</Label>
                    <div className="flex gap-2">
                      <Input
                        id="userAnswer"
                        placeholder="Enter your answer"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white"
                      />
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={submitAnswerMutation.isPending}
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-800"
                      >
                        Check
                      </Button>
                    </div>

                    {checkResult && (
                      <div
                        className={`p-4 rounded-lg border ${
                          checkResult.isCorrect
                            ? "bg-green-900/30 border-green-500/50"
                            : "bg-red-900/30 border-red-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {checkResult.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <h4 className="font-bold text-white">
                            {checkResult.isCorrect ? "Correct!" : "Not Quite"}
                          </h4>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{checkResult.feedback}</p>
                        {!checkResult.isCorrect && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">
                              Correct answer: <span className="text-green-400 font-bold">{checkResult.correctAnswer}</span>
                            </p>
                            <p className="text-sm text-gray-300">{checkResult.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Solutions Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Solutions</CardTitle>
                <CardDescription className="text-gray-400">Your last 10 problems</CardDescription>
              </CardHeader>
              <CardContent>
                {solutionHistoryQuery.isLoading ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : solutionHistoryQuery.data && solutionHistoryQuery.data.length > 0 ? (
                  <div className="space-y-3">
                    {solutionHistoryQuery.data.map((sol) => (
                      <div
                        key={sol.id}
                        className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setProblemText(sol.problemText);
                          setUserAnswer(sol.userAnswer || "");
                        }}
                      >
                        <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                          {sol.problemText}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          {sol.isCorrect === 1 && (
                            <span className="text-green-400">✓ Correct</span>
                          )}
                          {sol.isCorrect === 0 && (
                            <span className="text-red-400">✗ Incorrect</span>
                          )}
                          <span className="text-gray-500">
                            {new Date(sol.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No solutions yet. Start solving!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Browse Curriculum CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                  Explore Full Math Curriculum
                </span>
              </h2>
              <p className="text-gray-300 mb-6">
                Browse 75+ topics from Pre-K through College level. Track your progress across all categories.
              </p>
              <Link href="/math-curriculum">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Complete Curriculum
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
