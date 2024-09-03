import groq from "groq";

const appTextsFields = `{
  textId,
  valueText
}`;

const infoTextsFields = `{
  "slug": slug.current,
  body[]{
    ...,
    _type == "block" => {
      ...,
      children[]{
        ...,
        _type == "dynamicFieldReference" => {
          ...,
          "dynamiskFelt": @-> {
            ...
          }
        },
      }
    },
  }
}`;

const linkFields = `{
  linkId,
  linkText,
  linkUrl,
  linkDescription
}`;

const appTextsGroq = `* [_type=="rapporteringAppText" && __i18n_lang==$baseLang]{
    ...coalesce(* [_id==^._id + "__i18n_" + $lang][0]${appTextsFields}, ${appTextsFields})
    }`;

const infoTextsGroq = `* [_type=="rapporteringRichText"  && __i18n_lang==$baseLang]{
      ...coalesce(* [_id==^._id + "__i18n_" + $lang][0]${infoTextsFields}, ${infoTextsFields})
      }`;

const linksGroq = `* [_type=="rapporteringLink"  && __i18n_lang==$baseLang]{
      ...coalesce(* [_id==^._id + "__i18n_" + $lang][0]${linkFields}, ${linkFields})
      }`;

export const allTextsQuery = groq`{
    "appTexts": ${appTextsGroq},
    "richTexts": ${infoTextsGroq},
    "links": ${linksGroq}
}`;
