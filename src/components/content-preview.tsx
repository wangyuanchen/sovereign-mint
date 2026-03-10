"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ContentPreviewProps {
  content: string;
  isUnlocked: boolean;
  outputType: "whitepaper" | "landing_page";
}

export function ContentPreview({
  content,
  isUnlocked,
  outputType,
}: ContentPreviewProps) {
  // Calculate blur cutoff (30% of content visible)
  const previewLength = Math.floor(content.length * 0.3);
  const previewContent = isUnlocked ? content : content.slice(0, previewLength);

  if (outputType === "landing_page") {
    return (
      <div className="relative">
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <iframe
            srcDoc={isUnlocked ? content : content}
            className="w-full h-[600px] bg-white"
            title="Landing Page Preview"
          />
        </div>
        {!isUnlocked && (
          <div className="absolute inset-0 top-[30%] bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-md" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <article
        className={cn(
          "prose prose-invert prose-zinc max-w-none",
          "prose-headings:text-white prose-headings:font-bold",
          "prose-p:text-zinc-300 prose-p:leading-relaxed",
          "prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
          "prose-strong:text-white",
          "prose-code:text-blue-300 prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded",
          "prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700",
          "prose-blockquote:border-blue-500 prose-blockquote:text-zinc-400",
          "prose-ul:text-zinc-300 prose-ol:text-zinc-300",
          "prose-li:marker:text-zinc-500"
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {previewContent}
        </ReactMarkdown>
      </article>

      {!isUnlocked && (
        <div className="absolute inset-0 top-[30%] bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-md" />
        </div>
      )}
    </div>
  );
}
