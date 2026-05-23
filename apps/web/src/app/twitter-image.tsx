// Twitter accepts the same large-summary card shape as Open Graph, so
// the Twitter preview reuses the canonical generator from
// `opengraph-image.tsx`. Next.js rejects re-exports of the route
// segment config fields (`dynamic`, `revalidate`), so we declare them
// locally and only re-export the renderer plus its image-shape
// metadata.
import OpengraphImage, {
  size as opengraphSize,
  contentType as opengraphContentType,
  alt as opengraphAlt,
} from "./opengraph-image";

export const dynamic = "force-static";
export const revalidate = false;
export const size = opengraphSize;
export const contentType = opengraphContentType;
export const alt = opengraphAlt;

export default OpengraphImage;
