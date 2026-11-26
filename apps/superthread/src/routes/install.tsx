import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { catalog, type CatalogItem, type Tier } from "@/components/superthread/catalog";
import { CodePatch } from "@/site/CodePatch";
import { installCommand, InstallLine } from "@/site/InstallLine";
import { nav } from "@/site/nav";
import { Section } from "@/site/Section";
import initForm from "../../../../packages/superthread/upstream/cli/init-form.json";

declare const __SUPERTHREAD_VERSION__: string;

export const Route = createFileRoute("/install")({
  staticData: {
    openerLede:
      "Two commands put Superthread into a TanStack Start app on Tailwind 4: init once, then add what you need.",
    sections: [
      { id: "init", title: "Init" },
      { id: "add", title: "Add an item" },
      { id: "css", title: "The CSS entry" },
      { id: "pin", title: "Pin a version" },
      { id: "items", title: "Every item" },
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
  { tier: "style", title: "The theme" },
  { tier: "lib", title: "Code" },
  { tier: "brand", title: "Branded components" },
  { tier: "pass", title: "Base-nova on the tokens" },
  { tier: "block", title: "Compositions" },
];

// every catalog item under its tier, in catalog order
export const itemGroups = tiers.map(({ tier, title }) => ({
  tier,
  title,
  items: catalog.filter((candidate) => candidate.tier === tier),
}));

// the apps a composition serves, as a sentence: "Serves orbit, trisys and www"
export function servesLine(apps: readonly string[]): string {
  const list = apps.length > 1 ? `${apps.slice(0, -1).join(", ")} and ${apps.at(-1)}` : (apps[0] ?? "");
  return `Serves ${list}`;
}

export function commandFor(name: string): string {
  return name === "init" ? initCommand : installCommand(name);
}

function Code({ children }: { children: ReactNode }) {
  return <code className="st-in-inline">{children}</code>;
}

function Page() {
  return (
    <>
      <Section id="init" title="Init" className="st-in">
        <p className="st-in-text">
          Init sets an app up for <Code>@mk</Code>. It writes the base-nova style and the registry into{" "}
          <Code>components.json</Code>, then installs the utils, the tokens and the button.
        </p>
        <InitLine />
      </Section>
      <Section id="add" title="Add an item" className="st-in">
        <p className="st-in-text">
          After init, every item installs by name, and the <Code>@mk</Code> items it needs come with it. Most apps start
          with the tokens and the button:
        </p>
        <InstallLine items={["tokens", "button"]} />
        <p className="st-in-text">
          The files go to <Code>components/superthread/</Code>, outside <Code>components/ui/</Code>, so a later{" "}
          <Code>shadcn apply</Code> or <Code>init --reinstall</Code> never overwrites them.
        </p>
      </Section>
      <Section id="css" title="The CSS entry" className="st-in">
        <p className="st-in-text">
          <Code>@mk/tokens</Code> adds three imports to the app&apos;s CSS entry, after Tailwind&apos;s:
        </p>
        <pre className="st-in-block">
          <code>{cssLines.join("\n")}</code>
        </pre>
        <p className="st-in-text">
          The third import is relative to <Code>src/styles.css</Code> in a Start app. Elsewhere, point it at the
          installed file from wherever your CSS entry sits: Next&apos;s <Code>app/globals.css</Code> needs{" "}
          <Code>../components/superthread/styles/superthread.css</Code>.
        </p>
      </Section>
      <Section id="pin" title="Pin a version" className="st-in">
        <p className="st-in-text">
          To stay on one version, map <Code>@mk</Code> to its snapshot in <Code>components.json</Code>. An item that
          needs other <Code>@mk</Code> items fetches them from the same snapshot.
        </p>
        <pre className="st-in-block">
          <code>{pinnedMapping(__SUPERTHREAD_VERSION__)}</code>
        </pre>
        <p className="st-in-text">
          <Code>/r/versions.json</Code> lists every version with a snapshot.
        </p>
      </Section>
      <Section id="items" title="Every item" className="st-in">
        <p className="st-in-text">
          Each item in the registry with its install line. An item with a page links to it, and a composition names the
          apps it serves.
        </p>
        {itemGroups.map((group) => (
          <div key={group.tier} className="st-in-group">
            <h3 className="type-meta">{group.title}</h3>
            <ul>
              {group.items.map((entry) => {
                const item = entry.name === "doc-react" ? "doc" : entry.name;
                const page = nav.find((candidate) => candidate.item === item);
                return (
                  <li key={entry.name} id={`item-${entry.name}`}>
                    <p className="st-in-item">
                      <b>{page ? <Link to={page.path}>{entry.title}</Link> : entry.title}</b>
                      <span>{entry.description}</span>
                      {entry.serves && <span className="st-in-serves">{servesLine(entry.serves)}</span>}
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
