import { TestimonialCard } from "./testimonial-card";

export function TestimonialSection() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <TestimonialCard
        name="Bart Wille"
        quote="Thanks to the AI solution implemented, we anticipate a 20-30% increase in efficiency across CV handling. Improvements in formatting and evaluation processes have saved us valuable time and boosted accuracy."
        role="CEO Bluetrail"
      />

      <TestimonialCard
        name="Wouter van Haaften"
        quote="Maurice and Toon are real professionals, always delivering high quality software in a timely fashion. I've worked with them on multiple projects and they never dropped the ball. Would definitely recommend!"
        role="Founder Generative AI Strategy"
      />

      <div className="md:col-span-2">
        <TestimonialCard
          name="Bart Lacroix"
          quote="The migration from Ember to React was a critical project for GoodUp, and we couldn't have done it without Subthread's expertise. They didn't just write code – they empowered our developers with deep React knowledge while delivering high-quality work. Their ability to both teach and execute made them an invaluable partner during our transition."
          role="Founder GoodUp"
        />
      </div>
    </div>
  );
}
