import { ContactButtons } from "~/components/contact-buttons";
import { LogoGrid } from "~/components/logos/logo-grid";
import { PortfolioSection } from "~/components/portfolio/portfolio-section";
import { TestimonialSection } from "~/components/testimonials/testimonial-section";
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

          <div className="mt-4">
            <p className="text-sm">
              Reach out now and get a free consultation!
            </p>

            <p className="animate-pulse text-sm uppercase">
              You won&apos;t believe your eyes!
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl">
        <PortfolioSection />
      </div>

      <div className="relative mx-auto w-full px-4 md:px-8">
        <div className="-mx-12 -rotate-3 border-t-4 border-b-4 border-dashed border-black bg-white p-8 md:-mx-24 md:p-12">
          <div className="relative mx-auto max-w-2xl space-y-4 px-4 sm:px-0">
            <StarBurst className="absolute -top-4 -ml-28 hidden size-24 -rotate-12 text-lg md:flex">
              Not sold in stores!
            </StarBurst>

            <H2>Transform Today!</H2>

            <p>
              Do you need a software engineer who can take your ideas and turn
              them into reality? Look no further! Maurice excels at building
              applications from scratch, bringing your vision to life. With
              expertise in hands-on coding and a passion for coaching and
              mentoring, he ensures fast iteration and top-notch results.
              Elevate your software products today with unparalleled skills and
              dedication. Don&apos;t wait—act now and watch your ideas transform
              into amazing applications!
            </p>
          </div>
        </div>
      </div>

      <div
        className="relative mx-auto max-w-4xl space-y-16 text-center"
        id="clients"
      >
        <H2>What our clients say</H2>

        <StarBurst className="z-10 hidden size-24 rotate-12 md:absolute md:-top-6 md:right-0 md:flex">
          Real reviews!
        </StarBurst>

        <TestimonialSection />

        <div className="h-1 w-full border-b-4 border-dashed border-black" />

        <LogoGrid />
      </div>
    </div>
  );
}
