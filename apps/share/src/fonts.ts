import erode400Italic from "../../superthread/public/fonts/erode-400-italic.woff2";
import erode400 from "../../superthread/public/fonts/erode-400.woff2";
import erode500 from "../../superthread/public/fonts/erode-500.woff2";
import erode600 from "../../superthread/public/fonts/erode-600.woff2";
import fragmentMono400 from "../../superthread/public/fonts/fragment-mono-400.woff2";
import supreme400 from "../../superthread/public/fonts/supreme-400.woff2";
import supreme500 from "../../superthread/public/fonts/supreme-500.woff2";
import unbounded300 from "../../superthread/public/fonts/unbounded-300.woff2";
import unbounded400 from "../../superthread/public/fonts/unbounded-400.woff2";

// A sandboxed page requests fonts as `Origin: null`, which superthread's font host refuses for Supreme and Erode, so
// this Worker carries the faces itself and answers that one origin. Artifacts and the PIN page load them from here.
const faces = new Map<string, Uint8Array>([
  ["erode-400-italic.woff2", erode400Italic],
  ["erode-400.woff2", erode400],
  ["erode-500.woff2", erode500],
  ["erode-600.woff2", erode600],
  ["fragment-mono-400.woff2", fragmentMono400],
  ["supreme-400.woff2", supreme400],
  ["supreme-500.woff2", supreme500],
  ["unbounded-300.woff2", unbounded300],
  ["unbounded-400.woff2", unbounded400],
]);

export function fontResponse(request: Request, path: string) {
  const face = faces.get(path.slice("/_fonts/".length));
  if (!face || (request.method !== "GET" && request.method !== "HEAD")) return null;
  return new Response(face, {
    headers: {
      "Content-Type": "font/woff2",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "null",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
