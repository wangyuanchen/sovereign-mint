"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { FileText, Sparkles, LayoutDashboard, DollarSign } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/hooks/use-auth";
import { formatQuota } from "@/lib/utils";
import { useEffect } from "react";

export function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { isConnected } = useAccount();
  const { user, authenticate } = useAuth();

  useEffect(() => {
    if (isConnected && !user) {
      authenticate();
    }
  }, [isConnected, user, authenticate]);

  const remainingGenerations = user
    ? formatQuota(user.usedThisMonth, user.monthlyQuota, user.boostCredits)
    : "0";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">Sovereign Mint</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/generate"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              {t("generate")}
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("dashboard")}
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              {t("pricing")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLocale={locale} />
          {isConnected && user && (
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-200">
              {remainingGenerations} {tCommon("credits")}
            </Badge>
          )}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </div>
    </header>
  );
}
