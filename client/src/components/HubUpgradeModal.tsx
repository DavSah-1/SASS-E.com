import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, Crown } from "lucide-react";
import { useLocation } from "wouter";
import type { SpecializedHub } from "@shared/pricing";

interface HubUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  hubId: SpecializedHub;
  hubName: string;
  currentTier: string;
  reason: string;
}

const HUB_ICONS: Record<SpecializedHub, string> = {
  language_learning: "🌍",
  math_tutor: "🔢",
  science_labs: "🔬",
  translation_hub: "🌐",
  wellness: "🧘",
  money_hub: "💰",
};

export function HubUpgradeModal({ open, onClose, hubId, hubName, currentTier, reason }: HubUpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation("/pricing");
  };

  const getRecommendedTier = () => {
    if (currentTier === "free") return "starter";
    if (currentTier === "starter") return "pro";
    return "ultimate";
  };

  const recommendedTier = getRecommendedTier();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">{HUB_ICONS[hubId]}</div>
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                {hubName} Locked
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base">
            {reason}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentTier === "free" && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Unlock Specialized Hubs</h4>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to <strong>Starter</strong> to permanently access 1 specialized hub, or choose <strong>Pro</strong> for 2 hubs with unlimited voice chats.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentTier === "starter" && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Unlock More Hubs</h4>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to <strong>Pro</strong> to access 2 specialized hubs instead of 1, plus get unlimited voice chats and priority support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentTier === "pro" && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Unlock All Hubs</h4>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to <strong>Ultimate</strong> to get unlimited access to all specialized hubs plus unlimited usage on all features.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              Current: {currentTier}
            </Badge>
            <span>→</span>
            <Badge variant="default" className="capitalize">
              Recommended: {recommendedTier}
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Go Back
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4 mr-2" />
            View Pricing Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
