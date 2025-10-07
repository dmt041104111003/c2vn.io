import StarIcon from "~/components/ui/StarIcon";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Title({ title, description }: { title: string; description: string }) {
  const halfLength = Math.ceil(description.length / 2);
  const halfSlice = description.slice(0, halfLength);
  const lastSpaceIndex = halfSlice.lastIndexOf(" ");
  const truncated = description.length > halfLength
    ? (lastSpaceIndex > 0 ? halfSlice.slice(0, lastSpaceIndex) : halfSlice).trim() + "…"
    : description;

  const titleAnchorRef = useRef<HTMLDivElement>(null);
  const descAnchorRef = useRef<HTMLDivElement>(null);
  const titleTipRef = useRef<HTMLDivElement>(null);
  const descTipRef = useRef<HTMLDivElement>(null);
  const [titleTipVisible, setTitleTipVisible] = useState(false);
  const [descTipVisible, setDescTipVisible] = useState(false);
  const [titleTipStyle, setTitleTipStyle] = useState<React.CSSProperties>({});
  const [descTipStyle, setDescTipStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function placeTooltip(anchor: HTMLElement | null, tip: HTMLElement | null, setStyle: (s: React.CSSProperties) => void) {
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
      return;
    }
    x = a.right + margin; y = a.top + a.height / 2 - tipH / 2;
    if (x + tipW <= vw - pad && y >= pad && y + tipH <= vh - pad) {
      setStyle({ position: "fixed", left: x, top: Math.max(pad, Math.min(y, vh - tipH - pad)) });
      return;
    }
    x = a.left + a.width / 2 - tipW / 2; y = a.bottom + margin;
    if (y + tipH <= vh - pad) {
      setStyle({ position: "fixed", left: Math.max(pad, Math.min(x, vw - tipW - pad)), top: y });
      return;
    }
    x = a.left + a.width / 2 - tipW / 2; y = a.top - tipH - margin;
    setStyle({ position: "fixed", left: Math.max(pad, Math.min(x, vw - tipW - pad)), top: Math.max(pad, y) });
  }

  return (
    <div className="relative mb-16">
      <div className="mb-6 flex items-center gap-4">
        <StarIcon size="lg" className="w-16 h-16" />
        <div
          ref={titleAnchorRef}
          className="relative inline-block"
          onMouseEnter={() => { setTitleTipVisible(true); requestAnimationFrame(() => placeTooltip(titleAnchorRef.current, titleTipRef.current, setTitleTipStyle)); }}
          onMouseMove={() => placeTooltip(titleAnchorRef.current, titleTipRef.current, setTitleTipStyle)}
          onMouseLeave={() => setTitleTipVisible(false)}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-6xl" aria-label={description}>{title}</h1>
        </div>
        {mounted && titleTipVisible && createPortal(
          <div ref={titleTipRef} style={titleTipStyle} className="pointer-events-none z-[2147483647] fixed">
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-pre-line shadow-lg border border-gray-900/20 dark:border-gray-100/20">
              {description}
            </div>
          </div>,
          document.body
        )}
      </div>
      <div
        ref={descAnchorRef}
        className="relative max-w-3xl inline-block"
        onMouseEnter={() => { if (truncated !== description) { setDescTipVisible(true); requestAnimationFrame(() => placeTooltip(descAnchorRef.current, descTipRef.current, setDescTipStyle)); } }}
        onMouseMove={() => { if (descTipVisible) placeTooltip(descAnchorRef.current, descTipRef.current, setDescTipStyle); }}
        onMouseLeave={() => setDescTipVisible(false)}
      >
        <p className="text-xl text-gray-600 dark:text-gray-300" aria-label={description}>{truncated}</p>
      </div>
      {mounted && descTipVisible && truncated !== description && createPortal(
        <div ref={descTipRef} style={descTipStyle} className="pointer-events-none z-[2147483647] fixed">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg whitespace-pre-line shadow-lg border border-gray-900/20 dark:border-gray-100/20">
            {description}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
