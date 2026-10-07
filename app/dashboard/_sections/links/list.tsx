import LinkItem from "./item";

type Item = {
  id: string;
  label: string;
  url: string;
};

export default function LinkList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-gray-600">No links added yet.</p>;
  }

  return (
    <ul className="mt-4 max-w-xl space-y-2">
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