import type { ISanityInfoside } from "~/sanity/sanity.types";
import { useTypedRouteLoaderData } from "./useTypedRouteLoaderData";

export function useSanity() {
  const { sanityTexts } = useTypedRouteLoaderData("root");

  function hentAppTekstMedId(textId: string): string {
    return (
      sanityTexts?.apptekster.find((apptekst) => apptekst.textId === textId)?.valueText || textId
    );
  }

  function hentInfosideTekstMedId(slug: string): ISanityInfoside | undefined {
    return sanityTexts?.infosider.find((side) => {
      return side.slug === slug;
    });
  }

  return {
    hentAppTekstMedId,
    hentInfosideTekstMedId,
  };
}
