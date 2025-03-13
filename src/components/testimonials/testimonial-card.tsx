"use client";

import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type TestimonialCardProps = {
  name: string;
  quote: string;
  role: string;
};

export function TestimonialCard({ name, quote, role }: TestimonialCardProps) {
  return (
    <motion.div
      className="group relative flex h-full"
      whileHover={{
        rotate: -1,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
    >
      <Card className="shadow-brutal hover:shadow-brutal-lg flex h-full w-full flex-col overflow-hidden border-2 border-black bg-white transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ transition: { duration: 0.2 }, x: 4 }}>
              <CardTitle className="text-2xl font-bold">{name}</CardTitle>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow">
          <motion.div whileHover={{ transition: { duration: 0.2 }, y: -2 }}>
            <div className="mb-4 text-left">
              <svg
                className="h-8 w-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            <p className="text-left text-lg font-medium text-black italic">
              {quote}
            </p>
          </motion.div>
        </CardContent>

        <CardFooter className="mt-auto border-t border-dashed border-black pt-4">
          <div className="text-left">
            <p className="font-bold uppercase">{name}</p>

            <p className="text-sm">{role}</p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
