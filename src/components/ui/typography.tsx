import { ComponentProps } from "react";

export function H1(props: ComponentProps<"h1">) {
  return (
    <h1
      {...props}
      className="font-sans text-7xl font-black tracking-tight uppercase md:text-8xl"
    />
  );
}

export function H2(props: ComponentProps<"h1">) {
  return (
    <h2
      {...props}
      className="font-sans text-4xl font-black tracking-normal uppercase md:text-6xl"
    />
  );
}

export function H3(props: ComponentProps<"h1">) {
  return (
    <h3
      {...props}
      className="font-sans text-2xl uppercase italic md:text-3xl"
    />
  );
}
