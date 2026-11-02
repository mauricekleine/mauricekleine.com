import { cn } from "@/components/superthread/lib/utils";

// The notched 16-cell tile. A drawing sits in the same path, so it knocks out of the tile and the surface shows through
// it: one ink prints the whole mark, on any fill and through any hover.
const TILE = "M1 0h14v1h1v14h-1v1h-14v-1h-1v-14h1z";

// The frame a third-party mark prints in: 96 px, or 80 px on a phone, which keeps the 16 cells on whole pixels, always in
// the first ink. d and hover are the drawing's two frames, each made of whole cells that never overlap and stay inside the
// tile, because the knock-out is even-odd. The second frame cuts in with no transition while the pointer or the visible
// focus is inside the nearest group/source-mark: the mark itself, or a tile. held keeps it up for a moment that settles
// on it. The words beside a mark carry its meaning, so it stays hidden from readers unless it's labelled.
function SourceMark({
  d,
  hover,
  held,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "children"> & { d: string; hover?: string; held?: boolean }) {
  const named = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
  const second = held
    ? { rest: "hidden", hover: undefined }
    : {
        rest: "group-hover/source-mark:hidden group-has-[:focus-visible]/source-mark:hidden",
        hover: "hidden group-hover/source-mark:inline group-has-[:focus-visible]/source-mark:inline",
      };
  return (
    <svg
      data-mk="source-mark"
      data-slot="source-mark"
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      fill="currentColor"
      fillRule="evenodd"
      role={named ? "img" : undefined}
      aria-hidden={named ? undefined : true}
      className={cn("group/source-mark block size-24 shrink-0 text-first [@media(max-width:600px)]:size-20", className)}
      {...props}
    >
      <path d={`${TILE}${d}`} className={hover === undefined ? undefined : second.rest} />
      {hover !== undefined && <path d={`${TILE}${hover}`} className={second.hover} />}
    </svg>
  );
}

export { SourceMark };
