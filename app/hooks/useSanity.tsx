import { useTypedRouteLoaderData } from "./useTypedRouteLoaderData";
import type { PortableTextBlock, TypedObject } from "@portabletext/types";
import { useCallback } from "react";
import type { ISanity, ISanityAppText, ISanityLink, ISanityRichText } from "~/sanity/sanity.types";

export const createSanityRichTextObject = (text: string): PortableTextBlock[] => [
  {
    markDefs: [],
    children: [
      {
        marks: [],
        text: text,
        _key: "456",
        _type: "span",
      },
    ],
    _type: "block",
    style: "normal",
    _key: "123",
  },
];

export type GetAppText = (textId: string) => string;
export type GetRichText = (textId: string) => TypedObject | TypedObject[];
export type GetLink = (linkId: string) => ISanityLink;

export function getAppText(sanityTexts: ISanity, textId: string): string {
  const text =
    sanityTexts?.appTexts.find((appText: ISanityAppText) => appText.textId === textId)?.valueText ||
    textId;

  if (text === textId) {
    console.warn(`Fant ikke appText med ID: ${textId}`);
  }

  return text;
}

export function getRichText(sanityTexts: ISanity, textId: string): TypedObject | TypedObject[] {
  const richText = sanityTexts?.richTexts?.find((richText: ISanityRichText) => {
    return richText.textId === textId;
  });

  if (!richText?.body) {
    console.warn(`Fant ikke richText med ID: ${textId}`);
  }

  return (richText?.body as TypedObject | TypedObject[]) ?? createSanityRichTextObject(textId);
}

export function getLink(sanityTexts: ISanity, linkId: string): ISanityLink {
  const link = sanityTexts?.links?.find((link) => link.linkId === linkId) || {
    linkId: linkId,
    linkText: linkId,
    linkUrl: "",
    linkDescription: undefined,
  };

  if (link.linkText === linkId) {
    console.warn(`Fant ikke link med ID: ${linkId}`);
  }

  return link as ISanityLink;
}

export function useSanity() {
  const { sanityTexts } = useTypedRouteLoaderData("root");

  const hookGetAppText = (textId: string) => getAppText(sanityTexts, textId);
  const hookGetRichText = (textId: string) => getRichText(sanityTexts, textId);
  const hookGetLink = (linkId: string) => getLink(sanityTexts, linkId);

  const cachedGetAppText = useCallback(hookGetAppText, [sanityTexts]);
  const cachedGetRichText = useCallback(hookGetRichText, [sanityTexts]);
  const cachedgetLink = useCallback(hookGetLink, [sanityTexts]);

  return {
    getAppText: cachedGetAppText,
    getRichText: cachedGetRichText,
    getLink: cachedgetLink,
  };
}
