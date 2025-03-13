import clsx from "clsx";

import { Button } from "~/components/ui/button";

import { AeonLogo } from "./aeon";
import { BluetrailLogo } from "./bluetrail";
import { DistriversLogo } from "./distrivers";
import { GenerativeAIStrategyLogo } from "./generative-ai-strategy";
import { GoodUpLogo } from "./good-up";
import { IPracticeLogo } from "./ipractice";
import { KlippaLogo } from "./klippa";
import { OioLogo } from "./oio";
import { OpenUpLogo } from "./open-up";
import { ProductboardLogo } from "./productboard";
import { QuestLogo } from "./quest";
import { StormDigitalLogo } from "./storm-digital";
import { TopAnimationLogo } from "./top-animation";
import { VacanceSelectLogo } from "./vacance-select";

const logos = [
  { href: "https://www.oio.studio/", label: "oio", Logo: OioLogo },
  {
    href: "https://www.bluetrail.nl/",
    label: "Bluetrail",
    Logo: BluetrailLogo,
  },
  {
    href: "https://www.generativeaistrategy.com/",
    label: "Generative AI Strategy",
    Logo: GenerativeAIStrategyLogo,
  },
  { href: "https://ipractice.nl/", label: "iPractice", Logo: IPracticeLogo },
  { href: "https://openup.com/", label: "OpenUp", Logo: OpenUpLogo },
  { href: "https://goodup.com/", label: "GoodUp", Logo: GoodUpLogo },
  { href: "https://quest.app/", label: "Quest", Logo: QuestLogo },
  {
    href: "https://productboard.com/",
    label: "Productboard",
    Logo: ProductboardLogo,
  },
  { href: "https://aeon.co/", label: "Aeon", Logo: AeonLogo },
  { href: "https://klippa.com/", label: "Klippa", Logo: KlippaLogo },
  {
    href: "https://www.crunchbase.com/organization/storm-digital/",
    label: "Storm Digital",
    Logo: StormDigitalLogo,
  },
  {
    href: "https://www.vacanceselect.com",
    label: "VacanceSelect",
    Logo: VacanceSelectLogo,
  },
  {
    href: "https://topanimation.nl/",
    label: "TOP Animation",
    Logo: TopAnimationLogo,
  },
  { href: "https://distrivers.nl/", label: "Distrivers", Logo: DistriversLogo },
] as const;

const svgClasses = clsx("fill-black max-w-32 h-8");

export function LogoGrid() {
  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-8">
      {logos.map(({ href, label, Logo }) => (
        <Button as="a" href={href} key={label} target="_blank">
          <Logo className={svgClasses} />
        </Button>
      ))}
    </div>
  );
}
