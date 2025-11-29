import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Flame, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Volume2,
  RotateCcw,
  ChevronRight,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";

export default function LanguageLearning() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("es");
  const [activeTab, setActiveTab] = useState("overview");
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [grammarTopic, setGrammarTopic] = useState("");
  const [grammarExplanation, setGrammarExplanation] = useState<any>(null);
  const [isGeneratingGrammar, setIsGeneratingGrammar] = useState(false);
  const [exerciseAnswer, setExerciseAnswer] = useState("");
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(0);

  // Queries
  const { data: languages } = trpc.languageLearning.getSupportedLanguages.useQuery();
  const { data: progress, refetch: refetchProgress } = trpc.languageLearning.getProgress.useQuery(
    { language: selectedLanguage },
    { enabled: isAuthenticated }
  );
  const { data: flashcards, refetch: refetchFlashcards } = trpc.languageLearning.getVocabularyFlashcards.useQuery(
    { language: selectedLanguage, limit: 20 },
    { enabled: isAuthenticated && activeTab === "vocabulary" }
  );
  const { data: grammarLessons } = trpc.languageLearning.getGrammarLessons.useQuery(
    { language: selectedLanguage },
    { enabled: isAuthenticated && activeTab === "grammar" }
  );
  const { data: exercises, refetch: refetchExercises } = trpc.languageLearning.getExercises.useQuery(
    { language: selectedLanguage, limit: 10 },
    { enabled: isAuthenticated && activeTab === "exercises" }
  );
  const { data: achievements } = trpc.languageLearning.getAchievements.useQuery(
    { language: selectedLanguage },
    { enabled: isAuthenticated && activeTab === "achievements" }
  );

  // Mutations
  const submitVocabularyPractice = trpc.languageLearning.submitVocabularyPractice.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchFlashcards();
      refetchProgress();
      setShowAnswer(false);
      setCurrentFlashcardIndex((prev) => prev + 1);
    },
  });

  const generateGrammarExplanation = trpc.languageLearning.generateGrammarExplanation.useMutation({
    onSuccess: (data) => {
      setGrammarExplanation(data);
      setIsGeneratingGrammar(false);
      toast.success("Grammar explanation generated! Bob's wisdom awaits.");
    },
    onError: () => {
      setIsGeneratingGrammar(false);
      toast.error("Failed to generate explanation. Even Bob has his limits.");
    },
  });

  const submitExerciseAnswer = trpc.languageLearning.submitExerciseAnswer.useMutation({
    onSuccess: (data) => {
      const timeSpent = Math.floor((Date.now() - exerciseStartTime) / 1000);
      if (data.isCorrect) {
        toast.success(data.sarcasticFeedback);
      } else {
        toast.error(`${data.sarcasticFeedback}\nCorrect answer: ${data.correctAnswer}`);
      }
      setExerciseAnswer("");
      refetchExercises();
      refetchProgress();
    },
  });

  useEffect(() => {
    if (activeTab === "exercises" && exercises && exercises.length > 0) {
      setExerciseStartTime(Date.now());
    }
  }, [activeTab, exercises]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your linguistic journey...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Language Learning
            </CardTitle>
            <CardDescription>
              Master foreign languages with Bob's sarcastic teaching style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to access the comprehensive language learning features.
            </p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Log In to Start Learning</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentFlashcard = flashcards?.[currentFlashcardIndex];
  const currentExercise = exercises?.[0];

  const handleFlashcardResponse = (isCorrect: boolean) => {
    if (!currentFlashcard) return;
    
    submitVocabularyPractice.mutate({
      vocabularyItemId: currentFlashcard.id,
      language: selectedLanguage,
      isCorrect,
      timeSpent: 5,
    });
  };

  const handleGrammarExplanation = () => {
    if (!grammarTopic.trim()) {
      toast.error("Please enter a grammar topic first. Bob can't read your mind... yet.");
      return;
    }

    setIsGeneratingGrammar(true);
    generateGrammarExplanation.mutate({
      language: selectedLanguage,
      topic: grammarTopic,
      userLevel: progress?.level || "beginner",
    });
  };

  const handleExerciseSubmit = () => {
    if (!currentExercise || !exerciseAnswer.trim()) {
      toast.error("Please provide an answer. Silence won't get you fluent.");
      return;
    }

    const timeSpent = Math.floor((Date.now() - exerciseStartTime) / 1000);
    submitExerciseAnswer.mutate({
      exerciseId: currentExercise.id,
      language: selectedLanguage,
      userAnswer: exerciseAnswer,
      timeSpent,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Language Learning
              </h1>
              <p className="text-muted-foreground">
                Master foreign languages with Bob's signature sarcasm
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages?.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress Overview */}
          {progress && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Brain className="h-5 w-5 text-primary mr-2" />
                      <span className="text-2xl font-bold">{progress.fluencyScore}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Fluency Score</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-2xl font-bold">{progress.vocabularySize}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Words Mastered</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-2xl font-bold">{progress.exercisesCompleted}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Exercises Done</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Flame className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-2xl font-bold">{progress.currentStreak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                      <Badge variant="secondary">{progress.level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Current Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Vocabulary Builder
                  </CardTitle>
                  <CardDescription>
                    Master words with spaced repetition flashcards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn and review vocabulary using scientifically-proven spaced repetition. Bob will sarcastically guide you through each word.
                  </p>
                  <Button onClick={() => setActiveTab("vocabulary")} className="w-full">
                    Start Vocabulary Practice
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Grammar Lessons
                  </CardTitle>
                  <CardDescription>
                    AI-powered grammar explanations with examples
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get detailed grammar explanations on any topic. Bob will explain it clearly... with maximum sarcasm.
                  </p>
                  <Button onClick={() => setActiveTab("grammar")} className="w-full">
                    Explore Grammar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Interactive Exercises
                  </CardTitle>
                  <CardDescription>
                    Practice with translation and fill-in-the-blank exercises
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test your skills with various exercise types. Get instant feedback and track your progress.
                  </p>
                  <Button onClick={() => setActiveTab("exercises")} className="w-full">
                    Practice Exercises
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                  <CardDescription>
                    Track milestones and earn badges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Celebrate your progress with achievements. Bob might even congratulate you... sarcastically.
                  </p>
                  <Button onClick={() => setActiveTab("achievements")} className="w-full">
                    View Achievements
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            {flashcards && flashcards.length > 0 ? (
              <div className="max-w-2xl mx-auto">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Card {currentFlashcardIndex + 1} of {flashcards.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentFlashcardIndex(0);
                      setShowAnswer(false);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restart
                  </Button>
                </div>

                {currentFlashcard ? (
                  <Card className="min-h-[400px] flex flex-col justify-center">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-6">
                        {/* Word */}
                        <div>
                          <h2 className="text-5xl font-bold mb-2">{currentFlashcard.word}</h2>
                          {currentFlashcard.pronunciation && (
                            <p className="text-muted-foreground text-sm">/{currentFlashcard.pronunciation}/</p>
                          )}
                          <Badge variant="secondary" className="mt-2">
                            {currentFlashcard.partOfSpeech}
                          </Badge>
                        </div>

                        {/* Translation (revealed on flip) */}
                        {showAnswer && (
                          <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="p-4 bg-primary/10 rounded-lg">
                              <p className="text-2xl font-semibold">{currentFlashcard.translation}</p>
                            </div>

                            {currentFlashcard.exampleSentence && (
                              <div className="text-left space-y-2">
                                <p className="text-sm font-medium">Example:</p>
                                <p className="text-sm italic">{currentFlashcard.exampleSentence}</p>
                                {currentFlashcard.exampleTranslation && (
                                  <p className="text-sm text-muted-foreground">{currentFlashcard.exampleTranslation}</p>
                                )}
                              </div>
                            )}

                            {/* Mastery Progress */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Mastery Level</span>
                                <span>{currentFlashcard.masteryLevel}%</span>
                              </div>
                              <Progress value={currentFlashcard.masteryLevel} />
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 justify-center pt-4">
                          {!showAnswer ? (
                            <Button onClick={() => setShowAnswer(true)} size="lg" className="w-full max-w-xs">
                              Show Answer
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleFlashcardResponse(false)}
                                variant="outline"
                                size="lg"
                                className="flex-1"
                              >
                                <XCircle className="mr-2 h-5 w-5" />
                                Didn't Know
                              </Button>
                              <Button
                                onClick={() => handleFlashcardResponse(true)}
                                size="lg"
                                className="flex-1"
                              >
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Got It!
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
                      <p className="text-muted-foreground mb-4">
                        You've reviewed all flashcards. Bob is mildly impressed.
                      </p>
                      <Button onClick={() => {
                        setCurrentFlashcardIndex(0);
                        setShowAnswer(false);
                      }}>
                        Review Again
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No vocabulary items available yet. Bob is working on it.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Grammar Tab */}
          <TabsContent value="grammar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Grammar Tutor
                </CardTitle>
                <CardDescription>
                  Ask Bob to explain any grammar topic in your target language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grammar-topic">Grammar Topic</Label>
                  <Input
                    id="grammar-topic"
                    placeholder="e.g., Present Perfect Tense, Subjunctive Mood, Gender Agreement"
                    value={grammarTopic}
                    onChange={(e) => setGrammarTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGrammarExplanation();
                    }}
                  />
                </div>
                <Button
                  onClick={handleGrammarExplanation}
                  disabled={isGeneratingGrammar}
                  className="w-full"
                >
                  {isGeneratingGrammar ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Explanation...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Get Bob's Explanation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {grammarExplanation && (
              <Card>
                <CardHeader>
                  <CardTitle>{grammarTopic}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Explanation */}
                  <div>
                    <h3 className="font-semibold mb-2">Explanation</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {grammarExplanation.explanation}
                    </p>
                  </div>

                  {/* Examples */}
                  <div>
                    <h3 className="font-semibold mb-3">Examples</h3>
                    <div className="space-y-3">
                      {grammarExplanation.examples.map((example: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                          <p className="font-medium">{example.original}</p>
                          <p className="text-sm text-muted-foreground">{example.translation}</p>
                          <p className="text-xs text-muted-foreground italic">{example.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Mistakes */}
                  <div>
                    <h3 className="font-semibold mb-2">Common Mistakes</h3>
                    <ul className="space-y-2">
                      {grammarExplanation.commonMistakes.map((mistake: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cultural Note */}
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Cultural Note
                    </h3>
                    <p className="text-sm text-muted-foreground">{grammarExplanation.culturalNote}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            {currentExercise ? (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{currentExercise.exerciseType}</Badge>
                    <Badge>{currentExercise.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Exercise Prompt */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{currentExercise.prompt}</h3>
                    
                    {/* Multiple Choice Options */}
                    {currentExercise.options && JSON.parse(currentExercise.options).length > 0 && (
                      <div className="space-y-2">
                        {JSON.parse(currentExercise.options).map((option: string, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-3"
                            onClick={() => setExerciseAnswer(option)}
                          >
                            <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Text Input for Translation/Fill-in-blank */}
                    {(!currentExercise.options || JSON.parse(currentExercise.options).length === 0) && (
                      <div className="space-y-2">
                        <Label htmlFor="answer">Your Answer</Label>
                        <Textarea
                          id="answer"
                          placeholder="Type your answer here..."
                          value={exerciseAnswer}
                          onChange={(e) => setExerciseAnswer(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={handleExerciseSubmit} className="w-full" size="lg">
                    Submit Answer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No exercises available yet. Bob is preparing some challenges for you.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {achievements && achievements.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-3">{achievement.iconUrl || "🏆"}</div>
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No achievements yet. Start learning to earn badges!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
