import type { Metadata } from "next";
import { Grandstander } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { ContactButtons } from "~/components/contact-buttons";
import { H2 } from "~/components/ui/typography";

import "./globals.css";

const sans = Grandstander({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  description:
    "Freelance AI Engineer based in Amsterdam, The Netherlands. I build AI applications with JavaScript and Python, for companies big and small.",
  metadataBase: new URL("https://www.mauricekleine.com"),
  openGraph: {
    description:
      "Freelance AI Engineer based in Amsterdam, The Netherlands. I build AI applications with JavaScript and Python, for companies big and small.",
    siteName: "Maurice Kleine",
    title: "Maurice Kleine - Freelance AI Engineer",
    type: "website",
    url: "https://www.mauricekleine.com",
  },
  title: "Maurice Kleine - Freelance AI Engineer",
  twitter: {
    card: "summary",
    description:
      "Freelance AI Engineer based in Amsterdam, The Netherlands. I build AI applications with JavaScript and Python, for companies big and small.",
    title: "Maurice Kleine - Freelance AI Engineer",
  },
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Readonly<Props>) {
  return (
    <html className="scroll-smooth" lang="en">
      <body
        className={`relative bg-white bg-[url(./noise.svg)] font-sans text-xl leading-7 tracking-wide text-balance text-black ${sans.variable}`}
      >
        <header className="fixed top-4 z-50 mx-auto w-full px-4">
          <nav className="shadow-brutal-sm hover:shadow-brutal-xs mx-auto flex max-w-fit items-center justify-between gap-4 rounded-md border-2 border-black bg-white px-2 py-2 transition-all sm:px-8">
            <Link href="/">
              <Image
                alt="Maurice Kleine"
                className="size-12"
                height={48}
                src="/mk-inverted-round.svg"
                width={48}
              />
            </Link>

            <div className="flex items-center divide-x-2 divide-black">
              <a
                className="px-2 py-1 text-base font-medium hover:underline md:px-4 md:text-lg"
                href="#portfolio"
              >
                Portfolio
              </a>

              <a
                className="px-2 py-1 text-base font-medium hover:underline md:px-4 md:text-lg"
                href="#clients"
              >
                Clients
              </a>

              <a
                className="px-2 py-1 text-base font-medium hover:underline md:px-4 md:text-lg"
                href="#contact"
              >
                Contact
              </a>
            </div>
          </nav>
        </header>

        <main className="mx-4 my-16 md:mx-12 lg:mx-0">{children}</main>

        <footer
          className="mt-48 space-y-16 border-t-4 border-dashed border-black bg-red-600 p-8 text-center text-yellow-300 md:p-12"
          id="contact"
        >
          <div className="mx-auto max-w-4xl space-y-8">
            <H2>You won&apos;t regret it!</H2>

            <p>
              For a limited time only, we are offering a free consultation to
              new clients. Contact us today to learn more about our services and
              how we can help you transform your ideas into reality!
            </p>

            <ContactButtons />
          </div>

          <div className="text-base">
            <p>Maurice Kleine</p>

            <p>Amsterdam, The Netherlands</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
