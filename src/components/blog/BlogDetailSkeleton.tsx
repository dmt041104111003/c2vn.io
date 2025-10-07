export default function BlogDetailSkeleton() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-gray-950">
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-3">
              {/* Back to Blog link */}
              <div className="mb-8">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
              
          <header className="mb-12">
                {/* Meta info */}
            <div className="mb-6 flex items-center gap-4">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-blue-200/40 dark:bg-blue-800/40 rounded animate-pulse" />
                </div>
                
                {/* Title */}
                <div className="mb-8">
                  <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                  <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <div className="h-6 w-20 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                  <div className="h-6 w-16 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                  <div className="h-6 w-18 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                  <div className="h-6 w-22 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                  <div className="h-6 w-14 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
            </div>
          </header>
              
              {/* Featured Image */}
          <div className="relative h-64 w-full overflow-hidden rounded-lg sm:h-80 lg:h-96 mb-8">
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
              
              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="space-y-4">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-2/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              
              {/* Related Posts Section */}
              <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-8">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="grid max-w-none gap-8 md:gap-10 lg:gap-8 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col">
                      <div className="rounded-xl border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-xl h-full flex flex-col overflow-hidden">
                        <div className="relative h-48 overflow-hidden">
                          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                        <div className="p-4 flex flex-col">
                          <div className="flex flex-wrap gap-1 mb-2">
                            <div className="h-4 w-16 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                            <div className="h-4 w-12 bg-blue-200/20 dark:bg-blue-800/20 rounded-full animate-pulse" />
                          </div>
                          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="flex items-center justify-between">
                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-blue-200/40 dark:bg-blue-800/40 rounded animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  </div>
                </div>
              </footer>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Latest Posts Sidebar */}
                <div className="w-full max-w-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  
                  <div className="rounded-md ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm divide-y divide-gray-200/70 dark:divide-gray-700/60 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between py-3 px-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden rounded-lg">
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Service Ad Card */}
                <div className="w-full max-w-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  
                  <div className="rounded-md ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm divide-y divide-gray-200/70 dark:divide-gray-700/60 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-3 px-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="min-w-0 flex-1">
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-6 w-16 bg-blue-200/40 dark:bg-blue-800/40 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
            </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
} 