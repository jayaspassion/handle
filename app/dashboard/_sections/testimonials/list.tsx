import TestimonialItem from "./item";

type Item = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatarUrl: string | null;
};

export default function TestimonialList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-pf-border p-4 text-center text-sm text-pf-muted">No testimonials added yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <TestimonialItem
          key={item.id}
          item={{
            id: item.id,
            quote: item.quote,
            authorName: item.authorName,
            byline: [item.authorRole, item.authorCompany]
              .filter(Boolean)
              .join(" at "),
          }}
          initial={{
            quote: item.quote,
            authorName: item.authorName,
            authorRole: item.authorRole ?? "",
            authorCompany: item.authorCompany ?? "",
            authorAvatarUrl: item.authorAvatarUrl ?? "",
          }}
        />
      ))}
    </ul>
  );
}