import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FieldArt } from "@/components/superthread/ui/field-art";
import { Button } from "@/components/superthread/ui/button";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { Section } from "@/site/Section";
import catalogue from "../../../../../packages/superthread/test/fixtures/fields/catalogue.json";
import { constellation, roi } from "../../../../../packages/superthread/test/fixtures/fields/masks";

const masks = { constellation, roi };

export const Route = createFileRoute("/components/field-art")({
  staticData: {
    sections: [
      { id: "catalogue", title: "catalogue" },
      { id: "use", title: "use" },
    ],
  },
  component: FieldPage,
});

function FieldPage() {
  const [playing, setPlaying] = useState<string>();
  return (
    <>
      <header id="top" className="st-pagehead">
        <h1 className="st-pagehead-title type-hero text-first">field art</h1>
        <p className="st-lede type-lede">
          a solid, a screen and a plum thread. give the edge a verb for a figure or opener.
        </p>
        <InstallLine items={["field-art"]} />
      </header>
      <Section id="catalogue" title="catalogue">
        <div className="space-y-12">
          {catalogue.map((entry) => {
            const { id, title, verb, frame, line, size, phone } = entry;
            const mask = entry.mask ? masks[entry.mask as keyof typeof masks] : undefined;
            const preview = (mode: "light" | "dark") => {
              const key = `${id}-${mode}`;
              const active = playing === key;
              return (
                <>
                  <FieldArt
                    spec={line}
                    mask={mask}
                    playing={active}
                    aria-hidden="true"
                    className={phone ? "hidden min-[601px]:block" : undefined}
                    style={{ aspectRatio: size.join(" / ") }}
                  />
                  {phone && (
                    <FieldArt
                      spec={phone.line}
                      playing={active}
                      aria-hidden="true"
                      className="min-[601px]:hidden"
                      style={{ aspectRatio: phone.size.join(" / ") }}
                    />
                  )}
                  {id !== "weave" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4 min-w-20"
                      aria-label={`${active ? "pause" : "play"} ${title} in ${mode}`}
                      onClick={() => setPlaying(active ? undefined : key)}
                    >
                      {active ? "pause" : "play"}
                    </Button>
                  )}
                </>
              );
            };
            return (
              <figure key={id}>
                <figcaption className="mb-4 space-y-1">
                  <h3 className="type-subtitle">{title}</h3>
                  <p className="type-summary text-muted-foreground">
                    {verb} · {frame}
                  </p>
                </figcaption>
                <ModePair light={preview("light")} dark={preview("dark")} />
                <details className="mt-3 type-summary">
                  <summary className="w-fit cursor-pointer">spec line</summary>
                  <SpecLine line={line} />
                  {phone && <SpecLine line={phone.line} label="phone" />}
                </details>
              </figure>
            );
          })}
        </div>
      </Section>
      <Section id="use" title="use">
        <p className="st-pass-prose">
          import <code>FieldArt</code> from <code>ui/field-art</code>. size the host in css and pass the line as{" "}
          <code>spec</code>. pass a stable mask callback for a custom edge. set <code>playing</code> on the field that
          moves.
        </p>
        <p className="mt-4 st-pass-prose">
          in html, give a sized host <code>data-field-art</code> and inline <code>doc/field-art.js</code> after it. set{" "}
          <code>data-field-art-play</code> on the field that moves. the stock comes through the open cells. print and
          reduced motion show frame zero.
        </p>
      </Section>
    </>
  );
}

function SpecLine({ line, label }: { line: string; label?: string }) {
  return (
    <pre
      aria-label={label}
      className="mt-2 whitespace-pre-wrap break-words border border-border p-3 font-mono text-xs leading-5"
    >
      {label && (
        <>
          {label}
          {"\n"}
        </>
      )}
      {line}
    </pre>
  );
}
