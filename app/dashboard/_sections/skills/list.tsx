import SkillItem from "./item";

type Item = {
  id: string;
  name: string;
  category: string | null;
};

export default function SkillList({
  items,
  categories,
}: {
  items: Item[];
  categories: string[];
}) {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-pf-border p-4 text-center text-sm text-pf-muted">No skills added yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <SkillItem
          key={item.id}
          item={item}
          categories={categories}
          initial={{ name: item.name, category: item.category ?? "" }}
        />
      ))}
    </ul>
  );
}