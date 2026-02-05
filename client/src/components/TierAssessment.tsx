import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Loader2, Lock } from "lucide-react";

interface TierAssessmentProps {
  tierId: number;
}

export default function TierAssessment({ tierId }: TierAssessmentProps) {
  const { isAuthenticated } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Check if user has passed all tier quizzes (required to unlock assessment)
  const { data: allQuizzesPassed, isLoading: checkingQuizzes } = trpc.learnFinance.hasPassedAllTierQuizzes.useQuery(
    { tierId },
    { enabled: isAuthenticated && !!tierId }
  );

  // Fetch assessment data
  const { data: assessmentData, isLoading } = trpc.learnFinance.getTierAssessment.useQuery(
    { tierId },
    { enabled: !!tierId }
  );

  // Submit assessment attempt mutation
  const submitAssessmentMutation = trpc.learnFinance.submitTierAssessmentAttempt.useMutation();

  // Initialize selected answers when assessment data loads
  if (assessmentData && assessmentData.questions && selectedAnswers.length === 0) {
    setSelectedAnswers(Array((assessmentData.questions as any[]).length).fill(""));
  }

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (assessmentData && assessmentData.questions && currentQuestion < (assessmentData.questions as any[]).length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessmentData) return;

    // Calculate score
    let correctCount = 0;
    (assessmentData.questions as any[]).forEach((q: any, index: number) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    
    // 80% pass rate = 8 out of 10 correct
    const passed = correctCount >= 8;

    // Submit attempt to backend
    try {
      await submitAssessmentMutation.mutateAsync({
        tierId,
        answers: selectedAnswers,
        score: correctCount,
        passed,
      });
    } catch (error) {
      console.error("Failed to submit tier assessment attempt:", error);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(Array((assessmentData?.questions as any[])?.length || 0).fill(""));
    setShowResults(false);
    setScore(0);
  };

  const getSassyFeedback = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage === 100) {
      return "Perfect score? Well, well, well. Look who actually studied. I'm genuinely impressed. 🏆";
    } else if (percentage >= 90) {
      return "9/10? Not bad at all. You clearly paid attention. Color me impressed. 🎯";
    } else if (percentage >= 80) {
      return "You passed. Barely. But hey, 80% is 80%, right? Tier 2 unlocked. Don't mess it up. 🔓";
    } else if (percentage >= 70) {
      return "70%? So close, yet so far. You need 80% to unlock Tier 2. Review and try again. 📚";
    } else if (percentage >= 50) {
      return "Half right, half wrong. That's... not how mastery works. Review Tier 1 and come back. 🤔";
    } else {
      return "Yikes. That was rough. Maybe spend some quality time with Tier 1 articles before trying again? Just a thought. 😬";
    }
  };

  if (isLoading || checkingQuizzes) {
    return (
      <Card className="border-2 border-purple-500/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Show locked state if user hasn't passed all tier quizzes
  if (!allQuizzesPassed) {
    return (
      <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-8 h-8 text-purple-500" />
            <CardTitle>Tier 1 Mastery Assessment 🔒</CardTitle>
          </div>
          <CardDescription>
            Complete and pass all 10 Tier 1 article quizzes to unlock this assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-muted/50 rounded-lg text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Assessment Locked</h3>
            <p className="text-muted-foreground mb-4">
              You need to pass the quiz for each of the 10 Tier 1 articles before you can take this comprehensive assessment.
            </p>
            <p className="text-sm text-muted-foreground">
              💡 Tip: Each article quiz requires 80% (4/5 correct) to pass. Review the articles and take the quizzes to unlock this assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessmentData || !assessmentData.questions || (assessmentData.questions as any[]).length === 0) {
    return null; // No assessment available
  }

  const questions = assessmentData.questions as any[];
  const currentQ = questions[currentQuestion];

  // Results view
  if (showResults) {
    const passed = score >= 8;
    return (
      <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {passed ? (
              <Trophy className="w-8 h-8 text-yellow-500" />
            ) : (
              <XCircle className="w-8 h-8 text-destructive" />
            )}
            <CardTitle>
              {passed ? "Assessment Completed! 🎉" : "Assessment Completed"}
            </CardTitle>
          </div>
          <CardDescription>
            {getSassyFeedback(score, questions.length)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-lg font-semibold">Your Score:</span>
              <span className="text-2xl font-bold">
                {score} / {questions.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-lg font-semibold">Percentage:</span>
              <span className="text-2xl font-bold">
                {Math.round((score / questions.length) * 100)}%
              </span>
            </div>
            {passed ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  ✅ You passed! Tier 2 is now unlocked. Ready for Building Stability?
                </p>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium">
                  ❌ You need 80% (8/10) to unlock Tier 2. Review Tier 1 articles and try again!
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRetake} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Assessment
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Assessment view
  return (
    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-purple-500" />
          <CardTitle>Tier 1 Mastery Assessment 🏆</CardTitle>
        </div>
        <CardDescription>
          {assessmentData.description || "Answer all 10 questions correctly (80%+) to unlock Tier 2."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span>
            {selectedAnswers.filter((a) => a !== "").length} / {questions.length} answered
          </span>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQ.question_text}</h3>

          {/* Options */}
          <RadioGroup
            value={selectedAnswers[currentQuestion]}
            onValueChange={(value) => handleAnswerSelect(value)}
          >
            <div className="space-y-3">
              {currentQ.options.map((option: string, index: number) => {
                const optionLetter = option.charAt(0); // Extract "A", "B", "C", etc.
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value={optionLetter} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === ""}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswers.some((a) => a === "")}
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
