import ThreeStarIcon from "~/components/ui/ThreeStarIcon";

export default function Title({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative mb-16">
      <div className="mb-6 flex items-center gap-4">
        <ThreeStarIcon size="md" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-6xl">{title}</h1>
      </div>
      <p className="max-w-3xl text-xl text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
