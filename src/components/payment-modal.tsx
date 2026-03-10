"use client";

import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { Check, Loader2, Unlock, Package } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { usePayment } from "@/hooks/use-payment";
import { PRICING, BASE_CHAIN_ID, type PlanType } from "@/lib/contracts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PaymentModal({ open, onOpenChange, onSuccess }: PaymentModalProps) {
  const t = useTranslations("payment");
  const tPricing = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { pay, isPaying } = usePayment();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    user?.hasPaidAccess ? "boost" : "unlock"
  );

  const PLANS: { id: PlanType; name: string; icon: typeof Unlock; features: string[]; popular?: boolean }[] = [
    {
      id: "unlock",
      name: tPricing("plans.unlock.name"),
      icon: Unlock,
      features: tPricing.raw("plans.unlock.features") as string[],
      popular: !user?.hasPaidAccess,
    },
    {
      id: "boost",
      name: tPricing("plans.boost.name"),
      icon: Package,
      features: tPricing.raw("plans.boost.features") as string[],
      popular: user?.hasPaidAccess,
    },
  ];

  // Filter plans based on user status
  const availablePlans = user?.hasPaidAccess 
    ? PLANS.filter(p => p.id === "boost") 
    : PLANS;

  const handlePayment = async () => {
    if (!address) {
      toast.error(tCommon("connectWallet"));
      return;
    }

    // Switch to Base if needed
    if (chainId !== BASE_CHAIN_ID) {
      try {
        await switchChain({ chainId: BASE_CHAIN_ID });
      } catch {
        toast.error("Please switch to Base network");
        return;
      }
    }

    const success = await pay(selectedPlan, address);
    if (success) {
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("title")}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className={`grid grid-cols-1 ${availablePlans.length > 1 ? 'md:grid-cols-2' : ''} gap-4 mt-4`}>
          {availablePlans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const price = PRICING[plan.id];

            return (
              <Card
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "relative p-4 cursor-pointer transition-all border-2",
                  isSelected
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-xs px-2 py-0.5 rounded-full font-medium">
                    {tPricing("mostPopular")}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">{plan.name}</span>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-zinc-400 text-sm ml-1">USDC</span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <div className="absolute top-2 left-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handlePayment} disabled={isPaying}>
            {isPaying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("processing")}
              </>
            ) : (
              <>{t("payButton", { amount: PRICING[selectedPlan] })}</>
            )}
          </Button>
        </div>

        <p className="text-xs text-zinc-500 text-center mt-2">
          {t("notice")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
