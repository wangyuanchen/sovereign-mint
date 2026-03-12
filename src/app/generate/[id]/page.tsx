"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Lock, Unlock, ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { ContentPreview } from "@/components/content-preview";
import { PaymentModal } from "@/components/payment-modal";
import { DownloadButton } from "@/components/download-button";
import { useAuth } from "@/hooks/use-auth";

interface Generation {
  id: string;
  projectName: string;
  outputMarkdown: string | null;
  outputType: "whitepaper" | "landing_page";
  isUnlocked: boolean;
  createdAt: string;
}

export default function GenerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isConnected } = useAccount();
  const { user, authenticate } = useAuth();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && !user) {
      authenticate();
    }
  }, [isConnected, user, authenticate]);

  useEffect(() => {
    const fetchGeneration = async () => {
      try {
        const response = await fetch(`/api/generations/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch generation");
        }
        const data = await response.json();
        setGeneration(data);
      } catch (error) {
        toast.error("Failed to load generation");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeneration();
  }, [id, router]);

  const handleCopyContent = async () => {
    if (!generation?.outputMarkdown) return;
    await navigator.clipboard.writeText(generation.outputMarkdown);
    setCopied(true);
    toast.success("Content copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSuccess = () => {
    setGeneration((prev) => (prev ? { ...prev, isUnlocked: true } : prev));
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Generation Not Found</h1>
        <p className="text-zinc-400 mb-8">
          The generation you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{generation.projectName}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant={generation.isUnlocked ? "default" : "secondary"}
              className={generation.isUnlocked ? "bg-green-500" : ""}
            >
              {generation.isUnlocked ? (
                <>
                  <Unlock className="h-3 w-3 mr-1" />
                  Unlocked
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </>
              )}
            </Badge>
            <Badge variant="outline">
              {generation.outputType === "whitepaper"
                ? "Whitepaper"
                : "Landing Page"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-3">
          {generation.isUnlocked && (
            <>
              <Button variant="outline" onClick={handleCopyContent}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              {generation.outputType === "whitepaper" && (
                <DownloadButton
                  generationId={generation.id}
                  projectName={generation.projectName}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Generated Content</CardTitle>
        </CardHeader>
        <CardContent>
          {generation.outputMarkdown ? (
            <div className="relative">
              <ContentPreview
                content={generation.outputMarkdown}
                isUnlocked={generation.isUnlocked}
                outputType={generation.outputType}
              />

              {!generation.isUnlocked && (
                <div className="absolute inset-0 top-[30%] flex items-center justify-center pointer-events-none">
                  <div className="text-center pointer-events-auto">
                    <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg p-8 shadow-2xl">
                      <Lock className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        Unlock Full Content
                      </h3>
                      <p className="text-zinc-400 mb-6 max-w-md">
                        Pay with USDT to unlock the complete whitepaper and
                        download as PDF.
                      </p>
                      <Button
                        size="lg"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        Unlock Now
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <p>Content is being generated...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
