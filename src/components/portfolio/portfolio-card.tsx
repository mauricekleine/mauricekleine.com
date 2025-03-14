"use client";

import { motion } from "framer-motion";

import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { StarBurst } from "~/components/ui/starburst";
import { cn } from "~/lib/utils";

type Props = {
  burstText?: string;
  className?: string;
  description: string;
  isWip?: boolean;
  link?: string;
  technologies?: string[];
  title: string;
};

export function PortfolioCard({
  burstText,
  className,
  description,
  isWip = false,
  link,
  technologies = [],
  title,
}: Props) {
  const CardWrapper = link ? motion.a : motion.div;

  return (
    <CardWrapper
      className={cn(
        "group relative flex h-full",
        link && "cursor-pointer",
        className,
      )}
      href={link}
      target={link ? "_blank" : undefined}
      whileHover={{
        rotate: -1,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
    >
      <Card className="shadow-brutal hover:shadow-brutal-lg flex h-full w-full flex-col overflow-hidden border-2 border-black bg-white transition-all duration-300">
        {burstText && (
          <motion.div
            className="absolute -top-4 -right-4 z-10 md:-top-12 md:-right-12"
            initial={{ rotate: 12 }}
            whileHover={{
              rotate: 25,
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
          >
            <StarBurst className="size-24 text-sm">
              <motion.span
                animate={{
                  opacity: [1, 0.8, 1],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                {burstText}
              </motion.span>
            </StarBurst>
          </motion.div>
        )}

        <CardHeader>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ transition: { duration: 0.2 }, x: 4 }}>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            </motion.div>

            {isWip && (
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
              >
                <Badge className="border-2 border-black bg-yellow-300 text-black hover:bg-yellow-400">
                  Coming soon!
                </Badge>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-grow">
          <motion.div whileHover={{ transition: { duration: 0.2 }, y: -2 }}>
            <CardDescription className="text-left text-lg text-black">
              {description}
            </CardDescription>
          </motion.div>
        </CardContent>

        {technologies.length > 0 && (
          <CardFooter className="mt-auto flex flex-wrap gap-2 border-t border-dashed border-black pt-4">
            {technologies.map((tech, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
                key={tech}
                transition={{
                  delay: index * 0.1,
                  duration: 0.3,
                }}
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.2 },
                }}
              >
                <Badge className="border border-black bg-white text-black hover:bg-gray-100">
                  {tech}
                </Badge>
              </motion.div>
            ))}
          </CardFooter>
        )}
      </Card>
    </CardWrapper>
  );
}
