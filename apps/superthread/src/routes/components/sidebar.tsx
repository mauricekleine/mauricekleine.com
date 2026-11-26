import { createFileRoute } from "@tanstack/react-router";
import { SidebarExample, SidebarStates } from "@/examples/sidebar";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/sidebar")({
  staticData: {
    sections: [
      { id: "ground", title: "On the ground" },
      { id: "states", title: "States" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Sidebar"
        lede="A ship's own nav, on its deep ground. The ground keeps the page's mode, and whatever prints on it reads in the dark palette in both."
      >
        <InstallLine items={["sidebar"]} />
      </PageHead>

      <Section id="ground" title="On the ground">
        <p className="st-c-copy">
          Orbit&rsquo;s nav: its pages with the board current, then its latest runs. The current page is neutral: the
          foreground word in a 1 px edge with its 8 px square, the way this site&rsquo;s own nav marks it.
        </p>
        <p className="st-c-copy">
          The ground is a dark grey in light and close to black in dark. Glyphs, badges, rules and rows on it take the
          dark palette in both, so a status keeps the same ink whatever mode the page is in.
        </p>
        <ModePair>
          <SidebarExample />
        </ModePair>
      </Section>

      <Section id="states" title="States">
        <p className="st-c-copy">
          A row lightens on hover and takes a neutral 2 px ring outside it on keyboard focus. The current row takes the
          1 px edge and the square, with no fill; a disabled one prints at half.
        </p>
        <ModePair>
          <SidebarStates />
        </ModePair>
      </Section>

      <Section id="parts" title="Parts">
        <p className="st-c-copy">
          The names and props are shadcn&rsquo;s, from base-nova. A sidebar inside a page passes{" "}
          <code>className=&quot;min-h-0&quot;</code> to its provider, which otherwise holds a full viewport&rsquo;s
          height.
        </p>
        <dl className="st-c-parts">
          <dt>
            <code>SidebarProvider</code>
          </dt>
          <dd>
            Holds whether the sidebar is open, and toggles it on <code>ctrl b</code> or <code>cmd b</code>.
          </dd>
          <dt>
            <code>Sidebar</code>
          </dt>
          <dd>
            The column. By default it slides off the canvas when closed and opens as a sheet on a phone;{" "}
            <code>collapsible=&quot;none&quot;</code> keeps it in place, as here.
          </dd>
          <dt>
            <code>SidebarHeader</code>
          </dt>
          <dd>
            The top, above <code>SidebarContent</code>, which scrolls, and <code>SidebarFooter</code> at the foot.
          </dd>
          <dt>
            <code>SidebarGroup</code>
          </dt>
          <dd>
            A run of rows, with an optional <code>SidebarGroupLabel</code>.
          </dd>
          <dt>
            <code>SidebarMenuButton</code>
          </dt>
          <dd>
            A row, inside <code>SidebarMenu</code> and <code>SidebarMenuItem</code>. <code>isActive</code> marks the
            current one; <code>render=&#123;&lt;a href=&quot;/board&quot; /&gt;&#125;</code> makes it a link.
          </dd>
          <dt>
            <code>SidebarMenuBadge</code>
          </dt>
          <dd>A count at the end of a row.</dd>
          <dt>
            <code>SidebarSeparator</code>
          </dt>
          <dd>A rule on the ground.</dd>
          <dt>
            <code>SidebarTrigger</code>
          </dt>
          <dd>
            The button that opens and closes it, for the page beside it in <code>SidebarInset</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
