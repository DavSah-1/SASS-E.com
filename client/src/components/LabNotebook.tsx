import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, TrendingUp, Award, Calendar, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LabNotebookProps {
  userId: number;
}

export function LabNotebook({ userId }: LabNotebookProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  const { data: results, isLoading } = trpc.science.getMyLabResults.useQuery({ experimentId: undefined });
  const { data: progress } = trpc.science.getMyProgress.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-green-500/20">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No experiments completed yet. Start your first experiment!</p>
        </CardContent>
      </Card>
    );
  }

  // Filter results
  let filteredResults = results;
  if (categoryFilter !== "all") {
    filteredResults = results.filter((r: any) => r.experiment.category === categoryFilter);
  }

  // Sort results
  const sortedResults = [...filteredResults].sort((a: any, b: any) => {
    if (sortBy === "date") {
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    } else if (sortBy === "grade") {
      return (b.grade || 0) - (a.grade || 0);
    } else if (sortBy === "name") {
      return a.experiment.title.localeCompare(b.experiment.title);
    }
    return 0;
  });

  // Calculate improvement trend
  const recentResults = sortedResults.slice(0, 5);
  const olderResults = sortedResults.slice(5, 10);
  const recentAvg = recentResults.reduce((sum: number, r: any) => sum + (r.grade || 0), 0) / recentResults.length;
  const olderAvg = olderResults.length > 0 
    ? olderResults.reduce((sum: number, r: any) => sum + (r.grade || 0), 0) / olderResults.length 
    : recentAvg;
  const improvement = recentAvg - olderAvg;

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-400";
    if (grade >= 80) return "text-blue-400";
    if (grade >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getGradeBadge = (grade: number) => {
    if (grade >= 90) return "bg-green-500/20 text-green-300 border-green-500/30";
    if (grade >= 80) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (grade >= 70) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-red-500/20 text-red-300 border-red-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Experiments</p>
                <p className="text-2xl font-bold text-green-300">{progress?.totalExperimentsCompleted || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Average Grade</p>
                <p className={`text-2xl font-bold ${getGradeColor(progress?.averageGrade || 0)}`}>
                  {progress?.averageGrade || 0}%
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Recent Trend</p>
                <p className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${improvement >= 0 ? 'text-green-500/50' : 'text-red-500/50'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Filter:</span>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Sort by:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="grade">Grade (Highest)</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedResults.map((result: any) => (
          <Card
            key={result.id}
            className="bg-slate-800/50 border-green-500/20 hover:border-green-400/40 transition-all cursor-pointer"
            onClick={() => setSelectedResult(result)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base text-green-300 line-clamp-2">
                  {result.experiment.title}
                </CardTitle>
                <Badge className={`${getGradeBadge(result.grade || 0)} border`}>
                  {result.grade || 0}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {result.experiment.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {result.experiment.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3 w-3" />
                {new Date(result.completedAt).toLocaleDateString()}
              </div>
              {result.timeSpent && (
                <p className="text-xs text-slate-400">
                  Time: {result.timeSpent} minutes
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Result Detail Modal */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-green-500/30">
          <DialogHeader>
            <DialogTitle className="text-green-300">
              {selectedResult?.experiment.title}
            </DialogTitle>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedResult.experiment.category}</Badge>
                <Badge variant="outline">{selectedResult.experiment.difficulty}</Badge>
                <Badge className={`${getGradeBadge(selectedResult.grade || 0)} border`}>
                  Grade: {selectedResult.grade || 0}%
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedResult.completedAt).toLocaleString()}
                </div>
                {selectedResult.timeSpent && (
                  <span>Time: {selectedResult.timeSpent} minutes</span>
                )}
              </div>

              {/* Observations */}
              <div>
                <h4 className="font-semibold text-green-300 mb-2">Observations</h4>
                <p className="text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded">
                  {selectedResult.observations}
                </p>
              </div>

              {/* Measurements */}
              {selectedResult.measurements && (
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">Measurements</h4>
                  <p className="text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded">
                    {selectedResult.measurements}
                  </p>
                </div>
              )}

              {/* Analysis */}
              {selectedResult.analysis && (
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">Analysis</h4>
                  <p className="text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded">
                    {selectedResult.analysis}
                  </p>
                </div>
              )}

              {/* Conclusions */}
              {selectedResult.conclusions && (
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">Conclusions</h4>
                  <p className="text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded">
                    {selectedResult.conclusions}
                  </p>
                </div>
              )}

              {/* SASS-E Feedback */}
              {selectedResult.feedback && (
                <div>
                  <h4 className="font-semibold text-purple-300 mb-2">🤖 SASS-E Feedback</h4>
                  <p className="text-slate-300 whitespace-pre-wrap bg-purple-900/20 border border-purple-500/30 p-3 rounded">
                    {selectedResult.feedback}
                  </p>
                </div>
              )}

              <Button
                onClick={() => setSelectedResult(null)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
