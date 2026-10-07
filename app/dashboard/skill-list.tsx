import SkillItem from "./skill-item";

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
    return <p className="mt-4 text-sm text-gray-600">No skills added yet.</p>;
  }

  return (
    <ul className="mt-4 max-w-xl space-y-2">
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