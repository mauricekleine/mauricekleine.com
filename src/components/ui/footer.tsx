"use client";

import { motion } from "framer-motion";

import { Button } from "~/components/ui/button";
import {
  GithubLogo,
  LinkedinLogo,
  PaperPlaneTilt,
  TwitterLogo,
} from "~/components/ui/icons";
import { MailtoLink } from "~/components/ui/mailto-link";
import { H2 } from "~/components/ui/typography";

export function Footer() {
  return (
    <motion.footer
      className="space-y-16 border-t-4 border-dashed border-black bg-red-600 p-8 text-center text-yellow-300 md:p-12"
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      viewport={{ margin: "-100px", once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <H2>You won&apos;t regret it!</H2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          For a limited time only, we are offering a free consultation to new
          clients. Contact us today to learn more about our services and how we
          can help you transform your ideas into reality!
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 md:flex-row"
          initial={{ opacity: 0 }}
          transition={{
            delay: 0.4,
            delayChildren: 0.5,
            duration: 0.5,
            staggerChildren: 0.1,
          }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <motion.div
            transition={{ duration: 0.2 }}
            whileHover={{ rotate: -1, scale: 1.05 }}
          >
            <Button
              as="a"
              href="https://www.linkedin.com/in/mauricekleine/"
              leadingIcon={
                <LinkedinLogo
                  className="size-5 transition-transform duration-200"
                  weight="bold"
                />
              }
              target="_blank"
            >
              LinkedIn
            </Button>
          </motion.div>

          <motion.div
            transition={{ duration: 0.2 }}
            whileHover={{ rotate: -1, scale: 1.05 }}
          >
            <Button
              as="a"
              href="https://github.com/mauricekleine/"
              leadingIcon={
                <GithubLogo
                  className="size-5 transition-transform duration-200"
                  weight="bold"
                />
              }
              target="_blank"
            >
              Github
            </Button>
          </motion.div>

          <motion.div
            transition={{ duration: 0.2 }}
            whileHover={{ rotate: -1, scale: 1.05 }}
          >
            <Button
              as="a"
              href="https://x.com/maurice_kleine"
              leadingIcon={
                <TwitterLogo
                  className="size-5 transition-transform duration-200"
                  weight="bold"
                />
              }
              target="_blank"
            >
              Twitter
            </Button>
          </motion.div>

          <motion.div
            transition={{ duration: 0.2 }}
            whileHover={{ rotate: -1, scale: 1.05 }}
          >
            <MailtoLink
              leadingIcon={
                <PaperPlaneTilt
                  className="size-5 transition-transform duration-200"
                  weight="bold"
                />
              }
            >
              Email
            </MailtoLink>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="text-base"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1 }}
      >
        <p>Maurice Kleine</p>

        <p>Amsterdam, The Netherlands</p>
      </motion.div>
    </motion.footer>
  );
}
