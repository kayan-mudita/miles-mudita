"use client";

import { useState, useEffect } from "react";

type TOCItem = {
  id: string;
  label: string;
};

type TableOfContentsProps = {
  items: TOCItem[];
};

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0% -60% 0%" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-24 hidden lg:block">
      <p className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-body mb-4">
        Contents
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm font-body transition-colors duration-200 ${
                activeId === item.id
                  ? "text-gold-500"
                  : "text-cream-300/50 hover:text-cream-300"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
