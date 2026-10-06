import EducationItem from "./education-item";

type Item = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
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

export default function EducationList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-gray-600">No education added yet.</p>;
  }

  return (
    <ul className="mt-4 max-w-xl space-y-3">
      {items.map((item) => (
        <EducationItem
          key={item.id}
          item={{
            id: item.id,
            degree: item.degree,
            fieldOfStudy: item.fieldOfStudy,
            institution: item.institution,
            range: `${formatMonth(item.startDate)} – ${
              item.endDate ? formatMonth(item.endDate) : "Present"
            }`,
            description: item.description,
          }}
          initial={{
            institution: item.institution,
            degree: item.degree,
            fieldOfStudy: item.fieldOfStudy ?? "",
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