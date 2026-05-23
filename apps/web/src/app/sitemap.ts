import type { MetadataRoute } from "next";

// `output: 'export'` needs an explicit opt-in for the sitemap so it
// lands at apps/web/out/sitemap.xml as part of the static bundle.
export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = "https://spcx-s1.com";

// Single-page app — one canonical URL. The 11 stages live as scroll
// sections on the same document so the sitemap doesn't enumerate
// `#stage-N` anchors (most crawlers ignore the fragment anyway).
// No language alternates here for the same reason `layout.tsx` only
// emits a canonical link: locale selection is client-side so en/zh
// would point at the same href, which Search Console flags as
// "hreflang return tags pointing to the same URL". Add real
// alternates once distinct per-locale URLs exist.
// `lastModified` follows the build timestamp rather than the source
// snapshot date so a content republish re-warms crawler caches.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
