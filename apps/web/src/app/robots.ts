import type { MetadataRoute } from "next";

// `output: 'export'` requires the route to opt into static generation
// explicitly so Next.js emits robots.txt as a file under apps/web/out/
// instead of trying to serve it via a runtime handler.
export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = "https://spcx-s1.com";

// Standard search engines and social-card scrapers (Twitter, Slack,
// etc.) are allowed under the wildcard rule. The listed
// LLM-training agents are hard-disallowed via per-agent
// `Disallow: /` groups so they skip the source-bound prose entirely
// (most-specific group wins for those user agents). `ClaudeBot`
// covers current Anthropic crawling — the legacy `anthropic-ai`
// token was retired and is intentionally omitted.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: ["GPTBot", "Google-Extended", "CCBot", "ClaudeBot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
