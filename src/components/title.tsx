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
        <div className="relative group inline-block">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-6xl" aria-label={description}>{title}</h1>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[99999]">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-nowrap relative shadow-lg border border-gray-900/20 dark:border-gray-100/20">
              {description}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-gray-900 dark:border-l-gray-100 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative group max-w-3xl inline-block">
        <p className="text-xl text-gray-600 dark:text-gray-300" aria-label={description}>{truncated}</p>
        {truncated !== description && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[99999]">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-nowrap relative shadow-lg border border-gray-900/20 dark:border-gray-100/20">
              {description}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-gray-900 dark:border-l-gray-100 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
