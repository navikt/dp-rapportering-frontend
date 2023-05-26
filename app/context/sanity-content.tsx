import { useOutletContext } from "@remix-run/react";
import type { ISanityInfoside, ISanityTexts } from "~/sanity/sanity.types";

export function useSanity() {
  const context = useOutletContext<ISanityTexts>();

  function getAppTekst(textId: string): string {
    return context?.apptekster.find((apptekst) => apptekst.textId === textId)?.valueText || textId;
  }

  function getInfosideTekst(slug: string): ISanityInfoside | undefined {
    return context?.infosider.find((side) => {
      return side.slug === slug;
    });
  }

  return {
    getAppTekst,
    getInfosideTekst,
  };
}
