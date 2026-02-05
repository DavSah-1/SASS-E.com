import { Lightbulb, TrendingUp, TrendingDown, DollarSign, Target, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export function FinancialInsights() {
  const [generating, setGenerating] = useState(false);
  const { data: insights = [], refetch } = trpc.budget.getInsights.useQuery({ activeOnly: true, limit: 10 });
  const generateInsights = trpc.budget.generateInsights.useMutation({
    onSuccess: (result) => {
      setGenerating(false);
      if (result.success) {
        toast.success(`Generated ${result.insightsCount} new insights`);
        refetch();
      } else {
        toast.error("Failed to generate insights");
      }
    },
    onError: () => {
      setGenerating(false);
      toast.error("Failed to generate insights");
    },
  });
  
  const dismissInsight = trpc.budget.dismissInsight.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Insight dismissed");
    },
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "spending_pattern":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "saving_opportunity":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "cash_flow_prediction":
        return <TrendingDown className="h-5 w-5 text-purple-500" />;
      case "budget_recommendation":
        return <Target className="h-5 w-5 text-orange-500" />;
      case "trend_analysis":
        return <Sparkles className="h-5 w-5 text-pink-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Low</Badge>;
      default:
        return null;
    }
  };

  const handleGenerate = () => {
    setGenerating(true);
    generateInsights.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Financial Insights
            </CardTitle>
            <CardDescription>AI-powered recommendations to improve your finances</CardDescription>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant="outline"
            size="sm"
          >
            {generating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {insights.length > 0 ? "Regenerate Insights" : "Generate Insights"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="mb-4">No insights yet. Generate AI-powered financial recommendations!</p>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="relative p-4 rounded-lg border bg-gradient-to-br from-background to-muted/30"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => dismissInsight.mutate({ insightId: insight.id })}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-start gap-3 mb-2 pr-8">
                  <div className="mt-0.5 flex-shrink-0">{getInsightIcon(insight.insightType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground break-words">{insight.description}</p>
                    
                    {insight.actionable === 1 && insight.actionText && (
                      <div className="mt-3">
                        <Button variant="outline" size="sm" className="text-xs break-words whitespace-normal h-auto">
                          {insight.actionText}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
