"use client";

import { motion } from "framer-motion";

import { H2 } from "~/components/ui/typography";

import { PortfolioCard } from "./portfolio-card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, transition: { duration: 0.5 }, y: 0 },
};

export function PortfolioSection() {
  return (
    <div className="relative space-y-8 text-center" id="portfolio">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <H2>Portfolio</H2>
      </motion.div>

      <motion.div
        animate="show"
        className="grid gap-8 md:grid-cols-2"
        initial="hidden"
        variants={container}
      >
        {/* Subthread - Main Project */}
        <motion.div className="md:col-span-2" variants={item}>
          <PortfolioCard
            burstText="Featured!"
            description="A product studio that helps companies big and small go from idea to product. Co-founded with Toon Verbeek, focusing on AI solutions and product development."
            link="https://subthread.io/"
            technologies={["AI", "Product Development", "LLM Solutions"]}
            title="Subthread"
          />
        </motion.div>

        {/* GetCap */}
        <motion.div variants={item}>
          <PortfolioCard
            description="Give your team the toolkit to easily create secure, personal AI chatbots & workflows with your own data. Chat with your own data, generate blogs, automate customer support and much more."
            link="https://getcap.dev/"
            technologies={[
              "AI",
              "Large Language Models",
              "Agents",
              "Next.js",
              "React",
              "Tailwind CSS",
            ]}
            title="GetCap"
          />
        </motion.div>

        {/* Pet Portrait Lab */}
        <motion.div variants={item}>
          <PortfolioCard
            description="Create beautiful print-ready custom dog portraits. Receive dozens of high-quality portraits of your dog within a few hours."
            link="https://www.petportraitlab.com/"
            technologies={[
              "AI Image Generation",
              "Large Language Models",
              "Next.js",
              "React",
              "Tailwind CSS",
            ]}
            title="Pet Portrait Lab"
          />
        </motion.div>

        {/* DayStack */}
        <motion.div variants={item}>
          <PortfolioCard
            description="A habit and supplement tracker for health focused individuals. Built in React Native, available on iOS."
            link="https://www.daystack.co/"
            technologies={["React Native", "iOS", "Health"]}
            title="DayStack"
          />
        </motion.div>

        {/* OpenAgency */}
        <motion.div variants={item}>
          <PortfolioCard
            description="An open source transparency SDK for agencies and studios to share earnings from client work and products."
            isWip={true}
            technologies={["TypeScript", "React", "Open Source"]}
            title="OpenAgency"
          />
        </motion.div>

        {/* Nonogra.ms */}
        <motion.div className="md:col-span-2" variants={item}>
          <PortfolioCard
            description="An interactive puzzle game platform featuring nonogram puzzles with various difficulty levels and themes."
            isWip={true}
            technologies={["Gaming", "Puzzles", "Interactive"]}
            title="Nonogra.ms"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
