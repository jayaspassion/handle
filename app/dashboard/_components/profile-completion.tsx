type Item = { label: string; done: boolean; href: string };

export default function ProfileCompletion({ items }: { items: Item[] }) {
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-xl">Profile completion</h2>
        <p className="text-sm text-pf-muted">
          {done} of {items.length} complete
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Profile completion"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={done}
        className="mt-3 h-2 overflow-hidden rounded-full bg-pf-tint"
      >
        <div
          className="h-full rounded-full bg-pf-brand"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="shrink-0 text-pf-success"
              >
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <path
                  d="M7.5 12.5l3 3 6-6.5"
                  fill="none"
                  stroke="var(--pf-bg)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="shrink-0 text-pf-muted"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9.25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            )}
            {item.done ? (
              <span>{item.label}</span>
            ) : (
              <a
                href={item.href}
                className="text-pf-accent underline-offset-4 hover:underline"
              >
                {item.label}
              </a>
            )}
            <span className="sr-only">{item.done ? " (done)" : " (to do)"}</span>
          </li>
        ))}
      </ul>

      {done === items.length && (
        <p className="mt-4 text-sm text-pf-success">Your profile is complete.</p>
      )}
    </div>
  );
}
