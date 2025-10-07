import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import { baseOptions } from "~/app/layout.config";
import { source } from "~/app/lib/source";
import BackToTop from "~/components/ui/BackToTop";
import DocsToggle from "../../components/docs/Docs-toggle";
import "fumadocs-ui/css/ocean.css";
import "fumadocs-ui/css/preset.css";

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="docs-isolated-container relative">
        <div className="fixed left-[-200px] top-1/2 -translate-y-1/2 z-0 opacity-10 pointer-events-none select-none block">
          <img
            src="/images/common/loading.png"
            alt="Cardano2VN Logo"
            className="w-[1200px] h-[1200px] object-contain object-left blur-[1px]"
            draggable={false}
          />
        </div>

        <RootProvider>
          <DocsLayout {...docsOptions}>{children}</DocsLayout>
        </RootProvider>
        <DocsToggle />
        <BackToTop />
      </div>
    </>
  );
}