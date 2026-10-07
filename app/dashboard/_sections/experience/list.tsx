import ExperienceItem from "./item";

type Item = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
};

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Date -> "YYYY-MM", the format the month picker uses
const toMonth = (date: Date) => date.toISOString().slice(0, 7);

export default function ExperienceList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-gray-600">No experience added yet.</p>;
  }

  return (
    <ul className="mt-4 max-w-xl space-y-3">
      {items.map((item) => (
        <ExperienceItem
          key={item.id}
          item={{
            id: item.id,
            role: item.role,
            company: item.company,
            location: item.location,
            range: `${formatMonth(item.startDate)} – ${
              item.endDate ? formatMonth(item.endDate) : "Present"
            }`,
            description: item.description,
          }}
          initial={{
            company: item.company,
            role: item.role,
            location: item.location ?? "",
            startDate: toMonth(item.startDate),
            endDate: item.endDate ? toMonth(item.endDate) : "",
            description: item.description ?? "",
            current: item.endDate ? "" : "on",
          }}
        />
      ))}
    </ul>
  );
}