import { createClient } from "@sanity/client";

import { logger } from "~/models/logger.server";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";

import {
  MELDEKORT_BRUKERFLATE_QUERY,
  type MeldekortBrukerflateApiResponse,
} from "./queries/meldekort-brukerflate";
import { sanityConfig } from "./sanity.config";
import { allTextsQuery } from "./sanity.query";
import type { ISanity } from "./sanity.types";

const sanityClient = createClient(sanityConfig);

export type SanityData = {
  sanityTexts: ISanity | undefined;
  sanityTextsHasError: boolean;
  sanityTekst: MeldekortBrukerflateApiResponse | undefined;
  sanityTekstHasError: boolean;
};

async function fetchSanity<T>(
  query: string,
  params: Record<string, string>,
  contentName: string,
): Promise<T | undefined> {
  try {
    return await sanityClient.fetch<T>(query, params);
  } catch (error: unknown) {
    logger.error("Kunne ikke hente innhold fra Sanity", {
      contentName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return undefined;
  }
}

export async function hentSanityTekster(language: DecoratorLocale): Promise<SanityData> {
  const [sanityTexts, sanityTekstResult] = await Promise.all([
    fetchSanity<ISanity>(
      allTextsQuery,
      {
        baseLang: DecoratorLocale.NB,
        lang: language,
      },
      "legacy-tekster",
    ),
    fetchSanity<MeldekortBrukerflateApiResponse>(
      MELDEKORT_BRUKERFLATE_QUERY,
      {
        language,
        fallbackLanguage: DecoratorLocale.NB,
      },
      "meldekort-brukerflate",
    ),
  ]);

  const sanityData = {
    sanityTexts,
    sanityTextsHasError: sanityTexts === undefined,
    sanityTekst: sanityTekstResult,
    sanityTekstHasError: sanityTekstResult === undefined,
  };

  return sanityData;
}
