"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { mountWeave } from "@/components/superthread/lib/weave-core";

export function Weave({ spec, ...props }: Omit<ComponentPropsWithoutRef<"div">, "children"> & { spec: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) return mountWeave(ref.current);
  }, []);

  return <div {...props} ref={ref} data-mk="weave" data-weave={spec} />;
}
