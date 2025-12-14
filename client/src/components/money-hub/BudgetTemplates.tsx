import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2, TrendingUp, DollarSign, Wallet } from "lucide-react";

export function BudgetTemplates() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const utils = trpc.useUtils();

  // Fetch templates
  const { data: templates, isLoading } = trpc.budget.getTemplates.useQuery();

  // Fetch active template
  const { data: activeTemplate } = trpc.budget.getActiveTemplate.useQuery();

  // Apply template mutation
  const applyTemplate = trpc.budget.applyTemplate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Template applied successfully!");
      setShowApplyDialog(false);
      setShowPreview(false);
      setMonthlyIncome("");
      setSelectedTemplateId(null);
      utils.budget.getActiveTemplate.invalidate();
      utils.budget.getCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to apply template");
    },
  });

  const handleApplyClick = (templateId: number) => {
    setSelectedTemplateId(templateId);
    setShowApplyDialog(true);
  };

  const handlePreviewClick = () => {
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      toast.error("Please enter a valid monthly income");
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmApply = () => {
    if (!selectedTemplateId || !monthlyIncome) return;

    const incomeInCents = Math.round(parseFloat(monthlyIncome) * 100);
    applyTemplate.mutate({
      templateId: selectedTemplateId,
      monthlyIncome: incomeInCents,
    });
  };

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);

  const calculatePreview = () => {
    if (!selectedTemplate || !monthlyIncome) return null;

    const income = parseFloat(monthlyIncome);
    const allocations = selectedTemplate.allocations;

    if (selectedTemplate.strategy === "50_30_20") {
      return {
        needs: (income * 0.5).toFixed(2),
        wants: (income * 0.3).toFixed(2),
        savings: (income * 0.2).toFixed(2),
      };
    } else if (selectedTemplate.strategy === "zero_based") {
      return {
        description: "All income will be allocated across your expense categories",
        total: income.toFixed(2),
      };
    } else if (selectedTemplate.strategy === "envelope") {
      return {
        description: "Strict limits will be set for each spending category",
        total: income.toFixed(2),
      };
    }

    return null;
  };

  const preview = showPreview ? calculatePreview() : null;

  return (
    <div className="space-y-6">
      {/* Active Template Banner */}
      {activeTemplate && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Active Budget Template</CardTitle>
            </div>
            <CardDescription>
              You're currently using: <strong>{activeTemplate.template.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Applied on: {new Date(activeTemplate.appliedAt).toLocaleDateString()}
              <br />
              Monthly Income: ${(activeTemplate.monthlyIncome / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            Loading templates...
          </div>
        ) : templates && templates.length > 0 ? (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{template.icon}</div>
                  {template.usageCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {template.usageCount} {template.usageCount === 1 ? "user" : "users"}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl mt-2">{template.name}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {template.strategy === "50_30_20" && (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Needs:</span>
                        <span className="font-medium">50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wants:</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Savings:</span>
                        <span className="font-medium">20%</span>
                      </div>
                    </div>
                  )}
                  {template.strategy === "zero_based" && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      <span>Every dollar assigned</span>
                    </div>
                  )}
                  {template.strategy === "envelope" && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Strict category limits</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={activeTemplate?.templateId === template.id ? "outline" : "default"}
                  onClick={() => handleApplyClick(template.id)}
                  disabled={applyTemplate.isPending}
                >
                  {activeTemplate?.templateId === template.id ? "Reapply Template" : "Apply Template"}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No templates available
          </div>
        )}
      </div>

      {/* Apply Template Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply Budget Template</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name && `Configure ${selectedTemplate.name} for your budget`}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="income"
                    type="number"
                    placeholder="5000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="pl-10"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your total monthly income after taxes
                </p>
              </div>

              {showPreview && preview && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Budget Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedTemplate.strategy === "50_30_20" && "needs" in preview && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Needs (50%):</span>
                          <span className="font-medium">${preview.needs}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Wants (30%):</span>
                          <span className="font-medium">${preview.wants}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Savings (20%):</span>
                          <span className="font-medium">${preview.savings}</span>
                        </div>
                      </>
                    )}
                    {"description" in preview && (
                      <p className="text-sm text-muted-foreground">{preview.description}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {!showPreview ? (
              <>
                <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePreviewClick}>Preview Budget</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Back
                </Button>
                <Button onClick={handleConfirmApply} disabled={applyTemplate.isPending}>
                  {applyTemplate.isPending ? "Applying..." : "Confirm & Apply"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
