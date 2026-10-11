import ProjectItem from "./item";

type Item = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  tags: string[];
};

export default function ProjectList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-pf-border p-4 text-center text-sm text-pf-muted">No projects added yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <ProjectItem
          key={item.id}
          item={{
            id: item.id,
            title: item.title,
            description: item.description,
            tags: item.tags,
            liveUrl: item.liveUrl,
            repoUrl: item.repoUrl,
          }}
          initial={{
            title: item.title,
            description: item.description ?? "",
            tags: item.tags.join(", "),
            liveUrl: item.liveUrl ?? "",
            repoUrl: item.repoUrl ?? "",
            coverImageUrl: item.coverImageUrl ?? "",
          }}
        />
      ))}
    </ul>
  );
}