import { RefObject } from "react";

export function useSkrollTilSeksjon() {
  function scrollTilSeksjon(ref: RefObject<HTMLElement>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return {
    scrollTilSeksjon,
  };
}
