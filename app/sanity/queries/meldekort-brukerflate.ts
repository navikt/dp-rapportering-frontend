import type { PortableTextBlock } from "@portabletext/types";

const localized = (field: string) =>
  `coalesce(${field}[_key == $language][0].value, ${field}[_key == $fallbackLanguage][0].value)`;

const fields = (fieldNames: string[], pathPrefix?: string) =>
  fieldNames
    .map((fieldName) => {
      const path = pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName;
      return `"${fieldName}": ${localized(path)}`;
    })
    .join(",\n");

const document = (schemaType: string, projection: string) =>
  `*[_id == "${schemaType}"][0]{\n${projection}\n}`;

const objectFields = (fieldName: string, fieldNames: string[]) =>
  `"${fieldName}": {\n${fieldNames
    .map((nestedField) => `"${nestedField}": ${localized(`${fieldName}.${nestedField}`)}`)
    .join(",\n")}\n}`;

export const MELDEKORT_BRUKERFLATE_DOCUMENT_IDS = {
  grunntekster: "meldekortBrukerflateGrunntekster",
  knapper: "meldekortBrukerflateKnapper",
  arbeidssokerstatusBeskjeder: "meldekortBrukerflateArbeidssokerstatusBeskjeder",
  aktiviteter: "meldekortBrukerflateAktiviteter",
  veileder: "meldekortBrukerflateVeileder",
  meldekortdetaljer: "meldekortBrukerflateMeldekortdetaljer",
  velkomstside: "meldekortBrukerflateVelkomstside",
  utfylling: "meldekortBrukerflateUtfylling",
  kvittering: "meldekortBrukerflateKvittering",
  oversikt: "meldekortBrukerflateOversikt",
} as const;

export type MeldekortBrukerflateLanguage = "nb" | "en";

export type MeldekortBrukerflateQueryParams = {
  language: MeldekortBrukerflateLanguage;
  fallbackLanguage?: MeldekortBrukerflateLanguage;
};

export const MELDEKORT_BRUKERFLATE_QUERY = `{
  "grunntekster": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.grunntekster,
    [fields(["sidetittel", "uke", "timer", "dager"]), objectFields("dag", ["lang", "kort"])].join(
      ",\n",
    ),
  )},
  "knapper": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.knapper,
    fields([
      "neste",
      "tilbake",
      "gaaTilNesteMeldekort",
      "seOgEndreInnsendteMeldekort",
      "gaaTilMinSide",
      "avbryt",
      "sendInn",
      "sendEndring",
    ]),
  )},
  "arbeidssokerstatusBeskjeder": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.arbeidssokerstatusBeskjeder,
    [
      `"duVilVaereRegistrert": ${localized("duVilVaereRegistrert")}`,
      `"duVilBliAvregistrert": {\n${fields(["lang", "kort"], "duVilBliAvregistrert")}\n}`,
      `"duSkalIkkeSvarePaSporsmaal": ${localized("duSkalIkkeSvarePaSporsmaal")}`,
      `"fraArena": ${localized("fraArena")}`,
      `"utenArbeidssokerSporsmaal": ${localized("utenArbeidssokerSporsmaal")}`,
      `"etterregistrert": ${localized("etterregistrert")}`,
    ].join(",\n"),
  )},
  "aktiviteter": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.aktiviteter,
    ["jobb", "syk", "ferie", "utdanning"]
      .map((activity) => objectFields(activity, ["lang", "kort"]))
      .join(",\n"),
  )},
  "veileder": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.veileder,
    [
      fields(["tittel", "modalKnappTekst"]),
      ...[
        "naarSkalJobbFores",
        "hvaMedProsentstilling",
        "reglerForYrket",
        "naarSkalDuForeSyk",
        "naarSkalDuForeFravaer",
        "naarSkalDuForeTiltak",
      ].map((section) => `"${section}": {\n${fields(["tittel", "tekst"], section)}\n}`),
    ].join(",\n"),
  )},
  "meldekortdetaljer": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.meldekortdetaljer,
    fields(["tittel", "sendt", "endret", "belopUtbetalt", "oppsummering"]),
  )},
  "velkomstside": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.velkomstside,
    [
      `"velkomstTekst": ${localized("velkomstTekst")}`,
      `"harDuFaattDegJobb": {\n${fields(["tittel", "tekst"], "harDuFaattDegJobb")}\n}`,
      `"innsendingsmulighet": {\n${["klarTilInnsending", "ingenMeldekort", "forTidlig"]
        .map(
          (message) =>
            `"${message}": {\n${fields(["tittel", "tekst"], `innsendingsmulighet.${message}`)}\n}`,
        )
        .join(",\n")}\n}`,
    ].join(",\n"),
  )},
  "utfylling": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.utfylling,
    [
      `"skalMeldeNoe": {\n${[
        fields(["tittel", "tekst"], "skalMeldeNoe"),
        `"sporsmaal": {\n${fields(["tittel", "ja", "nei"], "skalMeldeNoe.sporsmaal")}\n}`,
      ].join(",\n")}\n}`,
      `"registrerAktiviteter": {\n${[
        fields(["tittel", "beskrivelse"], "registrerAktiviteter"),
        `"veiledning": {\n${["jobb", "syk", "ferie", "utdanning"]
          .map(
            (section) =>
              `"${section}": ${localized(`registrerAktiviteter.veiledning.${section}.tekst`)}`,
          )
          .join(",\n")}\n}`,
        `"aktivitetErstattet": {\n${fields(["tittel", "tekst"], "registrerAktiviteter.aktivitetErstattet")}\n}`,
      ].join(",\n")}\n}`,
      `"arbeidssokerstatusSporsmaal": {\n${[
        fields(["tittel", "beskrivelse"], "arbeidssokerstatusSporsmaal"),
        `"alternativer": {\n${fields(["ja", "nei"], "arbeidssokerstatusSporsmaal.alternativer")}\n}`,
      ].join(",\n")}\n}`,
      `"manglendeAktivitet": {\n${fields(["tittel", "beskrivelse"], "manglendeAktivitet")}\n}`,
      `"begrunnelseForEndring": {\n${fields(["tittel", "beskrivelse", "alternativer"], "begrunnelseForEndring")}\n}`,
      `"seOver": {\n${fields(["ikkeSendtInnBeskjed", "jegHarSettOverBeskjed"], "seOver")}\n}`,
    ].join(",\n"),
  )},
  "kvittering": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.kvittering,
    [
      `"suksess": {\n${fields(["tittel", "tekst"], "suksess")}\n}`,
      `"handlinger": {\n${fields(["seOverHvaDuSendteInn", "skrivUt"], "handlinger")}\n}`,
      `"utbetalingenErFeil": {\n${fields(["tittel", "tekst"], "utbetalingenErFeil")}\n}`,
    ].join(",\n"),
  )},
  "oversikt": ${document(
    MELDEKORT_BRUKERFLATE_DOCUMENT_IDS.oversikt,
    [
      fields(["tittel", "tekst"]),
      `"meldekortstatus": {\n${fields(
        ["innsendt", "ferdigBehandlet", "feilVedBehandling"],
        "meldekortstatus",
      )}\n}`,
    ].join(",\n"),
  )}
}`;

export type MeldekortBrukerflatePortableText = PortableTextBlock[];

type MeldekortBrukerflateDocument<T> = T | null;
type MeldekortBrukerflateText = string | null;
type MeldekortBrukerflateRichText = MeldekortBrukerflatePortableText | null;

export type MeldekortBrukerflateApiResponse = {
  grunntekster: MeldekortBrukerflateDocument<{
    sidetittel: MeldekortBrukerflateText;
    uke: MeldekortBrukerflateText;
    timer: MeldekortBrukerflateText;
    dager: MeldekortBrukerflateText;
    dag: {
      lang: MeldekortBrukerflateText;
      kort: MeldekortBrukerflateText;
    };
  }>;
  knapper: MeldekortBrukerflateDocument<{
    neste: MeldekortBrukerflateText;
    tilbake: MeldekortBrukerflateText;
    gaaTilNesteMeldekort: MeldekortBrukerflateText;
    seOgEndreInnsendteMeldekort: MeldekortBrukerflateText;
    gaaTilMinSide: MeldekortBrukerflateText;
    avbryt: MeldekortBrukerflateText;
    sendInn: MeldekortBrukerflateText;
    sendEndring: MeldekortBrukerflateText;
  }>;
  arbeidssokerstatusBeskjeder: MeldekortBrukerflateDocument<{
    duVilVaereRegistrert: MeldekortBrukerflateRichText;
    duVilBliAvregistrert: {
      kort: MeldekortBrukerflateRichText;
      lang: MeldekortBrukerflateRichText;
    };
    duSkalIkkeSvarePaSporsmaal: MeldekortBrukerflateRichText;
    fraArena: MeldekortBrukerflateRichText;
    utenArbeidssokerSporsmaal: MeldekortBrukerflateRichText;
    etterregistrert: MeldekortBrukerflateRichText;
  }>;
  aktiviteter: MeldekortBrukerflateDocument<{
    jobb: { lang: MeldekortBrukerflateText; kort: MeldekortBrukerflateText };
    syk: { lang: MeldekortBrukerflateText; kort: MeldekortBrukerflateText };
    ferie: { lang: MeldekortBrukerflateText; kort: MeldekortBrukerflateText };
    utdanning: { lang: MeldekortBrukerflateText; kort: MeldekortBrukerflateText };
  }>;
  veileder: MeldekortBrukerflateDocument<{
    tittel: MeldekortBrukerflateText;
    modalKnappTekst: MeldekortBrukerflateText;
    naarSkalJobbFores: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
    hvaMedProsentstilling: {
      tittel: MeldekortBrukerflateText;
      tekst: MeldekortBrukerflateRichText;
    };
    reglerForYrket: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
    naarSkalDuForeSyk: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
    naarSkalDuForeFravaer: {
      tittel: MeldekortBrukerflateText;
      tekst: MeldekortBrukerflateRichText;
    };
    naarSkalDuForeTiltak: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
  }>;
  meldekortdetaljer: MeldekortBrukerflateDocument<{
    tittel: MeldekortBrukerflateText;
    sendt: MeldekortBrukerflateText;
    endret: MeldekortBrukerflateText;
    belopUtbetalt: MeldekortBrukerflateText;
    oppsummering: MeldekortBrukerflateText;
  }>;
  velkomstside: MeldekortBrukerflateDocument<{
    velkomstTekst: MeldekortBrukerflateRichText;
    harDuFaattDegJobb: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
    innsendingsmulighet: {
      klarTilInnsending: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
      ingenMeldekort: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
      forTidlig: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
    };
  }>;
  utfylling: MeldekortBrukerflateDocument<{
    skalMeldeNoe: {
      tittel: MeldekortBrukerflateText;
      tekst: MeldekortBrukerflateText;
      sporsmaal: {
        tittel: MeldekortBrukerflateText;
        ja: MeldekortBrukerflateText;
        nei: MeldekortBrukerflateText;
      };
    };
    registrerAktiviteter: {
      tittel: MeldekortBrukerflateText;
      beskrivelse: MeldekortBrukerflateText;
      veiledning: {
        jobb: MeldekortBrukerflateRichText;
        syk: MeldekortBrukerflateRichText;
        ferie: MeldekortBrukerflateRichText;
        utdanning: MeldekortBrukerflateRichText;
      };
      aktivitetErstattet: {
        tittel: MeldekortBrukerflateText;
        tekst: MeldekortBrukerflateText;
      };
    };
    arbeidssokerstatusSporsmaal: {
      tittel: MeldekortBrukerflateText;
      beskrivelse: MeldekortBrukerflateText;
      alternativer: {
        ja: MeldekortBrukerflateText;
        nei: MeldekortBrukerflateText;
      };
    };
    manglendeAktivitet: {
      tittel: MeldekortBrukerflateText;
      beskrivelse: MeldekortBrukerflateText;
    };
    begrunnelseForEndring: {
      tittel: MeldekortBrukerflateText;
      beskrivelse: MeldekortBrukerflateText;
      alternativer: MeldekortBrukerflateText;
    };
    seOver: {
      ikkeSendtInnBeskjed: MeldekortBrukerflateText;
      jegHarSettOverBeskjed: MeldekortBrukerflateText;
    };
  }>;
  kvittering: MeldekortBrukerflateDocument<{
    suksess: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
    handlinger: {
      seOverHvaDuSendteInn: MeldekortBrukerflateText;
      skrivUt: MeldekortBrukerflateText;
    };
    utbetalingenErFeil: { tittel: MeldekortBrukerflateText; tekst: MeldekortBrukerflateRichText };
  }>;
  oversikt: MeldekortBrukerflateDocument<{
    tittel: MeldekortBrukerflateText;
    tekst: MeldekortBrukerflateRichText;
    meldekortstatus: {
      innsendt: MeldekortBrukerflateText;
      ferdigBehandlet: MeldekortBrukerflateText;
      feilVedBehandling: MeldekortBrukerflateText;
    };
  }>;
};
