import { deleteExperience } from "./experience-actions";

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

export default function ExperienceList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-gray-600">No experience added yet.</p>;
  }

  return (
    <ul className="mt-4 max-w-xl space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-md border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{item.role}</p>
              <p className="text-sm">
                {item.company}
                {item.location ? ` · ${item.location}` : ""}
              </p>
              <p className="text-sm text-gray-600">
                {formatMonth(item.startDate)} –{" "}
                {item.endDate ? formatMonth(item.endDate) : "Present"}
              </p>
              {item.description && (
                <p className="mt-2 whitespace-pre-line text-sm">{item.description}</p>
              )}
            </div>
            <form action={deleteExperience}>
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}