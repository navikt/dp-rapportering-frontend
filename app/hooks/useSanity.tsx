import { type SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import { type loader } from "~/root";
import { type ISanityInfoside } from "~/sanity/sanity.types";

export function useSanity() {
  const { sanityTexts } = useRouteLoaderData("root") as SerializeFrom<typeof loader>;

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
