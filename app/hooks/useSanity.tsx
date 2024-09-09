import { useTypedRouteLoaderData } from "./useTypedRouteLoaderData";
import type { TypedObject } from "@portabletext/types";
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

export function useSanity() {
  const { sanityTexts } = useTypedRouteLoaderData("root");

  function getAppText(textId: string): string {
    return (
      sanityTexts?.appTexts.find((appText: ISanityAppText) => appText.textId === textId)
        ?.valueText || textId
    );
  }

  function getRichText(slug: string): TypedObject | TypedObject[] {
    const richText = sanityTexts?.richTexts?.find((richText: ISanityRichText) => {
      return richText.slug === slug;
    });

    return (richText?.body as TypedObject | TypedObject[]) ?? createSanityRichTextObject(slug);
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
    getRichText,
    getLink,
  };
}
