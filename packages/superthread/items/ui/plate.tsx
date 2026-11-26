"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { mountPlate, type BreathStrength, type PlateDraw } from "@/components/superthread/lib/plate-core";

type PlateProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  spec?: string;
  src?: string;
  draw?: PlateDraw;
  breath?: BreathStrength;
  still?: boolean;
  positive?: boolean;
};

export function Plate({ spec = "planes", src, draw, breath, still = false, positive, ...props }: PlateProps) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (host.current) return mountPlate(host.current, draw);
  }, [draw]);

  return (
    <div
      {...props}
      ref={host}
      data-mk="plate"
      data-plate={spec}
      data-plate-src={src}
      data-plate-breath={breath}
      data-plate-still={still ? "" : undefined}
      data-plate-positive={positive === undefined ? undefined : positive ? "1" : "0"}
    />
  );
}
