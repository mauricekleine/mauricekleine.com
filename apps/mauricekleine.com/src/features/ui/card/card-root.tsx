import { Stack } from "@mozza-ui/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function CardRoot({ children }: Props) {
  return (
    <div className="relative rounded-xl bg-gradient-to-br from-blue-700 via-purple-600/10 to-red-700 p-0.5 before:absolute before:inset-0 before:h-full before:w-full before:rounded-xl before:bg-gradient-to-br before:from-blue-500 before:via-purple-500/30 before:to-red-500 before:blur-3xl">
      <div className="relative z-10 h-full w-full rounded-xl bg-black px-8 py-8 before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-br before:from-blue-900/25 before:via-black before:to-red-900/25 sm:px-12 sm:py-12">
        <Stack gap={8} items="center" justify="center">
          {children}
        </Stack>
      </div>
    </div>
  );
}