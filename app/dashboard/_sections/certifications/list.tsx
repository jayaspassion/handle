import CertificationItem from "./item";

type Item = {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date | null;
  expiryDate: Date | null;
  credentialUrl: string | null;
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

export default function CertificationList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-gray-600">No certifications added yet.</p>;
  }

  return (
    <ul className="mt-4 max-w-xl space-y-3">
      {items.map((item) => {
        const parts: string[] = [];
        if (item.issueDate) parts.push(`Issued ${formatMonth(item.issueDate)}`);
        if (item.expiryDate) parts.push(`Expires ${formatMonth(item.expiryDate)}`);

        return (
          <CertificationItem
            key={item.id}
            item={{
              id: item.id,
              name: item.name,
              issuer: item.issuer,
              dates: parts.join(" · "),
              credentialUrl: item.credentialUrl,
            }}
            initial={{
              name: item.name,
              issuer: item.issuer,
              issueDate: item.issueDate ? toMonth(item.issueDate) : "",
              expiryDate: item.expiryDate ? toMonth(item.expiryDate) : "",
              credentialUrl: item.credentialUrl ?? "",
            }}
          />
        );
      })}
    </ul>
  );
}