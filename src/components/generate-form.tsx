"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { generateFormSchema, type GenerateFormData } from "@/lib/validations";
import { FREE_MODELS, PAID_MODELS, DEFAULT_FREE_MODEL } from "@/lib/models";
import { useAuth } from "@/hooks/use-auth";

export function GenerateForm() {
  const t = useTranslations("generate");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const STEPS = [
    { id: 1, title: t("steps.basics") },
    { id: 2, title: t("steps.token") },
    { id: 3, title: t("steps.team") },
    { id: 4, title: t("steps.roadmap") },
    { id: 5, title: t("steps.output") },
  ];

  const form = useForm({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      projectName: "",
      tagline: "",
      description: "",
      problemStatement: "",
      solution: "",
      targetAudience: "",
      hasToken: false,
      tokenName: "",
      tokenSymbol: "",
      totalSupply: "",
      tokenDistribution: "",
      tokenUtility: "",
      teamMembers: [],
      roadmap: [],
      model: DEFAULT_FREE_MODEL,
      outputType: "whitepaper",
      language: "english",
    },
  });

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
  } = useFieldArray({
    control: form.control,
    name: "teamMembers",
  });

  const {
    fields: roadmapFields,
    append: appendRoadmap,
    remove: removeRoadmap,
  } = useFieldArray({
    control: form.control,
    name: "roadmap",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      const generationId = response.headers.get("X-Generation-Id");
      
      // Read the stream (for progress)
      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }

      toast.success(tCommon("success"));
      router.push(`/generate/${generationId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex flex-col items-center ${
                s.id === step ? "text-blue-500" : s.id < step ? "text-green-500" : "text-zinc-500"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  s.id === step
                    ? "border-blue-500 bg-blue-500/10"
                    : s.id < step
                    ? "border-green-500 bg-green-500/10"
                    : "border-zinc-700"
                }`}
              >
                {s.id}
              </div>
              <span className="text-xs mt-2 hidden md:block">{s.title}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 h-1 bg-zinc-800 w-full rounded" />
          <div
            className="absolute top-0 left-0 h-1 bg-blue-500 rounded transition-all"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Basics */}
        {step === 1 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>{t("steps.basics")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">{t("form.projectName")} *</Label>
                <Input
                  id="projectName"
                  {...form.register("projectName")}
                  placeholder={t("form.projectNamePlaceholder")}
                  className="bg-zinc-800 border-zinc-700"
                />
                {form.formState.errors.projectName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.projectName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tagline">{t("form.tagline")}</Label>
                <Input
                  id="tagline"
                  {...form.register("tagline")}
                  placeholder={t("form.taglinePlaceholder")}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div>
                <Label htmlFor="description">{t("form.description")} *</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder={t("form.descriptionPlaceholder")}
                  rows={5}
                  className="bg-zinc-800 border-zinc-700"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="problemStatement">{t("form.problemStatement")}</Label>
                <Textarea
                  id="problemStatement"
                  {...form.register("problemStatement")}
                  placeholder={t("form.problemStatementPlaceholder")}
                  rows={3}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div>
                <Label htmlFor="solution">{t("form.solution")}</Label>
                <Textarea
                  id="solution"
                  {...form.register("solution")}
                  placeholder={t("form.solutionPlaceholder")}
                  rows={3}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">{t("form.targetAudience")}</Label>
                <Input
                  id="targetAudience"
                  {...form.register("targetAudience")}
                  placeholder={t("form.targetAudiencePlaceholder")}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Token */}
        {step === 2 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>{t("steps.token")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasToken"
                  {...form.register("hasToken")}
                  className="rounded bg-zinc-800 border-zinc-700"
                />
                <Label htmlFor="hasToken">{t("form.hasToken")}</Label>
              </div>

              {form.watch("hasToken") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tokenName">{t("form.tokenName")}</Label>
                      <Input
                        id="tokenName"
                        {...form.register("tokenName")}
                        placeholder={t("form.tokenNamePlaceholder")}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tokenSymbol">{t("form.tokenSymbol")}</Label>
                      <Input
                        id="tokenSymbol"
                        {...form.register("tokenSymbol")}
                        placeholder={t("form.tokenSymbolPlaceholder")}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="totalSupply">{t("form.totalSupply")}</Label>
                    <Input
                      id="totalSupply"
                      {...form.register("totalSupply")}
                      placeholder={t("form.totalSupplyPlaceholder")}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tokenDistribution">{t("form.tokenDistribution")}</Label>
                    <Textarea
                      id="tokenDistribution"
                      {...form.register("tokenDistribution")}
                      placeholder={t("form.tokenDistributionPlaceholder")}
                      rows={3}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tokenUtility">{t("form.tokenUtility")}</Label>
                    <Textarea
                      id="tokenUtility"
                      {...form.register("tokenUtility")}
                      placeholder={t("form.tokenUtilityPlaceholder")}
                      rows={3}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Team */}
        {step === 3 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("steps.team")}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendTeam({ name: "", role: "", background: "" })}
              >
                <Plus className="h-4 w-4 mr-1" /> {t("form.addMember")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamFields.length === 0 && (
                <p className="text-zinc-500 text-sm">{t("form.noTeamMembers")}</p>
              )}
              {teamFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-zinc-800 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">{t("form.memberName")} {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeam(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{t("form.memberName")}</Label>
                      <Input
                        {...form.register(`teamMembers.${index}.name`)}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label>{t("form.memberRole")}</Label>
                      <Input
                        {...form.register(`teamMembers.${index}.role`)}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t("form.memberBackground")}</Label>
                    <Input
                      {...form.register(`teamMembers.${index}.background`)}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Roadmap */}
        {step === 4 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("steps.roadmap")}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendRoadmap({ quarter: "", year: "", milestones: "" })}
              >
                <Plus className="h-4 w-4 mr-1" /> {t("form.addPhase")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {roadmapFields.length === 0 && (
                <p className="text-zinc-500 text-sm">{t("form.noRoadmapPhases")}</p>
              )}
              {roadmapFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-zinc-800 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Phase {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRoadmap(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{t("form.quarter")}</Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue(`roadmap.${index}.quarter`, value)
                        }
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder={t("form.selectQuarter")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1">Q1</SelectItem>
                          <SelectItem value="Q2">Q2</SelectItem>
                          <SelectItem value="Q3">Q3</SelectItem>
                          <SelectItem value="Q4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t("form.year")}</Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue(`roadmap.${index}.year`, value)
                        }
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder={t("form.selectYear")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{t("form.milestones")}</Label>
                    <Textarea
                      {...form.register(`roadmap.${index}.milestones`)}
                      placeholder={t("form.milestonesPlaceholder")}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 5: Output */}
        {step === 5 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>{t("steps.output")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Model Selection */}
              <div>
                <Label className="mb-3 block">{t("form.model")}</Label>
                <div className="space-y-3">
                  <div className="text-sm text-zinc-400 mb-2">{t("form.freeModels")}</div>
                  <div className="grid gap-2">
                    {FREE_MODELS.map((model) => (
                      <div
                        key={model.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          form.watch("model") === model.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                        onClick={() => form.setValue("model", model.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{model.name}</span>
                            <span className="text-zinc-500 text-sm ml-2">({model.provider})</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            {t("form.free")}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">{model.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm text-zinc-400 mt-4 mb-2">
                    {t("form.paidModels")}
                    {!user?.hasPaidAccess && (
                      <span className="text-amber-400 ml-2">({t("form.requiresUnlock")})</span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {PAID_MODELS.map((model) => (
                      <div
                        key={model.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          !user?.hasPaidAccess
                            ? "opacity-50 cursor-not-allowed border-zinc-800"
                            : form.watch("model") === model.id
                            ? "border-blue-500 bg-blue-500/10 cursor-pointer"
                            : "border-zinc-700 hover:border-zinc-600 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (user?.hasPaidAccess) {
                            form.setValue("model", model.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{model.name}</span>
                            <span className="text-zinc-500 text-sm ml-2">({model.provider})</span>
                          </div>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                            PRO
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">{model.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">{t("form.outputType")}</Label>
                <RadioGroup
                  defaultValue="whitepaper"
                  onValueChange={(value) =>
                    form.setValue("outputType", value as "whitepaper" | "landing_page")
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whitepaper" id="whitepaper" />
                    <Label htmlFor="whitepaper" className="cursor-pointer">
                      {t("form.whitepaper")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landing_page" id="landing_page" />
                    <Label htmlFor="landing_page" className="cursor-pointer">
                      {t("form.landingPage")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="language" className="mb-3 block">
                  {t("form.language")}
                </Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("language", value as "english" | "chinese" | "both")
                  }
                  defaultValue="english"
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full md:w-64">
                    <SelectValue placeholder={t("form.language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">{t("form.english")}</SelectItem>
                    <SelectItem value="chinese">{t("form.chinese")}</SelectItem>
                    <SelectItem value="both">{t("form.both")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> {tCommon("previous")}
          </Button>

          {step < 5 ? (
            <Button type="button" onClick={nextStep}>
              {tCommon("next")} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("form.generating")}
                </>
              ) : (
                <>
                  {t("form.generateButton")} <Sparkles className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
