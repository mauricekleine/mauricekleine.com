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
        className={`relative overflow-x-hidden bg-white bg-[url(./noise.svg)] font-sans text-xl leading-7 tracking-wide text-balance text-black ${sans.variable}`}
      >
        <header className="sticky top-4 z-50">
          <nav className="shadow-brutal-sm hover:shadow-brutal-xs mx-auto flex w-fit items-center justify-between rounded-md border-2 border-black bg-white/70 px-1 py-1 text-base backdrop-blur-md transition-all hover:bg-white/90">
            <Link href="/">
              <Image
                alt="Maurice Kleine"
                className="size-10 md:size-12"
                height={48}
                src="/logo-inverted.svg"
                width={48}
              />
            </Link>

            <div className="flex items-center divide-x divide-black">
              <a className="px-2 hover:underline md:px-4" href="#portfolio">
                Portfolio
              </a>

              <a className="px-2 hover:underline md:px-4" href="#clients">
                Clients
              </a>

              <a className="px-2 hover:underline md:px-4" href="#contact">
                Contact
              </a>
            </div>
          </nav>
        </header>

        <main className="my-16">{children}</main>

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
