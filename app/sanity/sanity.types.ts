import type { TypedObject } from "@portabletext/types";

export interface ISanityAppText {
  textId: string;
  valueText: string;
}

export interface ISanityRichText {
  textId: string;
  body: TypedObject | TypedObject[];
}

export interface ISanityLink {
  linkId: string;
  linkText: string;
  linkUrl: string;
  linkDescription: string;
}

export interface ISanityMessage {
  textId: string;
  title: string;
  body: TypedObject | TypedObject[];
  from: string;
  to: string;
  variant: "success" | "info" | "warning" | "error";
  enabled: boolean;
}

export interface ISanity {
  appTexts: ISanityAppText[];
  richTexts: ISanityRichText[];
  links: ISanityLink[];
  messages: ISanityMessage[];
}
