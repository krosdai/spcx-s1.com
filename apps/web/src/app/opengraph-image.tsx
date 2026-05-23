import { ImageResponse } from "next/og";

// `output: 'export'` requires the OG route to opt into static
// rendering explicitly so Next.js emits the PNG into apps/web/out/
// at build time instead of trying to serve it from a runtime
// handler. `revalidate: false` makes it a pure build-time asset.
export const dynamic = "force-static";
export const revalidate = false;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SpaceX S-1 Interactive — A source-bound visualization of the May 2026 S-1.";

// Renders the canonical share card at build time. ImageResponse runs
// during the static export so the PNG is committed to apps/web/out/
// and served alongside the rest of the static bundle. We stick to
// system fonts here — pulling Inter from @fontsource at this layer
// would need an extra fetch-the-bytes round-trip that's not worth the
// complexity for an OG card. The minimalist palette (near-black bg,
// white type, single teal accent line) matches the visual restraint
// rule from AGENTS.md §3.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#050505",
        color: "#F2F2F2",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#1D9E75" }}>
        <span
          style={{
            fontSize: 18,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          T − 0
        </span>
        <span
          style={{
            display: "flex",
            width: 8,
            height: 8,
            background: "#1D9E75",
            borderRadius: 999,
          }}
        />
        <span
          style={{
            fontSize: 16,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#8C8C8C",
          }}
        >
          Mission Briefing
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <span
          style={{
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
          }}
        >
          SpaceX S-1
        </span>
        <span style={{ fontSize: 32, color: "#C8C8C8", lineHeight: 1.3 }}>
          A source-bound, scroll-driven reading of SpaceX's May 2026 Form S-1 — written as a
          launch sequence.
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 18,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#8C8C8C",
        }}
      >
        <span>spcx-s1.com</span>
        <span>Fan project · MIT licensed</span>
      </div>
    </div>,
    size,
  );
}
