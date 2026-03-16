"use client";

import Link from "next/link";
import { Check, Zap, Unlock, Package } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING } from "@/lib/contracts";

export default function PricingPage() {
  const t = useTranslations("pricing");

  const PLANS = [
    {
      id: "free",
      name: t("plans.free.name"),
      price: 0,
      icon: Zap,
      description: t("plans.free.description"),
      features: t.raw("plans.free.features") as string[],
      priceLabel: t("perMonth"),
    },
    {
      id: "unlock",
      name: t("plans.unlock.name"),
      price: PRICING.unlock,
      icon: Unlock,
      description: t("plans.unlock.description"),
      features: t.raw("plans.unlock.features") as string[],
      popular: true,
      priceLabel: t("oneTime"),
    },
    {
      id: "boost",
      name: t("plans.boost.name"),
      price: PRICING.boost,
      icon: Package,
      description: t("plans.boost.description"),
      features: t.raw("plans.boost.features") as string[],
      priceLabel: t("oneTime"),
      isBoost: true,
    },
  ];

  const FAQ = [
    { q: t("faq.q1.question"), a: t("faq.q1.answer") },
    { q: t("faq.q2.question"), a: t("faq.q2.answer") },
    { q: t("faq.q3.question"), a: t("faq.q3.answer") },
    { q: t("faq.q4.question"), a: t("faq.q4.answer") },
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={`relative overflow-visible bg-zinc-900 border-2 ${
                plan.popular
                  ? "border-blue-500 shadow-lg shadow-blue-500/20"
                  : "border-zinc-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute z-10 -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-sm px-4 py-1 rounded-full font-medium whitespace-nowrap">
                  {t("mostPopular")}
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-zinc-400 text-sm mt-2">{plan.description}</p>
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <span className="text-5xl font-bold">$0</span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-zinc-400 ml-2">USDT</span>
                    </>
                  )}
                  <div className="text-zinc-500 text-sm mt-1">{plan.priceLabel}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/generate" className="block">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.isBoost ? t("buyBoost") : t("getStarted")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t("faq.title")}
        </h2>
        <div className="space-y-6">
          {FAQ.map((item, index) => (
            <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-zinc-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
