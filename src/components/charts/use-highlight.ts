"use client";

import { useState } from "react";

/**
 * Hover + tap highlighting for chart marks. Hover previews a mark; a click/tap pins
 * it (and a second click unpins). Keeping the two apart means hovering then clicking
 * with a mouse selects instead of immediately toggling off.
 */
export function useHighlight<T>() {
  const [hovered, setHovered] = useState<T | null>(null);
  const [selected, setSelected] = useState<T | null>(null);

  return {
    /** The mark to emphasize right now. */
    active: hovered ?? selected,
    selected,
    hover: (id: T) => setHovered(id),
    leave: () => setHovered(null),
    toggle: (id: T) => setSelected((current) => (current === id ? null : id)),
  };
}
