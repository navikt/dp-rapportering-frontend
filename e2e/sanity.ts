import { createClient } from "@sanity/client";
import { allTextsQuery } from "~/sanity/sanity.query";
import { ISanity, ISanityAppText, ISanityLink } from "~/sanity/sanity.types";
import { sanityConfig } from "~/sanity/sanity.config";

export const sanityClient = createClient(sanityConfig);

export async function withSanitySetup() {
  const sanityTexts = await sanityClient.fetch<ISanity>(allTextsQuery, {
    baseLang: "nb",
    lang: "nb",
  });

  function getAppText(textId: string): string {
    return (
      sanityTexts?.appTexts.find((appText: ISanityAppText) => appText.textId === textId)
        ?.valueText || textId
    );
  }

  function getLink(linkId: string): ISanityLink {
    const link = sanityTexts?.links?.find((link) => link.linkId === linkId) || {
      linkId: linkId,
      linkText: linkId,
      linkUrl: "",
      linkDescription: undefined,
    };

    return link as ISanityLink;
  }

  return {
    getAppText,
    getLink,
  };
}
