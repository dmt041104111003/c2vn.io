import StarIcon from "~/components/ui/StarIcon";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Title({ title, description }: { title: string; description: string }) {
  const maxLength = 200;
  const slice = description.slice(0, maxLength);
  const lastSpaceIndex = slice.lastIndexOf(" ");
  const truncated = description.length > maxLength
    ? (lastSpaceIndex > 0 ? slice.slice(0, lastSpaceIndex) : slice).trim() + "…"
    : description;

  const titleAnchorRef = useRef<HTMLDivElement>(null);
  const descAnchorRef = useRef<HTMLDivElement>(null);
  const titleTipRef = useRef<HTMLDivElement>(null);
  const descTipRef = useRef<HTMLDivElement>(null);
  const [titleTipVisible, setTitleTipVisible] = useState(false);
  const [descTipVisible, setDescTipVisible] = useState(false);
  const [titleTipStyle, setTitleTipStyle] = useState<React.CSSProperties>({});
  const [descTipStyle, setDescTipStyle] = useState<React.CSSProperties>({});
  const [titleTipSide, setTitleTipSide] = useState<'left' | 'right' | 'bottom' | 'top'>('left');
  const [descTipSide, setDescTipSide] = useState<'left' | 'right' | 'bottom' | 'top'>('left');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function placeTooltip(
    anchor: HTMLElement | null,
    tip: HTMLElement | null,
    setStyle: (s: React.CSSProperties) => void,
    setSide?: (side: 'left' | 'right' | 'bottom' | 'top') => void
  ) {
    if (!anchor || !tip) return;
    const a = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;
    const pad = 8;
    const tipW = tip.offsetWidth || 0;
    const tipH = tip.offsetHeight || 0;

    let x = a.left - tipW - margin;
    let y = a.top + a.height / 2 - tipH / 2;
    if (x >= pad && y >= pad && y + tipH <= vh - pad) {
      setStyle({ position: "fixed", left: x, top: Math.max(pad, Math.min(y, vh - tipH - pad)) });
      setSide && setSide('left');
      return;
    }
    x = a.right + margin; y = a.top + a.height / 2 - tipH / 2;
    if (x + tipW <= vw - pad && y >= pad && y + tipH <= vh - pad) {
      setStyle({ position: "fixed", left: x, top: Math.max(pad, Math.min(y, vh - tipH - pad)) });
      setSide && setSide('right');
      return;
    }
    x = a.left + a.width / 2 - tipW / 2; y = a.bottom + margin;
    if (y + tipH <= vh - pad) {
      setStyle({ position: "fixed", left: Math.max(pad, Math.min(x, vw - tipW - pad)), top: y });
      setSide && setSide('bottom');
      return;
    }
    x = a.left + a.width / 2 - tipW / 2; y = a.top - tipH - margin;
    setStyle({ position: "fixed", left: Math.max(pad, Math.min(x, vw - tipW - pad)), top: Math.max(pad, y) });
    setSide && setSide('top');
  }

  return (
    <div className="relative mb-16">
      <div className="mb-6 flex items-center gap-4">
        <StarIcon size="lg" className="w-16 h-16" />
        <div
          ref={titleAnchorRef}
          className="relative inline-block"
          onMouseEnter={() => { setTitleTipVisible(true); requestAnimationFrame(() => placeTooltip(titleAnchorRef.current, titleTipRef.current, setTitleTipStyle, setTitleTipSide)); }}
          onMouseMove={() => placeTooltip(titleAnchorRef.current, titleTipRef.current, setTitleTipStyle, setTitleTipSide)}
          onMouseLeave={() => setTitleTipVisible(false)}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-6xl" aria-label={description}>{title}</h1>
        </div>
        {mounted && titleTipVisible && createPortal(
          <div ref={titleTipRef} style={titleTipStyle} className="pointer-events-none z-[2147483647] fixed">
            <div className="relative bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-pre-line shadow-lg border border-gray-900/20 dark:border-gray-100/20">
              {description}
              {titleTipSide === 'left' && (
                <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-gray-900 dark:border-l-gray-100" />
              )}
              {titleTipSide === 'right' && (
                <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-gray-900 dark:border-r-gray-100" />
              )}
              {titleTipSide === 'bottom' && (
                <div className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-gray-900 dark:border-b-gray-100" />
              )}
              {titleTipSide === 'top' && (
                <div className="absolute bottom-0 translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900 dark:border-t-gray-100" />
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
      <div
        ref={descAnchorRef}
        className="relative max-w-3xl inline-block"
        onMouseEnter={() => { if (truncated !== description) { setDescTipVisible(true); requestAnimationFrame(() => placeTooltip(descAnchorRef.current, descTipRef.current, setDescTipStyle, setDescTipSide)); } }}
        onMouseMove={() => { if (descTipVisible) placeTooltip(descAnchorRef.current, descTipRef.current, setDescTipStyle, setDescTipSide); }}
        onMouseLeave={() => setDescTipVisible(false)}
      >
        <p className="text-xl text-gray-600 dark:text-gray-300" aria-label={description}>{truncated}</p>
      </div>
      {mounted && descTipVisible && truncated !== description && createPortal(
        <div ref={descTipRef} style={descTipStyle} className="pointer-events-none z-[2147483647] fixed">
          <div className="relative bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-pre-line shadow-lg border border-gray-900/20 dark:border-gray-100/20">
            {description}
            {descTipSide === 'left' && (
              <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-gray-900 dark:border-l-gray-100" />
            )}
            {descTipSide === 'right' && (
              <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-gray-900 dark:border-r-gray-100" />
            )}
            {descTipSide === 'bottom' && (
              <div className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-gray-900 dark:border-b-gray-100" />
            )}
            {descTipSide === 'top' && (
              <div className="absolute bottom-0 translate-y-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900 dark:border-t-gray-100" />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
