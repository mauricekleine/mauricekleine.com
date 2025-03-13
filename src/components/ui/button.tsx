import clsx from "clsx";
import { ComponentProps, ReactNode } from "react";

type Props<As extends "a" | "button"> = ComponentProps<As> & {
  as?: As;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button<As extends "a" | "button" = "button">({
  as,
  children,
  className: classNameProp,
  leadingIcon,
  trailingIcon,
  ...props
}: Props<As>) {
  const className = clsx(
    classNameProp,
    "flex gap-2 hover:-rotate-1 group border-2 items-center rounded-md hover:scale-95 rotate-1 border-black space-x-2 bg-white px-8 py-3 text-base uppercase text-black shadow-brutal transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-xs hover:md:translate-x-1 hover:md:translate-y-1",
  );

  if (as === "a") {
    return (
      <a {...(props as ComponentProps<"a">)} className={className}>
        {leadingIcon}

        {children}

        {trailingIcon}
      </a>
    );
  }

  return (
    <button {...(props as ComponentProps<"button">)} className={className}>
      {leadingIcon}

      {children}

      {trailingIcon}
    </button>
  );
}
