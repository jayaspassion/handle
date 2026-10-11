import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export default function DashboardSection({
  id,
  title,
  description,
  children,
}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="card p-5 scroll-mt-16 lg:scroll-mt-6"
    >
      <h2 id={`${id}-heading`} className="font-serif text-xl">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-pf-muted">{description}</p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}
