import { useTypedRouteLoaderData } from "./useTypedRouteLoaderData";
import type { TypedObject } from "@portabletext/types";
import { useCallback } from "react";
import type { ISanityAppText, ISanityLink, ISanityRichText } from "~/sanity/sanity.types";

const createSanityRichTextObject = (text: string) => [
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

export function useSanity() {
  const { sanityTexts } = useTypedRouteLoaderData("root");

  function getAppText(textId: string): string {
    const text =
      sanityTexts?.appTexts.find((appText: ISanityAppText) => appText.textId === textId)
        ?.valueText || textId;

    return text;
  }

  const cachedGetAppText = useCallback(getAppText, [sanityTexts]);

  function getRichText(textId: string): TypedObject | TypedObject[] {
    const richText = sanityTexts?.richTexts?.find((richText: ISanityRichText) => {
      return richText.textId === textId;
    });

    return (richText?.body as TypedObject | TypedObject[]) ?? createSanityRichTextObject(textId);
  }

  const cachedGetRichText = useCallback(getRichText, [sanityTexts]);

  function getLink(linkId: string): ISanityLink {
    const link = sanityTexts?.links?.find((link) => link.linkId === linkId) || {
      linkId: linkId,
      linkText: linkId,
      linkUrl: "",
      linkDescription: undefined,
    };

    return link as ISanityLink;
  }

  const cachedgetLink = useCallback(getLink, [sanityTexts]);

  return {
    getAppText: cachedGetAppText,
    getRichText: cachedGetRichText,
    getLink: cachedgetLink,
  };
}
