import { useEffect, useState, type RefObject } from 'react';

// [DY INTEGRATION] Dev-only detector that reports whether a DY slot's DOM has
// been overridden by a live DY campaign (Custom Action / Recommendation Widget)
// versus still showing the React fallback content.
//
// How it works: the React fallback is rendered inside a single direct child
// marked `[data-dy-fallback]`. We observe ONLY the slot's direct children
// (not the subtree), so internal animations (e.g. the hero carousel crossfade)
// never trigger a false positive. DY injection — whether it replaces the
// container's innerHTML or appends a sibling — necessarily changes the direct
// child set, which is what we detect.
//
// No-ops entirely in production builds (`import.meta.env.DEV` is false).
export function useDYSlotOverride(ref: RefObject<HTMLElement | null>): boolean {
  const [overridden, setOverridden] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const el = ref.current;
    if (!el) return;

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== 'childList') continue;
        const foreignAdded = Array.from(m.addedNodes).some(
          (n) => n.nodeType === 1 && !(n as Element).hasAttribute('data-dy-fallback'),
        );
        const fallbackRemoved = Array.from(m.removedNodes).some(
          (n) => n.nodeType === 1 && (n as Element).hasAttribute('data-dy-fallback'),
        );
        if (foreignAdded || fallbackRemoved) {
          setOverridden(true);
          break;
        }
      }
    });

    observer.observe(el, { childList: true });
    return () => observer.disconnect();
  }, [ref]);

  return overridden;
}
