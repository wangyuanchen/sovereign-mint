"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Wallet,
  FileText,
  Layout,
  Lock,
  Unlock,
  Clock,
  Plus,
  Eye,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/hooks/use-auth";
import { formatQuota, getRemainingGenerations } from "@/lib/utils";

interface Generation {
  id: string;
  projectName: string;
  outputType: "whitepaper" | "landing_page";
  isUnlocked: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { isConnected } = useAccount();
  const { user, authenticate } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && !user) {
      authenticate();
    }
  }, [isConnected, user, authenticate]);

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        const response = await fetch("/api/generations");
        if (response.ok) {
          const data = await response.json();
          setGenerations(data);
        }
      } catch (error) {
        console.error("Failed to fetch generations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      fetchGenerations();
    } else {
      setIsLoading(false);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{tCommon("connectWallet")}</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            {t("subtitle")}
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-zinc-400">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg">
              <span className="text-zinc-400 text-sm">{tCommon("credits")}:</span>
              <span className="font-bold">{formatQuota(user.usedThisMonth, user.monthlyQuota, user.boostCredits)}</span>
            </div>
          )}
          <Link href="/generate">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("newGeneration")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">{t("totalGenerations")}</p>
                <p className="text-2xl font-bold">{generations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Unlock className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">{t("unlockedCount")}</p>
                <p className="text-2xl font-bold">
                  {generations.filter((g) => g.isUnlocked).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">{t("creditsRemaining")}</p>
                <p className="text-2xl font-bold">
                  {user ? formatQuota(user.usedThisMonth, user.monthlyQuota, user.boostCredits) : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generations List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>{t("yourGenerations")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("noGenerations")}</h3>
              <p className="text-zinc-400 mb-6">
                {t("noGenerationsSubtitle")}
              </p>
              <Link href="/generate">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("startGenerating")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {generations.map((generation) => (
                <div
                  key={generation.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                      {generation.outputType === "whitepaper" ? (
                        <FileText className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Layout className="h-5 w-5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{generation.projectName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span className="text-xs text-zinc-500">
                          {new Date(generation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={generation.isUnlocked ? "default" : "secondary"}
                      className={generation.isUnlocked ? "bg-green-500/20 text-green-400" : ""}
                    >
                      {generation.isUnlocked ? tCommon("unlocked") : tCommon("locked")}
                    </Badge>
                    <Link href={`/generate/${generation.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        {tCommon("view")}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
