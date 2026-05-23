import type { MetadataRoute } from "next";

// `output: 'export'` requires the route to opt into static generation
// explicitly so Next.js emits robots.txt as a file under apps/web/out/
// instead of trying to serve it via a runtime handler.
export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = "https://spcx-s1.com";

// Allow every crawler. The site is a single static page with no
// private routes; the only guard is the `noai` request below, which
// asks AI training crawlers to skip the source-bound prose. Standard
// search engines and social-card scrapers (Twitter, Slack, etc.) are
// allowed to fetch everything.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: ["GPTBot", "Google-Extended", "CCBot", "ClaudeBot", "anthropic-ai"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
