"use client";

import Link from "next/link";
import {
  FileText,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const t = useTranslations("home");

  const FEATURES = [
    {
      icon: Zap,
      title: t("features.ai.title"),
      description: t("features.ai.description"),
    },
    {
      icon: Shield,
      title: t("features.web3.title"),
      description: t("features.web3.description"),
    },
    {
      icon: Globe,
      title: t("features.language.title"),
      description: t("features.language.description"),
    },
    {
      icon: FileText,
      title: t("features.pdf.title"),
      description: t("features.pdf.description"),
    },
  ];

  const STEPS = [
    {
      step: 1,
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
    },
    {
      step: 2,
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
    },
    {
      step: 3,
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
    },
    {
      step: 4,
      title: t("howItWorks.step4.title"),
      description: t("howItWorks.step4.description"),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">
                {t("badge")}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t("title1")}{" "}
              <span className="gradient-text">{t("title2")}</span>
              <br />{t("title3")}
            </h1>

            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/generate">
                <Button size="lg" className="text-lg px-8">
                  {t("cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  {t("viewPricing")}
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                {t("noSubscription")}
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                {t("payPerGeneration")}
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                {t("usdcOnBase")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("features.title")}
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-zinc-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 border-t border-zinc-800 bg-zinc-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("howItWorks.title")}</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.step} className="relative">
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent" />
                )}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-500">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("cta2.title")}
            </h2>
            <p className="text-zinc-400 mb-8">
              {t("cta2.subtitle")}
            </p>
            <Link href="/generate">
              <Button size="lg" className="text-lg px-8">
                {t("cta2.button")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
