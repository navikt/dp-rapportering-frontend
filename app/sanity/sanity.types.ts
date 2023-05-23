import type { TypedObject } from "@portabletext/types";

export interface ISanityAppTekst {
  textId: string;
  valueText: string;
}

export interface ISanityInfoside {
  slug: string;
  body: TypedObject | TypedObject[];
}

export interface ISanityTexts {
  apptekster: ISanityAppTekst[];
  infosider: ISanityInfoside[];
}
