"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

// Widest an image may be next to the text, as width / height (4:3)
const MAX_RATIO = 4 / 3;
const LINK_REL = "nofollow ugc noopener noreferrer";
const textLink =
  "inline-flex items-center gap-1.5 font-medium text-pf-accent underline-offset-4 hover:underline";

function Chips({ items }: { items: string[] }) {
  return (
    <ul aria-label="Tags" className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="chip">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Links({ liveUrl, repoUrl }: { liveUrl: string | null; repoUrl: string | null }) {
  if (!liveUrl && !repoUrl) return null;
  const arrow = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
  return (
    <p className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-5 text-sm">
      {liveUrl && (
        <a href={liveUrl} target="_blank" rel={LINK_REL} className={textLink}>
          Live site
          {arrow}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      {repoUrl && (
        <a href={repoUrl} target="_blank" rel={LINK_REL} className={textLink}>
          Source code
          {arrow}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </p>
  );
}

// One project on the public page. Every card has the same height and the
// same 20rem text column; a card with an image adds the image on the left,
// as wide as the image's own shape allows (capped at 4:3), measured from the
// card's height in the browser. Long text is
// clamped, and "Show more" opens a dialog with everything, so the card itself
// never changes size. Print shows everything in place.
export default function ProjectCard({
  title,
  description,
  imageUrl,
  tags,
  liveUrl,
  repoUrl,
  single = false,
}: {
  title: string;
  description: string | null;
  imageUrl: string | null;
  tags: string[];
  liveUrl: string | null; // already checked as http(s) by the page
  repoUrl: string | null;
  single?: boolean; // the only project: text may use the full width
}) {
  const [clipped, setClipped] = useState(false);
  const [ratio, setRatio] = useState(1);
  const [cardHeight, setCardHeight] = useState(0);
  const articleRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Is anything cut off? Measured on load and on resize.
  useLayoutEffect(() => {
    const measure = () => {
      const els = [titleRef.current, descRef.current, tagsRef.current];
      setClipped(els.some((el) => !!el && el.scrollHeight > el.clientHeight + 1));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [description, title]);

  // Image column width = card height x the image's shape (capped at 4:3).
  // The card's height comes from the text, so measuring it is safe.
  useLayoutEffect(() => {
    const img = imgRef.current;
    // The image may have loaded before the page became interactive
    if (img?.complete && img.naturalWidth && img.naturalHeight) {
      setRatio(Math.min(img.naturalWidth / img.naturalHeight, MAX_RATIO));
    }
    const el = articleRef.current;
    if (!el || !imageUrl) return;
    const observer = new ResizeObserver(([entry]) => setCardHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, [imageUrl]);

  // 1.5rem of padding above and below the image, 0.75rem on its left
  const imageColumn = cardHeight > 0 ? `${Math.round((cardHeight - 24) * ratio + 12)}px` : undefined;

  function close() {
    dialogRef.current?.close();
  }

  const print = "print:line-clamp-none print:max-h-none";

  return (
    <article
      ref={articleRef}
      className="card card-accent flex h-full flex-col overflow-hidden bg-pf-surface p-0 sm:flex-row"
    >
      {/* The image column takes the card's height and gets its width from
          the image's shape (set once it loads), so it never sets the height */}
      {imageUrl && (
        <div
          style={imageColumn ? ({ "--img-col": imageColumn } as CSSProperties) : undefined}
          className="relative shrink-0 p-3 pb-0 sm:w-[var(--img-col,15rem)] sm:p-3 sm:pr-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt={`Screenshot of ${title}`}
            loading="lazy"
            onLoad={(e) => {
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
              if (w && h) setRatio(Math.min(w / h, MAX_RATIO));
            }}
            className="h-40 w-full rounded-lg border border-pf-border object-cover object-top sm:absolute sm:left-3 sm:top-3 sm:h-[calc(100%-1.5rem)] sm:w-[calc(100%-0.75rem)]"
          />
        </div>
      )}
      <div className={`flex min-w-0 flex-col p-4 ${single ? "flex-1" : "flex-1 sm:w-80 sm:flex-none"}`}>
        <h3 ref={titleRef} className={`break-words font-serif text-lg line-clamp-2 ${print}`}>
          {title}
        </h3>
        {description && (
          <p
            ref={descRef}
            className={`mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-pf-muted line-clamp-4 ${print}`}
          >
            {description}
          </p>
        )}
        {tags.length > 0 && (
          <div ref={tagsRef} className={`mt-4 max-h-[4.25rem] overflow-hidden ${print}`}>
            <Chips items={tags} />
          </div>
        )}
        {clipped && (
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="dialog"
            onClick={() => dialogRef.current?.showModal()}
            className="mt-3 inline-flex min-h-10 items-center self-start text-sm font-medium text-pf-accent underline-offset-4 hover:underline print:hidden"
          >
            Show more
            <span className="sr-only"> about {title}</span>
          </button>
        )}
        <Links liveUrl={liveUrl} repoUrl={repoUrl} />
      </div>

      {/* Full project. Native dialog: focus is kept inside, Esc closes, and
          focus returns to "Show more". A click on the backdrop closes too. */}
      {clipped && (
        <dialog
          ref={dialogRef}
          aria-label={title}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onClose={() => buttonRef.current?.focus()}
          className="m-auto max-h-[calc(100dvh-2rem)] w-[min(42rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-pf-border bg-pf-surface p-0 text-pf-fg shadow-2xl backdrop:bg-black/50 print:hidden"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="break-words font-serif text-2xl">{title}</h3>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="-m-2 grid h-10 w-10 shrink-0 place-items-center rounded-md text-pf-muted hover:text-pf-fg"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`Screenshot of ${title}`}
                className="mt-4 max-h-[50dvh] w-full rounded-lg border border-pf-border object-contain"
              />
            )}
            {description && (
              <p className="mt-4 whitespace-pre-line break-words leading-relaxed text-pf-muted">
                {description}
              </p>
            )}
            {tags.length > 0 && (
              <div className="mt-4">
                <Chips items={tags} />
              </div>
            )}
            <Links liveUrl={liveUrl} repoUrl={repoUrl} />
          </div>
        </dialog>
      )}
    </article>
  );
}
