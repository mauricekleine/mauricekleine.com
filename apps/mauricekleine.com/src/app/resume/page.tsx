import { Metadata } from "next";

import { Grid, Heading, Link, Section, Stack } from "@mk/design-system";
import {
  AeonLogo,
  GoodupLogo,
  KlippaLogo,
  MauriceKleineLogo,
  ProductboardLogo,
  StormDigitalLogo,
  UButlerLogo,
} from "@mk/marketing/client-logos";
import { Company } from "@mk/resume";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Maurice Kleine - Resume",
};

export default function ResumePage() {
  return (
    <div className="mt-32 mb-16">
      <Section>
        <Stack gap={16}>
          <Stack gap={4}>
            <Heading as="h1">Maurice Kleine</Heading>

            <Heading as="h3">
              To me, the most important goal in life is to learn new things -
              whether that be professionally in my career, or in my personal
              life while meeting new people, discovering new places and trying
              new things.
            </Heading>
          </Stack>

          <Stack gap={8}>
            <Heading as="h2">👨‍💻 Experience</Heading>

            <Grid
              columns={{ base: 1, sm: 2 }}
              gap={16}
              rows={{ base: 1, sm: "auto" }}
            >
              <Company
                logo={MauriceKleineLogo}
                website="https://mauricekleine.com"
              >
                <Company.Position
                  location="Remote"
                  startDate="2013/08/01"
                  title="Full-stack Engineer"
                />
              </Company>

              <Company logo={UButlerLogo} website="https://ubutler.nl">
                <Company.Position
                  endDate="2022/12/31"
                  location="Amsterdam"
                  startDate="2022/03/01"
                  title="Lead Software Engineer"
                />
              </Company>

              <Company
                logo={ProductboardLogo}
                website="https://productboard.com"
              >
                <Company.Position
                  endDate="2021/11/01"
                  location="Remote"
                  startDate="2019/07/01"
                  title="Engineering Manager"
                />

                <Company.Position
                  endDate="2019/07/01"
                  location="Prague, Czech Republic"
                  startDate="2019/01/01"
                  title="Frontend Engineer"
                />
              </Company>

              <Company logo={GoodupLogo} website="https://goodup.com">
                <Company.Position
                  endDate="2018/10/01"
                  location="Amsterdam, The Netherlands"
                  startDate="2018/01/01"
                  title="Product Manager"
                />

                <Company.Position
                  endDate="2018/01/01"
                  location="Amsterdam, The Netherlands"
                  startDate="2017/03/01"
                  title="Javascript Engineer"
                />
              </Company>

              <Company logo={AeonLogo} website="https://aeon.co">
                <Company.Position
                  endDate="2018/09/01"
                  location="Remote"
                  startDate="2017/11/01"
                  title="Mobile App Developer (Volunteer)"
                />
              </Company>

              <Company logo={KlippaLogo} website="https://aeon.co">
                <Company.Position
                  endDate="2017/03/01"
                  location="Groningen, The Netherlands"
                  startDate="2015/01/01"
                  title="Frontend Engineer"
                />
              </Company>

              <Company
                logo={StormDigitalLogo}
                website="https://www.stormdigital.nl/"
              >
                <Company.Position
                  endDate="2016/12/01"
                  location="Groningen, The Netherlands"
                  startDate="2016/05/01"
                  title="Interim UX Designer"
                />
              </Company>
            </Grid>
          </Stack>

          <Grid columns={2} gap={16}>
            <Stack gap={8}>
              <Heading as="h2">📚 Education</Heading>

              <Stack gap={8}>
                <div>
                  <Heading as="h3">Psychology</Heading>

                  <p>Bachelor of Science (BSc)</p>

                  <p>Open University of the Netherlands · 2022 - Present</p>
                </div>

                <div>
                  <Heading as="h3">Information​ S​cience</Heading>

                  <p>Bachelor of Arts (BA) · Average grade: 8.0</p>

                  <p>University of Groningen · 2011 - 2015</p>
                </div>

                <div>
                  <Heading as="h3">Bachelor Honours Programme</Heading>

                  <p>University of Groningen · 2011 - 2015</p>
                </div>
              </Stack>
            </Stack>

            <Stack gap={16}>
              <Stack gap={8}>
                <Heading as="h2">📜 Certifications</Heading>

                <div>
                  <Heading as="h3">Professional Scrum Master I</Heading>

                  <p>Scrum.org · Aug 2017</p>
                </div>
              </Stack>

              <Stack gap={8}>
                <Heading as="h2">🧔‍♂️ Random facts</Heading>

                <ul className="ml-6 list-disc">
                  <li>
                    <Link href="https://www.16personalities.com/enfj-personality">
                      ENFJ-T Personality
                    </Link>
                  </li>

                  <li>I have two bunnies</li>

                  <li>My favorite food is Mexican food</li>

                  <li>I brew my own ginger beer</li>
                </ul>
              </Stack>
            </Stack>
          </Grid>
        </Stack>
      </Section>
    </div>
  );
}
