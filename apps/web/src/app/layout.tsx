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
  // Single canonical URL, no hreflang cluster: locale selection is
  // client-side (one document switches via the persistent shell
  // toggle), so en/zh would resolve to the same href. Search engines
  // treat a same-href hreflang cluster as invalid and may ignore the
  // whole alternates block, so we keep just the canonical.
  alternates: {
    canonical: SITE_URL,
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

// Inline script that flips `document.documentElement.lang` to the
// persisted locale before React hydrates. Without this, returning
// zh-locale visitors briefly see `<html lang="en">` until the Shell
// effect catches up — which mis-cues screen readers and CJK font
// shaping. Reads from the same `spcx-ui` key zustand's persist
// middleware writes; bails silently on any parse/storage error so
// the static-export HTML never throws at startup. Mirror this script
// when the persist key in uiStore.ts changes.
const SET_LANG_BEFORE_HYDRATE = `try{var r=localStorage.getItem('spcx-ui');if(r){var s=JSON.parse(r);var l=s&&s.state&&s.state.locale;if(l&&typeof l==='string'){document.documentElement.lang=l;}}}catch(e){}`;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: SET_LANG_BEFORE_HYDRATE }} />
      </head>
      <body>
        <SkipLink />
        <Shell />
        {children}
      </body>
    </html>
  );
}
