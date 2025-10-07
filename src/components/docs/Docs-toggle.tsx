"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "~/components/ui/theme-toggle";

function findFirst(selectors: string[]): HTMLElement | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el) return el;
  }
  return null;
}

function useDynamicTarget(selectors: string[]) {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const update = () => {
      const target = findFirst(selectors);
      if (target && target !== el) setEl(target);
    };

    update();

    const observer = new MutationObserver(() => update());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, selectors);

  return el;
}

export default function DocsToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const sidebarEl = useDynamicTarget([
    "[data-fumadocs-sidebar]",
    "[data-fumadocs-sidebar] nav",
    "aside[aria-label='Sidebar']",
    "aside[class*='sidebar']",
    "nav[aria-label='Sidebar']",
  ]);

  const mobileTarget = useDynamicTarget([
    "[data-fumadocs-mobile-menu]",
    "[data-fumadocs-mobile-sidebar]",
    "[data-fumadocs-mobile-toc]",
    "[data-fumadocs-header]",
    "body", 
  ]);

  return (
    <>
      {mounted && sidebarEl && createPortal(
        <div className="hidden md:flex sticky bottom-2 mt-3 pt-3 items-center justify-end pr-2 z-[99999]">
          <ThemeToggle />
        </div>,
        sidebarEl
      )}
      {mounted && mobileTarget && createPortal(
        <div className="md:hidden fixed left-6 bottom-8 z-[99999]">
          <ThemeToggle />
        </div>,
        mobileTarget
      )}
      {mounted && typeof document !== 'undefined' && !sidebarEl && !mobileTarget && createPortal(
        <div className="fixed left-6 bottom-8 z-[99999]">
          <ThemeToggle />
        </div>,
        document.body
      )}
    </>
  );
}


