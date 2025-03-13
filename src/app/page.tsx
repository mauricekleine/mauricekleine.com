import { ContactButtons } from "~/components/contact-buttons";
import { LogoGrid } from "~/components/logos/logo-grid";
import { PortfolioSection } from "~/components/portfolio/portfolio-section";
import { StarBurst } from "~/components/ui/starburst";
import { H1, H2, H3 } from "~/components/ui/typography";

export default function Page() {
  return (
    <div className="mt-32 space-y-32 md:mt-64 md:space-y-64">
      <div className="mx-auto max-w-4xl space-y-16 text-center md:space-y-32">
        <div className="relative flex flex-col items-center space-y-4">
          <H1>Maurice Kleine</H1>

          <H3>Freelance Software Engineer</H3>

          <StarBurst className="size-24 rotate-12 md:absolute md:top-20 md:right-32">
            Now With AI!
          </StarBurst>
        </div>

        <div className="flex flex-col gap-4">
          <p>Why wait? Reach out - today!</p>

          <ContactButtons />
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl space-y-16 px-4 text-center md:px-0">
        <PortfolioSection />
      </div>

      <div className="-mx-8 -rotate-3 border-t-4 border-b-4 border-dashed border-black bg-white p-8 md:p-12">
        <div className="relative mx-auto max-w-2xl space-y-4 px-8 sm:px-0">
          <StarBurst className="absolute -top-4 -ml-28 hidden size-24 -rotate-12 text-lg md:flex">
            Not sold in stores!
          </StarBurst>

          <H2>Transform Today!</H2>

          <p>
            Do you need a software engineer who can take your ideas and turn
            them into reality? Look no further! Maurice excels at building
            applications from scratch, bringing your vision to life. With
            expertise in hands-on coding and a passion for coaching and
            mentoring, he ensures fast iteration and top-notch results. Elevate
            your software products today with unparalleled skills and
            dedication. Don’t wait—act now and watch your ideas transform into
            amazing applications!
          </p>
        </div>
      </div>

      <div
        className="relative mx-auto max-w-4xl space-y-16 px-4 text-center md:px-0"
        id="clients"
      >
        <H2>Don&apos;t just take our word for it!</H2>

        <StarBurst className="hidden size-24 rotate-12 md:absolute md:-top-14 md:right-24 md:flex">
          Call now!
        </StarBurst>

        <LogoGrid />
      </div>
    </div>
  );
}
