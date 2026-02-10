import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbeddedCheckoutModalProps {
  clientSecret: string;
  isOpen: boolean;
  onClose: () => void;
}

// Initialize Stripe with custom publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export function EmbeddedCheckoutModal({ clientSecret, isOpen, onClose }: EmbeddedCheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !clientSecret) return;

    const initializeCheckout = async () => {
      setIsLoading(true);
      
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          console.error("Stripe failed to load");
          return;
        }

        // Mount the embedded checkout
        const checkout = await stripe.initEmbeddedCheckout({
          clientSecret,
        });

        // Mount to the container
        const container = document.getElementById("embedded-checkout-container");
        if (container) {
          checkout.mount("#embedded-checkout-container");
          setIsLoading(false);
        }

        // Cleanup function
        return () => {
          checkout.destroy();
        };
      } catch (error) {
        console.error("Failed to initialize embedded checkout:", error);
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, [clientSecret, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto bg-slate-900 border-purple-500/20 p-0">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <p className="text-purple-200">Loading checkout...</p>
            </div>
          </div>
        )}

        {/* Embedded checkout container */}
        <div id="embedded-checkout-container" className="w-full min-h-[500px]" />
      </DialogContent>
    </Dialog>
  );
}
