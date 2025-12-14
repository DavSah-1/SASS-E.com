import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, XCircle, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";

interface PreLabQuizProps {
  experimentId: number;
  experimentTitle: string;
  onPass: () => void;
  onClose: () => void;
}

export function PreLabQuiz({ experimentId, experimentTitle, onPass, onClose }: PreLabQuizProps) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const { data: questions, isLoading } = trpc.science.getLabQuiz.useQuery({ experimentId });
  const submitQuizMutation = trpc.science.submitLabQuiz.useMutation({
    onSuccess: (data) => {
      setQuizResult(data);
      setShowResults(true);
      if (data.passed) {
        toast.success("Quiz passed! You can now start the experiment.");
        setTimeout(() => {
          onPass();
        }, 2000);
      } else {
        toast.error(`Score: ${data.score}%. You need 70% to pass. Try again!`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit quiz");
    },
  });

  useEffect(() => {
    if (questions) {
      setAnswers(new Array(questions.length).fill(-1));
    }
  }, [questions]);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.some((a) => a === -1)) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    submitQuizMutation.mutate({
      experimentId,
      answers,
      timeSpent,
    });
  };

  const handleRetry = () => {
    setAnswers(new Array(questions?.length || 0).fill(-1));
    setStartTime(Date.now());
    setShowResults(false);
    setQuizResult(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-green-500/30">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Generating quiz questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card className="bg-slate-900 border-red-500/30">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300">Failed to load quiz questions</p>
          <Button onClick={onClose} className="mt-4 bg-slate-700 hover:bg-slate-600">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults && quizResult) {
    return (
      <Card className="bg-slate-900 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-300">
            {quizResult.passed ? (
              <>
                <Trophy className="h-6 w-6 text-yellow-400" />
                Quiz Passed!
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-400" />
                Quiz Not Passed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Score</p>
              <p className={`text-3xl font-bold ${quizResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                {quizResult.score}%
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Correct Answers</p>
              <p className="text-3xl font-bold text-green-400">
                {quizResult.correctAnswers}/{quizResult.totalQuestions}
              </p>
            </div>
          </div>

          {quizResult.passed ? (
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
              <p className="text-green-300">
                Great job! You've demonstrated sufficient understanding of the safety protocols,
                equipment, and theoretical concepts. You can now proceed with the experiment.
              </p>
            </div>
          ) : (
            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
              <p className="text-red-300">
                You need a score of 70% or higher to pass. Please review the experiment details
                and try again.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {!quizResult.passed && (
              <Button
                onClick={handleRetry}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                Retry Quiz
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {quizResult.passed ? "Start Experiment" : "Close"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-green-500/30">
      <CardHeader>
        <CardTitle className="text-green-300">Pre-Lab Quiz: {experimentTitle}</CardTitle>
        <p className="text-sm text-slate-400">
          Answer all questions correctly (70% minimum) to access the experiment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, qIndex) => {
          const options = JSON.parse(question.options);
          return (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">
                  Q{qIndex + 1}
                </Badge>
                <div className="flex-1">
                  <p className="text-slate-200 font-medium">{question.question}</p>
                  {question.category && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {question.category}
                    </Badge>
                  )}
                </div>
              </div>

              <RadioGroup
                value={answers[qIndex]?.toString() || ""}
                onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
              >
                {options.map((option: string, oIndex: number) => (
                  <div key={oIndex} className="flex items-center space-x-2 bg-slate-800/30 p-3 rounded">
                    <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                    <Label
                      htmlFor={`q${qIndex}-o${oIndex}`}
                      className="flex-1 cursor-pointer text-slate-300"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="h-4 w-4" />
            <span>
              {answers.filter((a) => a !== -1).length} / {questions.length} answered
            </span>
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={answers.some((a) => a === -1) || submitQuizMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
