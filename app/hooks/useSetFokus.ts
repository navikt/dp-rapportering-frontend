import { RefObject } from "react";

export function useSetFokus() {
  function setFocus(ref: RefObject<HTMLElement>, previewScroll = true) {
    ref.current?.focus({ preventScroll: previewScroll });
  }

  return { setFocus };
}
