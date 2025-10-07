import StarIcon from "~/components/ui/StarIcon";

export default function Title({ title, description }: { title: string; description: string }) {
  const halfLength = Math.ceil(description.length / 2);
  const halfSlice = description.slice(0, halfLength);
  const lastSpaceIndex = halfSlice.lastIndexOf(" ");
  const truncated = description.length > halfLength
    ? (lastSpaceIndex > 0 ? halfSlice.slice(0, lastSpaceIndex) : halfSlice).trim() + "…"
    : description;

  return (
    <div className="relative mb-16">
      <div className="mb-6 flex items-center gap-4">
        <StarIcon size="lg" className="w-16 h-16" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-6xl" title={description} aria-label={description}>{title}</h1>
      </div>
      <p className="max-w-3xl text-xl text-gray-600 dark:text-gray-300" title={description} aria-label={description}>{truncated}</p>
    </div>
  );
}
