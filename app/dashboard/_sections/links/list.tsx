import LinkItem from "./item";

type Item = {
  id: string;
  label: string;
  url: string;
};

export default function LinkList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-pf-border p-4 text-center text-sm text-pf-muted">No links added yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <LinkItem
          key={item.id}
          item={item}
          initial={{ label: item.label, url: item.url }}
        />
      ))}
    </ul>
  );
}