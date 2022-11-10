import { Grid, Heading, Section, Stack } from "~/design-system";

import {
  DistriversLogo,
  GoodupLogo,
  KlippaLogo,
  LogoLink,
  ProductboardLogo,
  QuestLogo,
  TopAnimationLogo,
  UButlerLogo,
  VacanceSelectLogo,
} from "./client-logos";

export function ClientsSection() {
  return (
    <div className="border-b border-t border-slate-200/10 bg-black bg-gradient-to-r from-black via-slate-900/50 to-black px-8 py-8 sm:px-0">
      <Section size="lg">
        <Stack gap={8} textAlign="center">
          <Heading as="h4">Past projects</Heading>

          <Grid
            alignItems="center"
            columns={{ base: 2, md: 4 }}
            gap={8}
            justifyItems="center"
            rows={{ base: "none", md: 2 }}
          >
            <LogoLink href="https://ubutler.nl/" logo={UButlerLogo} />

            <LogoLink
              href="https://productboard.com/"
              logo={ProductboardLogo}
            />

            <LogoLink href="https://quest.app/" logo={QuestLogo} />

            <LogoLink href="https://goodup.com/" logo={GoodupLogo} />

            <LogoLink href="https://klippa.com/" logo={KlippaLogo} />

            <LogoLink
              href="https://vacanceselect.recruitee.com/"
              logo={VacanceSelectLogo}
            />

            <LogoLink href="https://animatiewerk.nl/" logo={TopAnimationLogo} />

            <LogoLink href="https://distrivers.nl/" logo={DistriversLogo} />
          </Grid>
        </Stack>
      </Section>
    </div>
  );
}
