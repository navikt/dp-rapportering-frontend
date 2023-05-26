import { useRouteLoaderData } from "@remix-run/react";
import type { ISanityInfoside, ISanityTexts } from "~/sanity/sanity.types";

export function useSanity() {
  const { sanityTexts } = useRouteLoaderData("root") as {
    sanityTexts: ISanityTexts;
  };

  function getAppTekst(textId: string): string {
    return (
      sanityTexts?.apptekster.find((apptekst) => apptekst.textId === textId)?.valueText || textId
    );
  }

  function getInfosideTekst(slug: string): ISanityInfoside | undefined {
    return sanityTexts?.infosider.find((side) => {
      return side.slug === slug;
    });
  }

  return {
    getAppTekst,
    getInfosideTekst,
  };
}
