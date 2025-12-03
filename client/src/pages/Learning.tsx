import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { usePWA } from "@/hooks/usePWA";
import { trpc } from "@/lib/trpc";
import { BookOpen, CheckCircle2, XCircle, AlertCircle, HelpCircle, ExternalLink, Menu, X, Home as HomeIcon, Mic, Lightbulb, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function Learning() {
  const { user, isAuthenticated, loading } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [currentExplanation, setCurrentExplanation] = useState<any>(null);
  const [currentStudyGuide, setCurrentStudyGuide] = useState<any>(null);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  const explainMutation = trpc.learning.explainWithFactCheck.useMutation();
  const studyGuideMutation = trpc.learning.generateStudyGuide.useMutation();
  const quizMutation = trpc.learning.generateQuiz.useMutation();
  const submitQuizMutation = trpc.learning.submitQuizAttempt.useMutation();
  
  const { data: history } = trpc.learning.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleExplain = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      const result = await explainMutation.mutateAsync({
        topic: topic.trim() || question.trim(),
        question: question.trim(),
      });

      setCurrentExplanation(result);
      setCurrentStudyGuide(null);
      setCurrentQuiz(null);
      setQuizResults(null);
      toast.success("Explanation generated with fact-checking!");
    } catch (error) {
      toast.error("Failed to generate explanation");
      console.error(error);
    }
  };

  const handleGenerateStudyGuide = async (sessionId: number) => {
    try {
      const result = await studyGuideMutation.mutateAsync({ sessionId });
      setCurrentStudyGuide(result);
      toast.success("Study guide generated!");
    } catch (error) {
      toast.error("Failed to generate study guide");
      console.error(error);
    }
  };

  const handleGenerateQuiz = async (sessionId: number) => {
    try {
      const result = await quizMutation.mutateAsync({ 
        sessionId,
        questionCount: 5 
      });
      setCurrentQuiz(result);
      setQuizAnswers([]);
      setQuizCompleted(false);
      setQuizResults(null);
      toast.success("Quiz generated!");
    } catch (error) {
      toast.error("Failed to generate quiz");
      console.error(error);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    try {
      const result = await submitQuizMutation.mutateAsync({
        quizId: currentQuiz.quizId,
        answers: quizAnswers,
      });
      setQuizResults(result);
      setQuizCompleted(true);
      toast.success(`Quiz completed! Score: ${result.score}%`);
    } catch (error) {
      toast.error("Failed to submit quiz");
      console.error(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "disputed":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "debunked":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-500";
      case "disputed":
        return "text-yellow-500";
      case "debunked":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to use the Verified Learning Assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center" style={{paddingTop: '0px', paddingBottom: '0px', height: '65px'}}>
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {APP_TITLE}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <HomeIcon className="h-5 w-5" />
              Home
            </a>
            <a
              href="/assistant"
              className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <Mic className="h-5 w-5" />
              Voice Assistant
            </a>
            <a
              href="/learning"
              className="text-purple-400 font-semibold flex items-center gap-2"
            >
              <BookOpen className="h-5 w-5" />
              Learning
            </a>
            <a
              href="/devices"
              className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <Lightbulb className="h-5 w-5" />
              IoT Devices
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-300 hover:text-purple-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <span className="text-sm text-slate-300">
                Welcome, {user.name || "User"}
              </span>
            )}
            {isInstallable && !isInstalled && (
              <Button variant="outline" size="sm" onClick={installApp}>
                Install App
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-500/20 bg-slate-900/95 backdrop-blur">
            <div className="container mx-auto px-6 py-4 space-y-3">
              <a
                href="/"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </a>
              <a
                href="/assistant"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mic className="h-5 w-5" />
                <span>Voice Assistant</span>
              </a>
              <a
                href="/learning"
                className="flex items-center gap-3 text-purple-400 font-semibold py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-5 w-5" />
                <span>Learning</span>
              </a>
              <a
                href="/devices"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Lightbulb className="h-5 w-5" />
                <span>IoT Devices</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Verified Learning Assistant
            </h1>
            <p className="text-base sm:text-lg text-slate-300">
              Learn with confidence. Every fact checked, every source verified.
            </p>
          </div>

          {/* Ask Question Card */}
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-center">Ask Me Anything</CardTitle>
              <CardDescription className="text-center">
                I'll explain it with my signature wit and verify every claim.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Physics, History, Biology..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-slate-900/50 border-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Your Question</Label>
                <Input
                  id="question"
                  placeholder="e.g., How does photosynthesis work?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !explainMutation.isPending) {
                      handleExplain();
                    }
                  }}
                  className="bg-slate-900/50 border-purple-500/20"
                />
              </div>

              <Button
                onClick={handleExplain}
                disabled={explainMutation.isPending || !question.trim()}
                className="w-full"
              >
                {explainMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Explanation...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Explain & Verify
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Explanation Result */}
          {currentExplanation && (
            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bob's Explanation</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Overall Confidence:</span>
                    <span className={`text-2xl font-bold ${getConfidenceColor(currentExplanation.confidenceScore)}`}>
                      {currentExplanation.confidenceScore}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Explanation Text */}
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {currentExplanation.explanation}
                  </p>
                </div>

                {/* Fact Check Results */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6" />
                    Fact Verification
                  </h3>

                  {currentExplanation.factChecks.map((factCheck: any, index: number) => (
                    <Card key={index} className="border-purple-500/10 bg-slate-900/30">
                      <CardContent className="pt-6 space-y-3">
                        {/* Claim */}
                        <div className="flex items-start gap-3">
                          {getStatusIcon(factCheck.status)}
                          <div className="flex-1">
                            <p className="text-slate-200 font-medium">{factCheck.claim}</p>
                          </div>
                        </div>

                        {/* Status and Confidence */}
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`font-semibold uppercase ${getStatusColor(factCheck.status)}`}>
                            {factCheck.status}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className={`font-semibold ${getConfidenceColor(factCheck.confidence)}`}>
                            {factCheck.confidence}% Confidence
                          </span>
                        </div>

                        {/* Explanation */}
                        <p className="text-sm text-slate-400">{factCheck.explanation}</p>

                        {/* Sources */}
                        {factCheck.sources.length > 0 && (
                          <div className="pt-3 border-t border-purple-500/10">
                            <p className="text-xs text-slate-500 mb-2">Sources:</p>
                            <div className="space-y-1">
                              {factCheck.sources.map((source: any, sourceIndex: number) => (
                                <a
                                  key={sourceIndex}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="truncate">{source.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-purple-400">Verified with {currentExplanation.sourcesCount} sources</span>
                    {" • "}
                    All claims have been fact-checked using web search and credible sources
                  </p>
                </div>

                {/* Study Guide & Quiz Actions */}
                <div className="flex gap-4 pt-4 border-t border-purple-500/10">
                  <Button
                    onClick={() => handleGenerateStudyGuide(currentExplanation.sessionId)}
                    disabled={studyGuideMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {studyGuideMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Generate Study Guide
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleGenerateQuiz(currentExplanation.sessionId)}
                    disabled={quizMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {quizMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Study Guide Display */}
          {currentStudyGuide && (
            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Study Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Concepts */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Key Concepts</h3>
                  <ul className="space-y-2">
                    {currentStudyGuide.keyConcepts.map((concept: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-slate-200">
                        <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Terms & Definitions */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Important Terms</h3>
                  <div className="space-y-3">
                    {currentStudyGuide.terms.map((term: any, index: number) => (
                      <div key={index} className="p-3 bg-slate-900/50 rounded-lg">
                        <p className="font-semibold text-purple-300 mb-1">{term.term}</p>
                        <p className="text-sm text-slate-300">{term.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Summary</h3>
                  <p className="text-slate-200 leading-relaxed">{currentStudyGuide.summary}</p>
                </div>

                {/* Study Tips */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Study Tips</h3>
                  <ul className="space-y-2">
                    {currentStudyGuide.studyTips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-slate-200">
                        <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz Display */}
          {currentQuiz && !quizCompleted && (
            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Quiz Time!</CardTitle>
                <CardDescription>
                  Test your knowledge. Answer all questions and submit to see your score.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentQuiz.questions.map((q: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <p className="font-semibold text-slate-200">
                      {index + 1}. {q.question}
                    </p>
                    <div className="space-y-2 pl-4">
                      {q.options.map((option: string, optIndex: number) => (
                        <label
                          key={optIndex}
                          className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={optIndex}
                            checked={quizAnswers[index] === optIndex}
                            onChange={() => handleQuizAnswer(index, optIndex)}
                            className="w-4 h-4 text-purple-500"
                          />
                          <span className="text-slate-300">{String.fromCharCode(65 + optIndex)}. {option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleSubmitQuiz}
                  disabled={quizAnswers.length !== currentQuiz.questions.length || submitQuizMutation.isPending}
                  className="w-full"
                >
                  {submitQuizMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quiz Results */}
          {quizResults && (
            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    {quizResults.score}%
                  </div>
                  <p className="text-xl text-slate-300">
                    {quizResults.correctAnswers} out of {quizResults.totalQuestions} correct
                  </p>
                  <p className="text-lg font-semibold">
                    {quizResults.passed ? (
                      <span className="text-green-400">✓ Passed!</span>
                    ) : (
                      <span className="text-yellow-400">Keep studying!</span>
                    )}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setQuizResults(null);
                    setQuizCompleted(false);
                    setCurrentQuiz(null);
                    setQuizAnswers([]);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Another Quiz
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Learning History */}
          {history && history.length > 0 && (
            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Learning History</CardTitle>
                <CardDescription>Your recent learning sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {history.map((session: any) => (
                      <div
                        key={session.id}
                        className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
                        onClick={() => {
                          setTopic(session.topic);
                          setQuestion(session.question);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-200">{session.question}</p>
                            <p className="text-sm text-slate-400 mt-1">{session.topic}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${getConfidenceColor(session.confidenceScore)}`}>
                              {session.confidenceScore}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(session.createdAt).toLocaleDateString()} • {session.sourcesCount} sources
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

