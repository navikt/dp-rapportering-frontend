import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "./dato.utils";
import { PortableText } from "@portabletext/react";
import { addDays } from "date-fns";
import { renderToString } from "react-dom/server";
import { parse } from "tinyduration";
import type { AktivitetType } from "~/models/aktivitet.server";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { aktivitetTypeMap } from "~/utils/aktivitettype.utils";
import type { GetAppText, GetRichText } from "~/hooks/useSanity";

export function periodeSomTimer(periode: string): number | undefined {
  if (!periode) return undefined;

  const parsed = parse(periode);
  const timer = parsed.hours || 0;
  const minutt = parsed.minutes || 0;
  return timer + minutt / 60;
}

export function hentUkeTekst(
  { periode: { fraOgMed, tilOgMed } }: IRapporteringsperiode,
  getAppText: GetAppText
): string {
  return `${getAppText("rapportering-uke")} ${formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)}`;
}

export function hentPeriodeTekst(
  rapporteringsperiode: IRapporteringsperiode,
  getAppText: GetAppText
): string {
  const { fraOgMed, tilOgMed } = rapporteringsperiode.periode;
  const ukenummer = formaterPeriodeTilUkenummer(fraOgMed, tilOgMed);
  const dato = formaterPeriodeDato(fraOgMed, tilOgMed);

  return `${getAppText("rapportering-uke")} ${ukenummer} (${dato})`;
}

export function hentTotaltArbeidstimerTekst(
  rapporteringsperiode: IRapporteringsperiode,
  getAppText: GetAppText
): string {
  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);
  const filtertAktiviteter = flatMapAktiviteter.filter((aktivitet) => aktivitet.type === "Arbeid");

  const timer = filtertAktiviteter.reduce((accumulator, current) => {
    if (current.timer) {
      return accumulator + (periodeSomTimer(current.timer) ?? 0);
    }
    return accumulator + 1;
  }, 0);

  const formattertTimer = timer.toString().replace(/\./g, ",");

  // TODO: Alltid vis "timer"?
  return `${formattertTimer} ${timer === 1 ? getAppText("rapportering-time") : getAppText("rapportering-timer")}`;
}

export function hentTotaltFravaerTekstMedType(
  rapporteringsperiode: IRapporteringsperiode,
  aktivitetType: AktivitetType,
  getAppText: GetAppText
): string {
  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);
  const filtertAktiviteter = flatMapAktiviteter.filter(
    (aktivitet) => aktivitet.type === aktivitetType
  );

  return `${filtertAktiviteter.length} ${filtertAktiviteter.length === 1 ? getAppText("rapportering-dag") : getAppText("rapportering-dager")}`;
}

export function samleHtmlForPeriode(
  rapporteringsperioder: IRapporteringsperiode[],
  periode: IRapporteringsperiode,
  getAppText: GetAppText,
  getRichText: GetRichText
): string {
  const antallPerioder = rapporteringsperioder.length;

  const rapporteringstypeFormLabel =
    antallPerioder === 1
      ? getAppText("rapportering-rapporter-navarende-tittel")
      : getAppText("rapportering-ikke-utfylte-rapporter-tittel");
  const harIngenAktiviteter = periode.dager.every((dag) => dag.aktiviteter.length === 0);
  const tidligstInnsendingDato = formaterDato(new Date(periode.kanSendesFra));
  const senestInnsendingDato = formaterDato(addDays(new Date(periode.periode.fraOgMed), 21));
  const harAktivitet = atob(getCookie("rapporteringstype") || "").indexOf("harAktivitet") > -1;

  let html = "<div>";

  if (!periode.begrunnelseEndring) {
    html +=
      "<h1>" +
      getAppText("rapportering-tittel") +
      "</h1>" +
      renderToString(<PortableText value={getRichText("rapportering-innledning")} />) +
      "<br>" +
      (antallPerioder === 0 ? getAppText("rapportering-ingen-rapporter-å-fylle-ut") + "<br>" : "") +
      (antallPerioder > 1
        ? getAppText("rapportering-flere-perioder-tittel").replace(
            "{antall}",
            antallPerioder.toString()
          ) +
          "<br>" +
          getAppText("rapportering-flere-perioder-innledning") +
          "<br><br>"
        : "") +
      "<b>" +
      rapporteringstypeFormLabel +
      "</b><br>" +
      (antallPerioder > 0 ? hentPeriodeTekst(rapporteringsperioder[0], getAppText) : "") +
      "<br>" +
      "<br>" +
      '<div style="display: flex; align-items: center; column-gap: 10px;">' +
      "<div>" +
      (harAktivitet ? "X" : "_") +
      "</div><div>" +
      getAppText("rapportering-noe-å-rapportere") +
      "</div>" +
      "</div>" +
      '<div style="display: flex; align-items: center; column-gap: 10px;">' +
      "<div>" +
      (harAktivitet ? "_" : "X") +
      "</div><div>" +
      renderToString(<PortableText value={getRichText("rapportering-ingen-å-rapportere")} />) +
      "</div>" +
      "</div>" +
      "<h3>" +
      getAppText("rapportering-les-mer-hva-skal-rapporteres-tittel") +
      "</h3>" +
      '<div style="border-left: solid 1px black; padding-left: 5px;">' +
      renderToString(
        <PortableText value={getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold")} />
      ) +
      "</div>";
  } else {
    html +=
      // Fyll ut Endring
      "<h1>" +
      getAppText("rapportering-periode-endre-tittel") +
      "</h1>" +
      renderToString(
        <PortableText value={getRichText("rapportering-periode-endre-beskrivelse")} />
      ) +
      "<br>" +
      "<h3>" +
      (antallPerioder > 0 ? hentPeriodeTekst(rapporteringsperioder[0], getAppText) : "") +
      "</h3>" +
      // Popup
      "<b>" +
      getAppText("rapportering-hva-vil-du-lagre") +
      "</b><br>" +
      aktivitetTypeMap("Arbeid", getAppText) +
      ": " +
      getAppText("rapportering-aktivitet-radio-arbeid-beskrivelse") +
      " " +
      getAppText("rapportering-antall-timer") +
      " " +
      renderToString(<PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />) +
      "<br>" +
      aktivitetTypeMap("Syk", getAppText) +
      ": " +
      getAppText("rapportering-aktivitet-radio-syk-beskrivelse") +
      "<br>" +
      aktivitetTypeMap("Fravaer", getAppText) +
      ": " +
      getAppText("rapportering-aktivitet-radio-fravaer-beskrivelse") +
      "<br>" +
      aktivitetTypeMap("Utdanning", getAppText) +
      ": " +
      getAppText("rapportering-aktivitet-radio-utdanning-beskrivelse") +
      "<br>" +
      "<br>" +
      getAppText("rapportering-periode-innsending-og-frist-dato")
        .replace("{date1}", tidligstInnsendingDato)
        .replace("{date2}", senestInnsendingDato) +
      "<br>" +
      "<br>" +
      "<h2>" +
      getAppText("rapportering-endring-begrunnelse-tittel") +
      "</h2>" +
      getAppText("rapportering-endring-begrunnelse-beskrivelse") +
      "<br>" +
      "<b>" +
      getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-label") +
      "</b><br>" +
      getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-description") +
      "<br>" +
      periode.begrunnelseEndring +
      "<br>";
  }

  if (!periode.begrunnelseEndring) {
    if (harAktivitet) {
      html +=
        // Fyll ut
        "<h1>" +
        getAppText("rapportering-periode-fyll-ut-tittel") +
        "</h1>" +
        getAppText("rapportering-periode-fyll-ut-beskrivelse") +
        "<br>" +
        "<br>" +
        // Popup
        "<b>" +
        getAppText("rapportering-hva-vil-du-lagre") +
        "</b><br>" +
        aktivitetTypeMap("Arbeid", getAppText) +
        ": " +
        getAppText("rapportering-aktivitet-radio-arbeid-beskrivelse") +
        " " +
        getAppText("rapportering-antall-timer") +
        " " +
        renderToString(
          <PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />
        ) +
        "<br>" +
        aktivitetTypeMap("Syk", getAppText) +
        ": " +
        getAppText("rapportering-aktivitet-radio-syk-beskrivelse") +
        "<br>" +
        aktivitetTypeMap("Fravaer", getAppText) +
        ": " +
        getAppText("rapportering-aktivitet-radio-fravaer-beskrivelse") +
        "<br>" +
        aktivitetTypeMap("Utdanning", getAppText) +
        ": " +
        getAppText("rapportering-aktivitet-radio-utdanning-beskrivelse") +
        "<br>" +
        "<br>" +
        getAppText("rapportering-periode-innsending-og-frist-dato")
          .replace("{date1}", tidligstInnsendingDato)
          .replace("{date2}", senestInnsendingDato) +
        "<br>" +
        "<br>" +
        // Tom
        (harIngenAktiviteter
          ? '<div style="border: 1px solid black; padding: 5px;"><b>' +
            getAppText("rapportering-tom-periode-tittel") +
            "</b><br>" +
            getAppText("rapportering-tom-periode-innhold") +
            "</div>" +
            "<br>" +
            getAppText("rapportering-tom-noe-å-rapportere") +
            renderToString(
              <PortableText value={getRichText("rapportering-tom-ingen-å-rapportere")} />
            )
          : "");
    }

    html +=
      // Arbeidssøker
      "<b>" +
      getAppText("rapportering-arbeidssokerregister-tittel") +
      "</b><br>" +
      getAppText("rapportering-arbeidssokerregister-subtittel") +
      "<br>" +
      (periode.registrertArbeidssoker ? "X " : "_ ") +
      getAppText("rapportering-arbeidssokerregister-svar-ja") +
      "<br>" +
      (periode.registrertArbeidssoker ? "_ " : "X ") +
      getAppText("rapportering-arbeidssokerregister-svar-nei") +
      "<br>" +
      "<br>" +
      '<div style="border: 1px solid black; padding: 5px;">' +
      (periode.registrertArbeidssoker
        ? "<b>" + getAppText("rapportering-arbeidssokerregister-alert-tittel-registrert") + "</b>"
        : "<b>" +
          getAppText("rapportering-arbeidssokerregister-alert-tittel-avregistrert") +
          "</b><br>" +
          renderToString(
            <PortableText
              value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert")}
            />
          )) +
      "</div>";
  }

  html +=
    // Oppsummering
    "<h1>" +
    getAppText("rapportering-send-inn-tittel") +
    "</h1>" +
    renderToString(<PortableText value={getRichText("rapportering-send-inn-innhold")} />) +
    "<br>" +
    "<b>" +
    getAppText("rapportering-send-inn-periode-tittel") +
    "</b><br>" +
    (antallPerioder > 0 ? hentPeriodeTekst(rapporteringsperioder[0], getAppText) : "") +
    "<br>" +
    "<br>" +
    // Sammenlagt
    "<b>" +
    getAppText("rapportering-oppsummering-tittel") +
    "</b><br>" +
    getAppText("rapportering-arbeid") +
    " " +
    hentTotaltArbeidstimerTekst(periode, getAppText) +
    "<br>" +
    getAppText("rapportering-syk") +
    " " +
    hentTotaltFravaerTekstMedType(periode, "Syk", getAppText) +
    "<br>" +
    getAppText("rapportering-fraevaer") +
    " " +
    hentTotaltFravaerTekstMedType(periode, "Fravaer", getAppText) +
    "<br>" +
    getAppText("rapportering-utdanning") +
    " " +
    hentTotaltFravaerTekstMedType(periode, "Utdanning", getAppText) +
    "<br>" +
    "<br>" +
    "X " +
    getAppText("rapportering-send-inn-bekreft-opplysning") +
    // Kvittering
    "<h3>" +
    getAppText("rapportering-periode-bekreftelse-tittel") +
    "</h3>" +
    "</div>";

  return html;
}

function getCookie(name: string) {
  const re = new RegExp(name + "=([^;]+)");
  const value = re.exec(document.cookie);
  return value !== null ? decodeURIComponent(value[1]) : null;
}

export function harAktiviteter(periode: IRapporteringsperiode): boolean {
  return periode.dager.some((dag) => dag.aktiviteter.length > 0);
}
