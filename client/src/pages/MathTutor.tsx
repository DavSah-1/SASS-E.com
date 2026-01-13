import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calculator, CheckCircle2, Lightbulb, TrendingUp, XCircle } from "lucide-react";
import { useState } from "react";
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
      </div>
      <Footer />
    </div>
  );
}
