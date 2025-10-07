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
        <div className="relative group">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-6xl cursor-help" aria-label={description}>{title}</h1>
          <div
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full mt-2 hidden max-w-[80vw] rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 z-[99999]"
          >
            {description}
          </div>
        </div>
      </div>
      <div className="relative group max-w-3xl">
        <p className="text-xl text-gray-600 dark:text-gray-300 cursor-help" aria-label={description}>{truncated}</p>
        {truncated !== description && (
          <div
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full mt-2 hidden max-w-[90vw] rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 z-[99999]"
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
