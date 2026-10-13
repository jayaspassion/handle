"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// One project on the public page. Collapsed by default so every card in the
// row has the same compact height: title 2 lines, description 4 lines, tags 2
// rows. "Show more" appears only when something is actually cut off.
// Print always shows everything.
export default function ProjectCard({
  title,
  description,
  imageUrl,
  tags,
  links,
}: {
  title: string;
  description: string | null;
  imageUrl: string | null;
  tags: ReactNode;
  links: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  // Measure while collapsed (and again on resize) to decide on the button
  useLayoutEffect(() => {
    if (expanded) return;
    const measure = () => {
      const els = [titleRef.current, descRef.current, tagsRef.current];
      setClipped(els.some((el) => !!el && el.scrollHeight > el.clientHeight + 1));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [expanded, description, title]);

  const clamp = (classes: string) => (expanded ? "" : `${classes} print:line-clamp-none print:max-h-none`);

  return (
    <article className="card card-accent flex h-full flex-col overflow-hidden bg-pf-surface p-0 sm:flex-row">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`Screenshot of ${title}`}
          loading="lazy"
          className="h-40 w-full shrink-0 object-cover sm:h-auto sm:w-2/5"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 ref={titleRef} className={`break-words font-serif text-lg ${clamp("line-clamp-2")}`}>
          {title}
        </h3>
        {description && (
          <p
            ref={descRef}
            className={`mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-pf-muted ${clamp("line-clamp-4")}`}
          >
            {description}
          </p>
        )}
        {tags && (
          <div
            ref={tagsRef}
            className={`mt-4 ${clamp("max-h-[4.25rem] overflow-hidden")}`}
          >
            {tags}
          </div>
        )}
        {clipped && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 inline-flex min-h-10 items-center self-start text-sm font-medium text-pf-accent underline-offset-4 hover:underline print:hidden"
          >
            {expanded ? "Show less" : "Show more"}
            <span className="sr-only"> about {title}</span>
          </button>
        )}
        {links}
      </div>
    </article>
  );
}
