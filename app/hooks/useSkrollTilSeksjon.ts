import { RefObject } from "react";

export function useScrollToView() {
  function scrollToView(ref: RefObject<HTMLElement>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return {
    scrollToView,
  };
}
