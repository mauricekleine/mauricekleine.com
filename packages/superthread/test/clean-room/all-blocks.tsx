// The compositions' sink: every block, once in .light and once in .dark. Clean-room step 8 copies this file to the
// fixture's src/routes/blocks.tsx beside /all, and the fixture's build is its only type-check. It uses only each
// block's own API, with synthetic words.
import { type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
} from "@/components/superthread/blocks/page-header";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateText,
  FailedState,
  LoadingState,
} from "@/components/superthread/blocks/states";
import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";

export const Route = createFileRoute("/blocks")({ component: AllBlocks });

type Mode = "light" | "dark";

function AllBlocks() {
  return (
    <main>
      <Sink mode="light" />
      <Sink mode="dark" />
    </main>
  );
}

function Sink({ mode }: { mode: Mode }) {
  return (
    <section data-sink={mode} className={cn(mode, "flex flex-col gap-10 bg-background p-10 text-foreground")}>
      <h1 className="text-2xl">{mode}</h1>

      <Part name="page-header">
        <PageHeader>
          <PageHeaderTitle>board</PageHeaderTitle>
          <PageHeaderMeta>12 tasks, 2 running</PageHeaderMeta>
          <PageHeaderActions>
            <Button>new task</Button>
          </PageHeaderActions>
        </PageHeader>
        <PageHeader size="page">
          <PageHeaderBack href="#essays">essays</PageHeaderBack>
          <PageHeaderTitle>the long way round</PageHeaderTitle>
          <PageHeaderDescription>a lede on its own line, held to a reading measure.</PageHeaderDescription>
        </PageHeader>
      </Part>

      <Part name="states">
        <LoadingState rows={3} label="loading runs" />
        <FailedState title="the runs did not load" onRetry={() => {}}>
          the server took too long.
        </FailedState>
        <EmptyState>
          <EmptyStateText title="nothing queued">a new task lands here.</EmptyStateText>
          <EmptyStateActions>
            <Button variant="outline">new task</Button>
          </EmptyStateActions>
        </EmptyState>
      </Part>

      {/* blocks: shell */}
      {/* blocks: collections */}
      {/* blocks: forms */}
    </section>
  );
}

function Part({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm text-muted-foreground">{name}</h2>
      {children}
    </div>
  );
}
