"use client";

import Link from "next/link";
import { FileText, Github, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <FileText className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">Sovereign Mint</span>
            </Link>
            <p className="text-zinc-400 text-sm max-w-md">
              {t("description")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("product")}</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/generate" className="hover:text-white transition-colors">
                  {tNav("generate")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  {tNav("pricing")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {tNav("dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("connect")}</h4>
            <div className="flex gap-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <span className="text-lg font-bold">𝕏</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-sm text-zinc-500">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
