import { Compass, Footprints, InstagramLogo, Tent } from "@mozza-icons/react";

import { Button } from "~/ui/button";
import { Icon } from "~/ui/icon";
import { Box, Container } from "~/ui/layout";
import { Header, Text } from "~/ui/typography";

export default function Page() {
  return (
    <Container
      alignItems="center"
      gap={8}
      height="screen"
      justifyContent="center"
      width="xs"
    >
      <Box alignItems="center" gap={4} textAlign="center">
        <Header as="h2">Maurice&apos;s Camino</Header>

        <Text color="gray.200" size={{ base: "xl", md: "2xl" }}>
          Follow along for updates on my camino to Santiago de Compostela by
          checking out the links below.
        </Text>
      </Box>

      <Box
        columns={{ base: 1, md: 2 }}
        display="grid"
        gap={4}
        justifyContent="center"
        wrap="wrap"
      >
        <Button
          as="a"
          href="https://www.polarsteps.com/mauricekleine/7181704-camino-de-santiago?s=A6DF8AC0-5999-4E9B-A945-021B11981D26"
          variant="primary"
        >
          <Icon icon={Compass} />

          <Text>Polarsteps</Text>
        </Button>

        <Button
          as="a"
          href="https://www.instagram.com/hikingwithmorrie/"
          variant="primary"
        >
          <Icon icon={InstagramLogo} />

          <Text>Instagram</Text>
        </Button>

        <Button
          as="a"
          href="https://lighterpack.com/r/qakv0o"
          variant="primary"
        >
          <Icon icon={Tent} />

          <Text>Gear list</Text>
        </Button>

        <Button as="a" href="/camino/route" variant="primary">
          <Icon icon={Footprints} />

          <Text>Route</Text>
        </Button>
      </Box>
    </Container>
  );
}
