/**
 * Incomplete Profile Banner - Prompts users to complete wellness onboarding
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Sparkles } from "lucide-react";

interface IncompleteProfileBannerProps {
  onComplete: () => void;
}

export function IncompleteProfileBanner({ onComplete }: IncompleteProfileBannerProps) {
  return (
    <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-100">Complete Your Wellness Profile</h3>
              <p className="text-sm text-yellow-200/80">
                Unlock personalized AI coaching and recommendations by completing your wellness assessment
              </p>
            </div>
          </div>
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 gap-2 flex-shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            Complete Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
