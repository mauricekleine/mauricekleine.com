import clsx from "clsx";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function StarBurst({ children, className }: Props) {
  return (
    <div
      className={clsx(
        className,
        "clip-path-starburst flex items-center justify-center bg-red-600 p-4 text-center text-lg leading-none font-black text-yellow-300 uppercase transition-transform hover:scale-110",
      )}
    >
      {children}
    </div>
  );
}
