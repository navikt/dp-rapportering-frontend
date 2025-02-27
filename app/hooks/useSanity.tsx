import type { PortableTextBlock, TypedObject } from "@portabletext/types";
import { useCallback } from "react";

import type {
  ISanity,
  ISanityAppText,
  ISanityLink,
  ISanityMessage,
  ISanityRichText,
} from "~/sanity/sanity.types";

import { useTypedRouteLoaderData } from "./useTypedRouteLoaderData";

export type ReplaceTexts = { [key: string]: string | number };

export function createSanityRichTextObject(text: string): PortableTextBlock[] {
  return [
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
}

export function createSanityMessageObject(textId: string): ISanityMessage {
  return {
    textId,
    title: textId,
    body: createSanityRichTextObject(textId),
    from: new Date().toISOString(),
    to: new Date().toISOString(),
    enabled: false,
    variant: "info",
  };
}

export function createLinkObject(linkId: string): ISanityLink {
  return {
    linkId: linkId,
    linkText: linkId,
    linkUrl: "",
    linkDescription: "undefined",
  };
}

export type GetAppText = (textId: string, replaceTexts?: ReplaceTexts) => string;

export function foundAppText(text: string, textId: string) {
  return text !== textId;
}

export function getAppText(
  sanityTexts: ISanity,
  textId: string,
  replaceTexts?: ReplaceTexts,
): string {
  const text =
    sanityTexts?.appTexts.find((appText: ISanityAppText) => appText.textId === textId)?.valueText ||
    textId;

  if (!foundAppText(text, textId)) {
    console.warn(`Fant ikke appText med ID: ${textId}`);
  }

  if (replaceTexts) {
    return replaceKeys(text, replaceTexts);
  }

  return text;
}

export type GetRichText = (
  textId: string,
  replaceTexts?: ReplaceTexts,
) => TypedObject | TypedObject[];

export function foundRichText(text: PortableTextBlock[] | undefined, textId: string) {
  if (!text) return false;

  return text[0]?.children[0]?.text !== textId;
}

export function replaceKeys(text: string, replaceTexts: ReplaceTexts) {
  if (typeof text !== "string" || !replaceTexts) return text;

  let tempText = text;

  Object.keys(replaceTexts).forEach((key) => {
    tempText = tempText.replaceAll(`{${key}}`, replaceTexts[key].toString());
  });

  return tempText;
}

export function getRichText(
  sanityTexts: ISanity,
  textId: string,
  replaceTexts?: ReplaceTexts,
): PortableTextBlock[] {
  const richText = sanityTexts?.richTexts?.find((richText: ISanityRichText) => {
    return richText.textId === textId;
  });

  if (!foundRichText(richText?.body, textId)) {
    console.warn(`Fant ikke richText med ID: ${textId}`);
  }

  if (!richText?.body) {
    return createSanityRichTextObject(textId);
  }

  if (replaceTexts) {
    return richText.body.map((block) => ({
      ...block,
      children: block.children.map((child) => ({
        ...child,
        text: replaceKeys(child.text, replaceTexts),
      })),
    }));
  }

  return richText.body;
}

export type GetMessage = (textId: string) => ISanityLink;

export function foundMessage(message: ISanityMessage, textId: string) {
  return message.title !== textId;
}

export function getMessage(sanityTexts: ISanity, textId: string): ISanityMessage {
  const message =
    sanityTexts?.messages?.find((m: ISanityMessage) => {
      return m.textId === textId;
    }) || createSanityMessageObject(textId);

  if (!foundMessage(message, textId)) {
    console.warn(`Fant ikke message med ID: ${textId}`);
  }

  return message;
}

export function getMessages(sanityTexts: ISanity): ISanityMessage[] {
  return sanityTexts?.messages ?? [];
}

export type GetLink = (linkId: string) => ISanityMessage;

export function foundLink(link: ISanityLink, linkId: string) {
  return link.linkText !== linkId;
}

export function getLink(sanityTexts: ISanity, linkId: string): ISanityLink {
  const link =
    sanityTexts?.links?.find((link) => link.linkId === linkId) || createLinkObject(linkId);

  if (!foundLink(link, linkId)) {
    console.warn(`Fant ikke link med ID: ${linkId}`);
  }

  return link as ISanityLink;
}

export function useSanity() {
  const { sanityTexts } = useTypedRouteLoaderData("root");

  const hookGetAppText = (textId: string, replaceTexts?: ReplaceTexts) =>
    getAppText(sanityTexts, textId, replaceTexts);
  const hookGetRichText = (textId: string, replaceTexts?: ReplaceTexts) =>
    getRichText(sanityTexts, textId, replaceTexts);
  const hookGetLink = (linkId: string) => getLink(sanityTexts, linkId);
  const hookGetMessage = (textId: string) => getMessage(sanityTexts, textId);
  const hookGetMessages = () => getMessages(sanityTexts);

  const cachedGetAppText = useCallback(hookGetAppText, [sanityTexts]);
  const cachedGetRichText = useCallback(hookGetRichText, [sanityTexts]);
  const cachedGetLink = useCallback(hookGetLink, [sanityTexts]);
  const cachedGetMessage = useCallback(hookGetMessage, [sanityTexts]);
  const cachedGetMessages = useCallback(hookGetMessages, [sanityTexts]);

  return {
    getAppText: cachedGetAppText,
    getRichText: cachedGetRichText,
    getLink: cachedGetLink,
    getMessage: cachedGetMessage,
    getMessages: cachedGetMessages,
  };
}
