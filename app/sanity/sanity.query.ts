import groq from "groq";

const appTextsFields = `{
  textId,
  valueText
}`;

const richTextsFields = `{
  textId,
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

const appTextsGroq = `* [_type=="rapporteringAppText" && language==$baseLang]{
  ...coalesce(
    *[textId==^.textId && language==$lang][0]${appTextsFields},${appTextsFields}
  ),
}`;

const richTextsGroq = `* [_type=="rapporteringRichText" && language==$baseLang]{
  ...coalesce(
    *[textId==^.textId && language==$lang][0]${richTextsFields},${richTextsFields}
  ),
}`;

const linksGroq = `* [_type=="rapporteringLink" && language==$baseLang]{
  ...coalesce(
    *[linkId==^.linkId && language==$lang][0]${linkFields},${linkFields}
  ),
}`;

export const allTextsQuery = groq`{
    "appTexts": ${appTextsGroq},
    "richTexts": ${richTextsGroq},
    "links": ${linksGroq}
}`;
