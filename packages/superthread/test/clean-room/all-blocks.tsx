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
import {
  FormSection,
  FormSectionHeader,
  FormSectionTitle,
  FormSectionDescription,
  FormSectionFields,
  FormSectionFooter,
  FormSectionStatus,
} from "@/components/superthread/blocks/form-section";
import { QuickAdd } from "@/components/superthread/blocks/quick-add";
import { Facts, Fact, FactLabel, FactValue } from "@/components/superthread/blocks/facts";
import { Notice, NoticeTitle, NoticeDescription, NoticeActions } from "@/components/superthread/blocks/notice";
import { Field, FieldLabel } from "@/components/superthread/ui/field";
import { Input } from "@/components/superthread/ui/input";
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
      <Part name="form-section">
        <FormSection onSubmit={(event) => event.preventDefault()}>
          <FormSectionHeader>
            <FormSectionTitle>settings</FormSectionTitle>
            <FormSectionDescription>new runs use these settings.</FormSectionDescription>
          </FormSectionHeader>
          <FormSectionFields>
            <Field>
              <FieldLabel htmlFor={`${mode}-prefix`}>branch prefix</FieldLabel>
              <Input id={`${mode}-prefix`} defaultValue="agent/" />
            </Field>
          </FormSectionFields>
          <FormSectionFooter>
            <FormSectionStatus>unsaved changes</FormSectionStatus>
            <Button type="reset" variant="outline">
              discard
            </Button>
            <Button type="submit">save</Button>
          </FormSectionFooter>
        </FormSection>
      </Part>
      <Part name="quick-add">
        <QuickAdd label="new task" placeholder="what needs doing?" onAdd={async () => {}} />
        <QuickAdd
          label="email"
          hideLabel
          submitLabel="subscribe"
          inputProps={{ type: "email", autoComplete: "email", required: true }}
          onAdd={() => {}}
        />
      </Part>
      <Part name="facts">
        <Facts>
          <Fact>
            <FactLabel>run</FactLabel>
            <FactValue kind="id">r-12</FactValue>
          </Fact>
          <Fact>
            <FactLabel>attempts</FactLabel>
            <FactValue kind="number">2</FactValue>
          </Fact>
        </Facts>
        <Facts layout="grid" columns={4}>
          <Fact>
            <FactLabel>ship</FactLabel>
            <FactValue>orbit</FactValue>
          </Fact>
          <Fact>
            <FactLabel>run</FactLabel>
            <FactValue kind="id">r-12</FactValue>
          </Fact>
          <Fact>
            <FactLabel>attempts</FactLabel>
            <FactValue kind="number">2</FactValue>
          </Fact>
          <Fact>
            <FactLabel>started</FactLabel>
            <FactValue kind="number">12:04</FactValue>
          </Fact>
        </Facts>
      </Part>
      <Part name="notice">
        <Notice>
          <NoticeTitle>draft kept here</NoticeTitle>
          <NoticeDescription>choose when to save it.</NoticeDescription>
        </Notice>
        <Notice state="failed">
          <NoticeTitle>sync stopped</NoticeTitle>
          <NoticeDescription>your draft is kept locally.</NoticeDescription>
          <NoticeActions>
            <Button variant="outline">try again</Button>
            <Button variant="destructive">discard</Button>
          </NoticeActions>
        </Notice>
      </Part>
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
