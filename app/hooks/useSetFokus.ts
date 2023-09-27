import type { RefObject } from "react";

export function useSetFokus() {
  function setFokus(ref: RefObject<HTMLElement>, previewScroll = true) {
    ref.current?.focus({ preventScroll: previewScroll });
  }

  return { setFokus };
}
