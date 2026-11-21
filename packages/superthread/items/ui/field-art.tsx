"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import type { FieldMask } from "@/components/superthread/lib/field-core";
import { mountField } from "@/components/superthread/lib/field-live";

type FieldArtProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  spec: string;
  mask?: FieldMask;
  playing?: boolean;
};

export function FieldArt({ spec, mask, playing = false, style, ...props }: FieldArtProps) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (host.current) return mountField(host.current, mask);
  }, [mask]);

  return (
    <div
      {...props}
      ref={host}
      style={{ position: "relative", overflow: "hidden", ...style }}
      data-mk="field-art"
      data-field-art={spec}
      data-field-art-play={playing ? "" : undefined}
    />
  );
}
