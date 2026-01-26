import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Beaker, FlaskConical, Microscope, AlertTriangle, CheckCircle2, Clock, Target, BookOpen } from "lucide-react";
import { LabNotebook } from "@/components/LabNotebook";
import { PreLabQuiz } from "@/components/PreLabQuiz";
import { EquipmentGallery } from "@/components/LabEquipment";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function ScienceLab() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<"physics" | "chemistry" | "biology" | "all">("all");
  
  // Hub access control
  const scienceHubAccess = useFeatureAccess("specialized_hub", "science_labs");
  
  // Hub access control - show upgrade prompt if no access
  useEffect(() => {
    if (!scienceHubAccess.isLoading && isAuthenticated) {
      if (!scienceHubAccess.allowed) {
        // Show upgrade prompt at the top of the page
      }
    }
  }, [scienceHubAccess.isLoading, scienceHubAccess.allowed, isAuthenticated]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"beginner" | "intermediate" | "advanced" | "all">("all");
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [observations, setObservations] = useState("");
  const [measurements, setMeasurements] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [conclusions, setConclusions] = useState("");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [labResult, setLabResult] = useState<any>(null);

  const experimentsQuery = trpc.science.getExperiments.useQuery(
    {
      category: selectedCategory === "all" ? undefined : selectedCategory,
      difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
      limit: 30,
    },
    { enabled: true }
  );

  const experimentDetailsQuery = trpc.science.getExperimentDetails.useQuery(
    { experimentId: selectedExperiment?.id || 0 },
    { enabled: !!selectedExperiment }
  );

  const progressQuery = trpc.science.getMyProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const submitResultMutation = trpc.science.submitLabResult.useMutation({
    onSuccess: (data) => {
      setLabResult(data);
      setShowResults(true);
      toast.success("Lab report submitted!");
      progressQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit lab report");
    },
  });

  const handleStartExperiment = (experiment: any) => {
    setSelectedExperiment(experiment);
    setShowQuiz(true); // Show quiz first
    setCurrentStep(0);
    setObservations("");
    setMeasurements("");
    setAnalysis("");
    setConclusions("");
    setCompletedSteps([]);
    setShowResults(false);
    setLabResult(null);
  };

  const handleQuizPass = () => {
    setShowQuiz(false);
    setStartTime(Date.now());
    toast.success("Quiz passed! You can now begin the experiment.");
  };

  const handleQuizClose = () => {
    setShowQuiz(false);
    setSelectedExperiment(null);
  };

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const handleSubmitReport = () => {
    if (!observations.trim()) {
      toast.error("Please record your observations");
      return;
    }

    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;

    submitResultMutation.mutate({
      experimentId: selectedExperiment.id,
      observations,
      measurements: measurements || undefined,
      analysis: analysis || undefined,
      conclusions: conclusions || undefined,
      completedSteps,
      timeSpent,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "physics":
        return <Target className="h-5 w-5" />;
      case "chemistry":
        return <FlaskConical className="h-5 w-5" />;
      case "biology":
        return <Microscope className="h-5 w-5" />;
      default:
        return <Beaker className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <Beaker className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Science Lab Access Required</h2>
          <p className="text-gray-300">Please log in to access the virtual science laboratory.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Beaker className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Science Lab
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Virtual experiments with SASS-E's scientific guidance</p>
          <div className="mt-4">
            <Button
              onClick={() => setShowNotebook(!showNotebook)}
              variant="outline"
              className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {showNotebook ? "Hide Lab Notebook" : "View Lab Notebook"}
            </Button>
          </div>
        </div>

        {/* Upgrade Prompt if no access */}
        {!scienceHubAccess.allowed && !scienceHubAccess.isLoading && scienceHubAccess.upgradeRequired && (
          <div className="mb-8">
            <UpgradePrompt
              featureName="Science Labs Hub"
              reason={scienceHubAccess.reason}
            />
          </div>
        )}

        {/* Progress Stats */}
        {progressQuery.data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{progressQuery.data.totalExperimentsCompleted}</div>
                  <div className="text-sm text-gray-400">Total Experiments</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{progressQuery.data.physicsExperiments}</div>
                  <div className="text-sm text-gray-400">Physics</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{progressQuery.data.chemistryExperiments}</div>
                  <div className="text-sm text-gray-400">Chemistry</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">{progressQuery.data.biologyExperiments}</div>
                  <div className="text-sm text-gray-400">Biology</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{progressQuery.data.averageGrade}%</div>
                  <div className="text-sm text-gray-400">Average Grade</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lab Notebook View */}
        {showNotebook && user && (
          <div className="mb-8">
            <LabNotebook userId={user.numericId} />
          </div>
        )}

        {/* Pre-Lab Quiz */}
        {showQuiz && selectedExperiment && (
          <div className="mb-8">
            <PreLabQuiz
              experimentId={selectedExperiment.id}
              experimentTitle={selectedExperiment.title}
              onPass={handleQuizPass}
              onClose={handleQuizClose}
            />
          </div>
        )}

        {!selectedExperiment || showNotebook ? (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-white mb-2 block">Category</Label>
                <Select value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="text-white mb-2 block">Difficulty</Label>
                <Select value={selectedDifficulty} onValueChange={(v: any) => setSelectedDifficulty(v)}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
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

            {/* Experiment Library */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experimentsQuery.data?.map((experiment) => (
                <Card
                  key={experiment.id}
                  className="bg-slate-900/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => handleStartExperiment(experiment)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(experiment.category)}
                        <Badge className={getDifficultyColor(experiment.difficulty)}>{experiment.difficulty}</Badge>
                      </div>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <CardTitle className="text-white text-lg">{experiment.title}</CardTitle>
                    <CardDescription className="text-gray-400">{experiment.category} • {experiment.duration} min</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm line-clamp-3">{experiment.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : showQuiz ? (
          // Quiz is handled above, this branch should not render
          null
        ) : showResults ? (
          // Results View
          <Card className="bg-slate-900/50 border-slate-700 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                Lab Report Submitted
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-purple-400 mb-2">{labResult?.grade}%</div>
                  <div className="text-gray-400">Your Grade</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">SASS-E's Feedback</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{labResult?.feedback}</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                  <h4 className="text-blue-300 font-semibold mb-2">💡 Suggestion for Improvement</h4>
                  <p className="text-gray-300">{labResult?.suggestion}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setSelectedExperiment(null)} className="flex-1">
                  Back to Experiments
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setObservations("");
                    setMeasurements("");
                    setAnalysis("");
                    setConclusions("");
                    setCompletedSteps([]);
                    setStartTime(Date.now());
                  }}
                  className="flex-1"
                >
                  Retry Experiment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Experiment View
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Experiment Info & Steps */}
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getDifficultyColor(selectedExperiment.difficulty)}>
                      {selectedExperiment.difficulty}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {selectedExperiment.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-2xl">{selectedExperiment.title}</CardTitle>
                  <CardDescription className="text-gray-400">{selectedExperiment.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedExperiment.safetyWarnings && JSON.parse(selectedExperiment.safetyWarnings).length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <h4 className="text-red-300 font-semibold">Safety Warnings</h4>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                        {JSON.parse(selectedExperiment.safetyWarnings).map((warning: string, idx: number) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedExperiment.equipment && (
                    <div>
                      <h4 className="text-white font-semibold mb-2">Equipment Needed</h4>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(selectedExperiment.equipment).map((item: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-slate-800/50 text-gray-300">
                            {item}
                          </Badge>
                        ))}
                      </div>
                      {/* Equipment Visualizations */}
                      <EquipmentGallery equipment={JSON.parse(selectedExperiment.equipment)} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Procedure Steps */}
              {experimentDetailsQuery.data?.steps && (
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Procedure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {experimentDetailsQuery.data.steps.map((step) => (
                        <div
                          key={step.id}
                          className={`p-4 rounded-lg border ${
                            completedSteps.includes(step.stepNumber)
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-slate-800/50 border-slate-700"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  completedSteps.includes(step.stepNumber)
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-700 text-gray-300"
                                }`}
                              >
                                {step.stepNumber}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-white mb-2">{step.instruction}</p>
                              {step.expectedResult && (
                                <p className="text-sm text-gray-400 italic">Expected: {step.expectedResult}</p>
                              )}
                              {step.safetyNote && (
                                <div className="mt-2 flex items-start gap-2 text-sm text-yellow-300">
                                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                  <span>{step.safetyNote}</span>
                                </div>
                              )}
                              {!completedSteps.includes(step.stepNumber) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => handleStepComplete(step.stepNumber)}
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Lab Report */}
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Lab Report</CardTitle>
                  <CardDescription className="text-gray-400">Record your findings and analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="observations" className="text-white">
                      Observations *
                    </Label>
                    <Textarea
                      id="observations"
                      placeholder="What did you observe during the experiment?"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white mt-2 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="measurements" className="text-white">
                      Measurements
                    </Label>
                    <Textarea
                      id="measurements"
                      placeholder="Record any measurements or data collected"
                      value={measurements}
                      onChange={(e) => setMeasurements(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white mt-2 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="analysis" className="text-white">
                      Analysis
                    </Label>
                    <Textarea
                      id="analysis"
                      placeholder="Analyze your results and explain what happened"
                      value={analysis}
                      onChange={(e) => setAnalysis(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white mt-2 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="conclusions" className="text-white">
                      Conclusions
                    </Label>
                    <Textarea
                      id="conclusions"
                      placeholder="What conclusions can you draw from this experiment?"
                      value={conclusions}
                      onChange={(e) => setConclusions(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white mt-2 min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedExperiment(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitReport}
                      disabled={submitResultMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {submitResultMutation.isPending ? "Submitting..." : "Submit Report"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
