import { RefObject } from "react";

export function useScrollIntoView() {
  function scrollIntoView(ref: RefObject<HTMLElement>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return {
    scrollIntoView,
  };
}
