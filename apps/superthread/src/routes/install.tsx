import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { catalog, type CatalogItem, type Tier } from "@/components/superthread/catalog";
import { CodePatch } from "@/site/CodePatch";
import { installCommand, InstallLine } from "@/site/InstallLine";
import { nav } from "@/site/nav";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
import initForm from "../../../../packages/superthread/upstream/cli/init-form.json";

declare const __SUPERTHREAD_VERSION__: string;

export const Route = createFileRoute("/install")({
  staticData: {
    sections: [
      { id: "init", title: "init" },
      { id: "add", title: "add an item" },
      { id: "css", title: "the css entry" },
      { id: "pin", title: "pin a version" },
      { id: "items", title: "every item" },
    ],
  },
  component: Page,
});

function item(name: string): CatalogItem {
  const found = catalog.find((candidate) => candidate.name === name);
  if (!found) throw new Error(`the catalog has no ${name}`);
  return found;
}

// The registry's host, from the @mk mapping init writes, so the page names the host the registry is built for.
const mapping = item("init").config?.registries["@mk"];
if (!mapping) throw new Error("init maps no @mk registry");
export const registryBase = new URL(mapping).origin;

// The init line is the form the clean room recorded and ran (upstream/cli/init-form.json), with its base filled in
// and the CLI printed as the sketch prints it. The recorded env pins are the test's and are not printed.
export const initCommand = [
  "bunx --bun shadcn@latest",
  ...initForm.args.map((arg) => arg.replaceAll("<base>", registryBase)),
].join(" ");

export function InitLine({ className }: { className?: string }) {
  return <CodePatch command={initCommand} className={className} />;
}

// what @mk/tokens writes into the app's css entry: its css field, after tailwind's own import
export const cssLines = ['@import "tailwindcss";', ...Object.keys(item("tokens").css ?? {}).map((line) => `${line};`)];

// the components.json mapping that pins @mk to one version's snapshot
export function pinnedMapping(version: string): string {
  return JSON.stringify({ registries: { "@mk": `${registryBase}/r/v/${version}/{name}.json` } }, null, 2);
}

const tiers: readonly { tier: Tier; title: string }[] = [
  { tier: "style", title: "the theme" },
  { tier: "lib", title: "code" },
  { tier: "brand", title: "branded components" },
  { tier: "pass", title: "base-nova on the tokens" },
  { tier: "block", title: "compositions" },
];

// every catalog item under its tier, in catalog order
export const itemGroups = tiers.map(({ tier, title }) => ({
  tier,
  title,
  items: catalog.filter((candidate) => candidate.tier === tier),
}));

export function commandFor(name: string): string {
  return name === "init" ? initCommand : installCommand(name);
}

function Code({ children }: { children: ReactNode }) {
  return <code className="st-in-inline">{children}</code>;
}

function Page() {
  return (
    <>
      <PageHead
        title="install"
        lede="two commands put superthread into a tanstack start app on tailwind 4: init once, then add what you need."
      />
      <Section id="init" title="init" className="st-in">
        <p className="st-in-text">
          init sets an app up for <Code>@mk</Code>. it writes the base-nova style and the registry into{" "}
          <Code>components.json</Code>, then installs the utils, the tokens and the button.
        </p>
        <InitLine />
      </Section>
      <Section id="add" title="add an item" className="st-in">
        <p className="st-in-text">
          after init, every item installs by name, and the <Code>@mk</Code> items it needs come with it. most apps start
          with the tokens and the button:
        </p>
        <InstallLine items={["tokens", "button"]} />
        <p className="st-in-text">
          the files go to <Code>components/superthread/</Code>, outside <Code>components/ui/</Code>, so a later{" "}
          <Code>shadcn apply</Code> or <Code>init --reinstall</Code> never overwrites them.
        </p>
      </Section>
      <Section id="css" title="the css entry" className="st-in">
        <p className="st-in-text">
          <Code>@mk/tokens</Code> adds three imports to the app&apos;s css entry, after tailwind&apos;s:
        </p>
        <pre className="st-in-block">
          <code>{cssLines.join("\n")}</code>
        </pre>
        <p className="st-in-text">
          the third import is relative to <Code>src/styles.css</Code> in a start app. elsewhere, point it at the
          installed file from wherever your css entry sits: next&apos;s <Code>app/globals.css</Code> needs{" "}
          <Code>../components/superthread/styles/superthread.css</Code>.
        </p>
      </Section>
      <Section id="pin" title="pin a version" className="st-in">
        <p className="st-in-text">
          to stay on one version, map <Code>@mk</Code> to its snapshot in <Code>components.json</Code>. an item that
          needs other <Code>@mk</Code> items fetches them from the same snapshot.
        </p>
        <pre className="st-in-block">
          <code>{pinnedMapping(__SUPERTHREAD_VERSION__)}</code>
        </pre>
        <p className="st-in-text">
          <Code>/r/versions.json</Code> lists every version with a snapshot.
        </p>
      </Section>
      <Section id="items" title="every item" className="st-in">
        <p className="st-in-text">each item in the registry with its line. an item with a page links to it.</p>
        {itemGroups.map((group) => (
          <div key={group.tier} className="st-in-group">
            <h3 className="type-meta">{group.title}</h3>
            <ul>
              {group.items.map((entry) => {
                const page = nav.find((candidate) => candidate.item === entry.name);
                return (
                  <li key={entry.name} id={`item-${entry.name}`}>
                    <p className="st-in-item">
                      <b>{page ? <Link to={page.path}>{entry.title}</Link> : entry.title}</b>
                      <span>{entry.description}</span>
                    </p>
                    <CodePatch command={commandFor(entry.name)} className="st-in-patch" />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </Section>
    </>
  );
}
