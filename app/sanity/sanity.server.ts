import { createClient } from "@sanity/client";

import { DecoratorLocale } from "~/utils/dekoratoren.utils";

import {
  MELDEKORT_BRUKERFLATE_QUERY,
  type MeldekortBrukerflateApiResponse,
} from "./queries/meldekort-brukerflate";
import { sanityConfig } from "./sanity.config";
import { allTextsQuery } from "./sanity.query";
import type { ISanity } from "./sanity.types";

const sanityClient = createClient(sanityConfig);

export async function hentSanityTekster(language: DecoratorLocale) {
  const [sanityTexts, sanityTekstResult] = await Promise.all([
    sanityClient.fetch<ISanity>(allTextsQuery, {
      baseLang: DecoratorLocale.NB,
      lang: language,
    }),
    sanityClient
      .fetch<MeldekortBrukerflateApiResponse>(MELDEKORT_BRUKERFLATE_QUERY, {
        language,
        fallbackLanguage: DecoratorLocale.NB,
      })
      .then((data) => ({ data, hasError: false }))
      .catch((error: unknown) => {
        console.error("Kunne ikke hente meldekort-brukerflate fra Sanity", error);
        return { data: null, hasError: true };
      }),
  ]);

  return {
    sanityTexts,
    sanityTekst: sanityTekstResult.data,
    sanityTekstHasError: sanityTekstResult.hasError,
  };
}
