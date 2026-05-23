import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Shell } from "../components/Shell/Shell";
import { SkipLink } from "../components/Shell/SkipLink";
import "./globals.css";

const SITE_URL = "https://spcx-s1.com";
const TITLE = "SpaceX S-1 Interactive";
const DESCRIPTION =
  "A source-bound, scroll-driven first-person reading of SpaceX's May 2026 Form S-1, written as a launch sequence. Every line traces back to the SEC filing.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${TITLE}`,
  },
  description: DESCRIPTION,
  applicationName: TITLE,
  generator: "Next.js",
  keywords: [
    "SpaceX",
    "S-1",
    "IPO",
    "prospectus",
    "Falcon 9",
    "Starship",
    "Starlink",
    "xAI",
    "Grok",
    "SEC filing",
    "招股说明书",
  ],
  authors: [{ name: "Kros Dai", url: "https://github.com/xdanger" }],
  creator: "Kros Dai",
  publisher: "Kros Dai",
  category: "finance",
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: SITE_URL,
      zh: SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    url: SITE_URL,
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@xdanger",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
  colorScheme: "dark",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <Shell />
        {children}
      </body>
    </html>
  );
}
