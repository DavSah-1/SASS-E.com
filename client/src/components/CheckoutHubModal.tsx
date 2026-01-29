import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { SPECIALIZED_HUBS } from "../../../shared/hubs";

interface CheckoutHubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: "starter" | "pro" | "ultimate";
  billingPeriod: "monthly" | "six_month" | "annual";
  onConfirm: (selectedHubs: string[]) => void;
  isLoading?: boolean;
}

export function CheckoutHubModal({
  open,
  onOpenChange,
  tier,
  billingPeriod,
  onConfirm,
  isLoading = false,
}: CheckoutHubModalProps) {
  const [selectedHubs, setSelectedHubs] = useState<string[]>([]);

  const maxHubs = tier === "starter" ? 1 : tier === "pro" ? 2 : SPECIALIZED_HUBS.length;
  const canSelectMore = selectedHubs.length < maxHubs;

  const toggleHub = (hubId: string) => {
    if (selectedHubs.includes(hubId)) {
      setSelectedHubs(selectedHubs.filter(id => id !== hubId));
    } else if (canSelectMore) {
      setSelectedHubs([...selectedHubs, hubId]);
    }
  };

  const handleConfirm = () => {
    if (selectedHubs.length === maxHubs || tier === "ultimate") {
      onConfirm(selectedHubs);
    }
  };

  const isValid = tier === "ultimate" || selectedHubs.length === maxHubs;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Specialized Hubs</DialogTitle>
          <DialogDescription className="text-base">
            {tier === "starter" && (
              <>
                Select <strong>1 specialized hub</strong> to focus on with your Starter plan.
              </>
            )}
            {tier === "pro" && (
              <>
                Select <strong>2 specialized hubs</strong> to unlock with your Pro plan.
              </>
            )}
            {tier === "ultimate" && (
              <>
                Your Ultimate plan includes <strong>all specialized hubs</strong>! Click Continue to proceed.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {tier !== "ultimate" && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Selected: {selectedHubs.length} / {maxHubs}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPECIALIZED_HUBS.map((hub) => {
              const isSelected = selectedHubs.includes(hub.id);
              const isDisabled = !isSelected && !canSelectMore && tier !== "ultimate";

              return (
                <Card
                  key={hub.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-primary bg-primary/5"
                      : isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : tier === "ultimate"
                      ? "border-primary/30 bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => !isDisabled && tier !== "ultimate" && toggleHub(hub.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{hub.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{hub.name}</CardTitle>
                        </div>
                      </div>
                      {isSelected && tier !== "ultimate" && (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Selected
                        </Badge>
                      )}
                      {tier === "ultimate" && (
                        <Badge variant="secondary">Included</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{hub.description}</CardDescription>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {hub.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                Continue to Checkout
                {tier !== "ultimate" && ` (${selectedHubs.length}/${maxHubs} selected)`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
