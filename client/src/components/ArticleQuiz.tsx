import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Loader2 } from "lucide-react";

interface ArticleQuizProps {
  articleId: number;
}

export default function ArticleQuiz({ articleId }: ArticleQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch quiz data
  const { data: quizData, isLoading } = trpc.learnFinance.getArticleQuiz.useQuery(
    { articleId },
    { enabled: !!articleId }
  );

  // Submit quiz attempt mutation
  const submitQuizMutation = trpc.learnFinance.submitQuizAttempt.useMutation();

  // Initialize selected answers when quiz data loads
  if (quizData && quizData.questions && selectedAnswers.length === 0) {
    setSelectedAnswers(Array((quizData.questions as any[]).length).fill(-1));
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (quizData && quizData.questions && currentQuestion < (quizData.questions as any[]).length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quizData) return;

    // Calculate score
    let correctCount = 0;
    (quizData.questions as any[]).forEach((q: any, index: number) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    
    // 80% pass rate = 4 out of 5 correct
    const passed = correctCount >= 4;

    // Submit attempt to backend
    try {
      await submitQuizMutation.mutateAsync({
        articleId,
        answers: selectedAnswers,
        score: correctCount,
        passed,
      });
    } catch (error) {
      console.error("Failed to submit quiz attempt:", error);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(Array((quizData?.questions as any[])?.length || 0).fill(-1));
    setShowResults(false);
    setScore(0);
  };

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D, E
  };

  const getSassyFeedback = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage === 100) {
      return "Well, well, well. Look who actually paid attention. Color me impressed. 🎉";
    } else if (percentage >= 80) {
      return "You passed. Barely. But hey, passing is passing, right? 🎯";
    } else {
      return "Yikes. That was... not great. Maybe give the article another read? Just a thought. 📚";
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-12">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!quizData || !quizData.questions || (quizData.questions as any[]).length === 0) {
    return null; // No quiz available
  }

  const questions = quizData.questions as any[];
  const currentQ = questions[currentQuestion];

  // Results view
  if (showResults) {
    const passed = score >= 4;
    return (
      <Card className="mt-12 border-2">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {passed ? (
              <Trophy className="w-8 h-8 text-yellow-500" />
            ) : (
              <XCircle className="w-8 h-8 text-destructive" />
            )}
            <CardTitle>
              {passed ? "Quiz Completed! 🎉" : "Quiz Completed"}
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
                  ✅ You passed! You can now mark this article as complete.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium">
                  ❌ You need 80% (4/5) to pass. Review the article and try again!
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRetake} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Quiz view
  return (
    <Card className="mt-12 border-2">
      <CardHeader>
        <CardTitle>Test Your Knowledge 📝</CardTitle>
        <CardDescription>
          Answer all 5 questions correctly (80%+) to complete this article.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestion + 1} of {(questions as any[]).length}
          </span>
          <span>
            {selectedAnswers.filter((a) => a !== -1).length} / {(questions as any[]).length}{" "}
            answered
          </span>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQ.question}</h3>

          {/* Options */}
          <RadioGroup
            value={selectedAnswers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            <div className="space-y-3">
              {currentQ.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <span className="font-semibold mr-2">
                      {getOptionLabel(index)}.
                    </span>
                    {option}
                  </Label>
                </div>
              ))}
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
              disabled={selectedAnswers[currentQuestion] === -1}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswers.some((a) => a === -1)}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
