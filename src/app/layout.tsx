import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { Web3Provider } from "@/providers/web3-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sovereign Mint - Generate Web3 Whitepapers & Landing Pages",
  description:
    "Generate professional Web3 whitepapers and landing pages with AI. Launch your crypto project with confidence.",
  keywords: ["whitepaper", "web3", "crypto", "blockchain", "AI", "landing page"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <Web3Provider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="bottom-right" theme="dark" />
          </Web3Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
