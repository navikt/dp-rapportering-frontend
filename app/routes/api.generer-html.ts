import { ActionFunctionArgs } from "@remix-run/node";
import { createClient } from "@sanity/client";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { allTextsQuery } from "~/sanity/sanity.query";
import { ISanity } from "~/sanity/sanity.types";
import { sanityConfig } from "~/sanity/sanity.config";
import { DecoratorLocale, getLocale } from "~/utils/dekoratoren.utils";
import { samleHtmlForPeriode } from "~/utils/periode.utils";
import { getAppText, getRichText } from "~/hooks/useSanity";

export async function action({ request, params }: ActionFunctionArgs) {
  const data = (await request.json()) as IRapporteringsperiode;
  const locale = (params.locale as DecoratorLocale) ?? DecoratorLocale.NB;

  if (!data) {
    return new Response("Bad Request", { status: 400 });
  }

  const sanityClient = createClient(sanityConfig);
  const sanityTexts = await sanityClient.fetch<ISanity>(allTextsQuery, {
    baseLang: DecoratorLocale.NB,
    lang: getLocale(locale),
  });

  const localGetAppText = (textId: string) => getAppText(sanityTexts, textId);
  const localGetRichText = (textId: string) => getRichText(sanityTexts, textId);

  const html = samleHtmlForPeriode([data], data, localGetAppText, localGetRichText);

  return new Response(html, {
    status: 200,
    headers: {
      ContentType: "text/html",
    },
  });
}
