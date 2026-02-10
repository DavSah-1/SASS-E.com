import { Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface TrialStatusProps {
  hubName: string;
  daysRemaining: number;
  expiresAt: Date;
  onUpgrade?: () => void;
}

export function TrialStatus({ hubName, daysRemaining, expiresAt, onUpgrade }: TrialStatusProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setLocation("/pricing");
    }
  };

  const getStatusColor = (): "default" | "destructive" | "outline" | "secondary" => {
    if (daysRemaining <= 1) return "destructive";
    if (daysRemaining <= 2) return "secondary";
    return "default";
  };

  const getStatusText = () => {
    if (daysRemaining === 0) return "Expires today";
    if (daysRemaining === 1) return "1 day remaining";
    return `${daysRemaining} days remaining`;
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Free Trial Active</CardTitle>
          </div>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription>
          You're trying out {hubName} for free
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Trial expires on {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}
        </div>
        
        {daysRemaining <= 2 && (
          <div className="rounded-lg bg-primary/10 p-3 text-sm">
            <p className="font-medium">Your trial is ending soon!</p>
            <p className="text-muted-foreground mt-1">
              Upgrade now to keep access to all {hubName} features
            </p>
          </div>
        )}

        <Button 
          onClick={handleUpgrade}
          className="w-full"
          variant={daysRemaining <= 2 ? "default" : "outline"}
        >
          Upgrade to Keep Access
        </Button>
      </CardContent>
    </Card>
  );
}
