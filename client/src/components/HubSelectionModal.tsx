import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  BookOpen, 
  Calculator, 
  Beaker, 
  Languages, 
  DollarSign, 
  Heart,
  CheckCircle2,
  Lock,
  Info
} from "lucide-react";
import { SPECIALIZED_HUBS, type SpecializedHub } from "@shared/pricing";

interface HubSelectionModalProps {
  open: boolean;
  onClose: () => void;
  userTier: "free" | "starter" | "pro" | "ultimate";
  currentSelection: SpecializedHub[];
  isLocked: boolean;
}

const HUB_ICONS: Record<SpecializedHub, any> = {
  money: DollarSign,
  wellness: Heart,
  translation_hub: Languages,
  learning: Calculator,
};

export function HubSelectionModal({ 
  open, 
  onClose, 
  userTier, 
  currentSelection,
  isLocked 
}: HubSelectionModalProps) {
  const [selectedHubs, setSelectedHubs] = useState<SpecializedHub[]>(currentSelection);
  const utils = trpc.useUtils();

  const saveHubSelection = trpc.subscription.selectHubs.useMutation({
    onSuccess: () => {
      toast.success("Your specialized hubs have been saved!");
      utils.auth.me.invalidate();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save hub selection");
    },
  });

  // Determine max hubs based on tier
  const getMaxHubs = () => {
    switch (userTier) {
      case "starter":
        return 1;
      case "pro":
        return 2;
      case "ultimate":
        return 6; // All hubs
      default:
        return 0;
    }
  };

  const maxHubs = getMaxHubs();

  const toggleHub = (hubId: SpecializedHub) => {
    if (isLocked) {
      toast.error("Your hub selection is locked until your subscription ends");
      return;
    }

    if (selectedHubs.includes(hubId)) {
      setSelectedHubs(selectedHubs.filter(h => h !== hubId));
    } else {
      if (selectedHubs.length >= maxHubs) {
        toast.error(`You can only select ${maxHubs} hub${maxHubs > 1 ? 's' : ''} with your ${userTier} plan`);
        return;
      }
      setSelectedHubs([...selectedHubs, hubId]);
    }
  };

  const handleSave = () => {
    if (selectedHubs.length === 0) {
      toast.error("Please select at least one hub");
      return;
    }

    if (selectedHubs.length > maxHubs) {
      toast.error(`You can only select ${maxHubs} hub${maxHubs > 1 ? 's' : ''}`);
      return;
    }

    saveHubSelection.mutate({ hubs: selectedHubs });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isLocked ? "Your Selected Specialized Hubs" : "Choose Your Specialized Hubs"}
          </DialogTitle>
          <DialogDescription>
            {isLocked ? (
              <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-500 mt-2">
                <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Your hub selection is locked until your subscription ends. You'll be able to change your selection when you renew.
                </span>
              </div>
            ) : (
              <>
                Select {maxHubs} specialized hub{maxHubs > 1 ? 's' : ''} to access with your {userTier} plan.
                <br />
                <strong>Note:</strong> Once selected, your hubs will be locked until your subscription ends.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {Object.entries(SPECIALIZED_HUBS).map(([hubId, hubInfo]) => {
            const Icon = HUB_ICONS[hubId as SpecializedHub];
            const isSelected = selectedHubs.includes(hubId as SpecializedHub);
            const canSelect = !isLocked && (isSelected || selectedHubs.length < maxHubs);

            return (
              <Card
                key={hubId}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : canSelect
                    ? "hover:border-primary/50"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={() => canSelect && toggleHub(hubId as SpecializedHub)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">{hubInfo.name}</CardTitle>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {hubInfo.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {!isLocked && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>
                Selected: {selectedHubs.length} / {maxHubs}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={selectedHubs.length === 0 || selectedHubs.length > maxHubs || saveHubSelection.isPending}
              >
                {saveHubSelection.isPending ? "Saving..." : "Save Selection"}
              </Button>
            </div>
          </div>
        )}

        {isLocked && (
          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
