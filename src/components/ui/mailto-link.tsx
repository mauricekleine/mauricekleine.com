"use client";

import { ReactNode, useRef } from "react";

import { Button } from "./button";

type Props = {
  children: ReactNode;
} & React.ComponentProps<typeof Button<"a">>;

export function MailtoLink({ children, ...props }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleClick() {
    if (ref.current) {
      ref.current.href = `mailto:${"hey"}@${"maurice" + "kleine"}.com`;

      setTimeout(() => {
        if (ref.current) {
          ref.current.href = "";
        }
      }, 500);
    }
  }

  return (
    <Button
      as="a"
      className="cursor-pointer"
      onClick={handleClick}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
}
