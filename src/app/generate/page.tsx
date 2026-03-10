"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

import { GenerateForm } from "@/components/generate-form";
import { useAuth } from "@/hooks/use-auth";

export default function GeneratePage() {
  const t = useTranslations("generate");
  const { isConnected } = useAccount();
  const { user, authenticate } = useAuth();

  useEffect(() => {
    if (isConnected && !user) {
      authenticate();
    }
  }, [isConnected, user, authenticate]);

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("connectWallet.title")}</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            {t("connectWallet.subtitle")}
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {t("title")}
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <GenerateForm />
    </div>
  );
}
