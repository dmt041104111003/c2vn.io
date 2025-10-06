import StarIcon from "../ui/StarIcon";

export default function VideoSectionSkeleton() {
  return (
    <section id="videos" className="relative flex min-h-screen items-center border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40">
      <div className="mx-auto w-5/6 max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-20">
        <div className="relative">
          <div className="mb-8 lg:mb-16">
            <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
              <StarIcon size="lg" className="w-16 h-16" />
              <div className="h-8 lg:h-12 w-64 lg:w-96 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-6 lg:h-8 w-96 lg:w-[500px] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <div className="w-full lg:w-[60%]">
              <div className="relative w-full aspect-video rounded-lg lg:rounded-xl overflow-hidden mb-4 lg:mb-6 shadow-lg lg:shadow-2xl bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-6 lg:h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
              <div className="h-4 lg:h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            <div className="w-full lg:w-[40%]">
              <div className="mb-4 lg:mb-6">
                <div className="h-6 lg:h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>

              <div className="rounded-md ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="group relative flex items-center py-3 px-3">
                      <div className="w-0.5 bg-gray-300 dark:bg-gray-600 opacity-30 absolute left-0 top-0 bottom-0"></div>
                      
                      <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden mr-3 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                      
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-1 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 