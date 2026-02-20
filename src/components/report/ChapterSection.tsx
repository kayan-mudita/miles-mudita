"use client";

import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";

type ChapterSectionProps = {
  index: number;
  heading: string;
  html: string;
};

export default function ChapterSection({
  index,
  heading,
  html,
}: ChapterSectionProps) {
  return (
    <motion.section
      id={`chapter-${index + 1}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      <div className="flex items-center gap-4 mb-6">
        <span className="text-gold-500/30 font-display text-5xl">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-cream-100">
          {heading}
        </h2>
      </div>

      <div
        className="prose prose-invert max-w-none font-body text-cream-300 leading-relaxed
          [&_h3]:text-cream-100 [&_h3]:font-display [&_h3]:text-lg [&_h3]:mt-8 [&_h3]:mb-3
          [&_h4]:text-cream-200 [&_h4]:font-display [&_h4]:text-base [&_h4]:mt-6 [&_h4]:mb-2
          [&_p]:mb-4 [&_p]:text-cream-300
          [&_ul]:mb-4 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:text-cream-300
          [&_ol]:mb-4 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:text-cream-300
          [&_li]:mb-1.5
          [&_a]:text-gold-500 [&_a]:no-underline hover:[&_a]:underline
          [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
          [&_th]:bg-navy-800 [&_th]:border [&_th]:border-gold-500/15 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-cream-100 [&_th]:text-sm [&_th]:font-body
          [&_td]:border [&_td]:border-gold-500/10 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td]:text-cream-300
          [&_strong]:text-cream-100
          [&_hr]:border-gold-500/15 [&_hr]:my-8"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />
    </motion.section>
  );
}
