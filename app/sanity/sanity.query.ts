import groq from "groq";

const appTextsFields = `{
    textId,
    valueText
  }`;

const infosideFields = `{
    "slug": slug.current,
    body
  }`;

const appTextsGroq = `* [_type=="rapporteringAppText" && __i18n_lang==$baseLang]{
    ...coalesce(* [_id==^._id + "__i18n_" + $lang][0]${appTextsFields}, ${appTextsFields})
    }`;

const infosiderGroq = `* [_type=="rapporteringInfoText"  && __i18n_lang==$baseLang]{
    ...coalesce(* [_id==^._id + "__i18n_" + $lang][0]${infosideFields}, ${infosideFields})
    }`;

export const allTextsQuery = groq`{
    "apptekster": ${appTextsGroq},
    "infosider": ${infosiderGroq}
}`;
