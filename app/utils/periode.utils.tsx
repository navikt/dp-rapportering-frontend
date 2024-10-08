import {
  formaterDato,
  formaterPeriodeDato,
  formaterPeriodeTilUkenummer,
  getWeekDays,
} from "./dato.utils";
import { DecoratorLocale } from "./dekoratoren.utils";
import { Rapporteringstype } from "./types";
import { PortableText } from "@portabletext/react";
import { addDays, format } from "date-fns";
import { renderToString } from "react-dom/server";
import { parse } from "tinyduration";
import type { AktivitetType, IAktivitet } from "~/models/aktivitet.server";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";
import { getSanityPortableTextComponents } from "~/sanity/sanityPortableTextComponents";
import { aktivitetType, aktivitetTypeMap } from "~/utils/aktivitettype.utils";
import { type GetAppText, type GetRichText } from "~/hooks/useSanity";
import { hentAktivitetBeskrivelse } from "~/components/aktivitet-checkbox/AktivitetCheckboxes";

export function periodeSomTimer(periode?: string): number | undefined {
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

interface IProps {
  locale: DecoratorLocale;
  getAppText: GetAppText;
  getRichText: GetRichText;
  periode: IRapporteringsperiode;
  rapporteringsperioder: IRapporteringsperiode[];
}

function getArbeidssokerAlert(
  periode: IRapporteringsperiode,
  getAppText: GetAppText,
  getRichText: GetRichText
): string {
  if (periode.registrertArbeidssoker) {
    return `<p>${getAppText("rapportering-arbeidssokerregister-alert-tittel-registrert")}</p>`;
  }

  return [
    getHeader({
      text: getAppText("rapportering-arbeidssokerregister-alert-tittel-avregistrert"),
      level: "3",
    }),

    renderToString(
      <PortableText
        value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert")}
      />
    ),
  ].join("");
}

function getHeader({ text, level }: { text: string; level: "1" | "2" | "3" | "4" }): string {
  return `<h${level}>${text}</h${level}>`;
}

function getAktivitetCheckbox(
  aktivitet: AktivitetType,
  getAppText: GetAppText,
  getRichText: GetRichText
): string {
  let arbeid = "";

  if (aktivitet === "Arbeid") {
    arbeid = `<h3>${getAppText("rapportering-antall-timer")}</h3><p>${renderToString(<PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />)}</p>`;
  }

  return `<h2>${aktivitetTypeMap(aktivitet, getAppText)}</h2><p>${hentAktivitetBeskrivelse(aktivitet, getAppText)}</p>${arbeid}`;
}

function getLesMer(props: IProps): string {
  const { getAppText, getRichText } = props;
  return [
    "// Les mer",
    getHeader({ text: getAppText("rapportering-les-mer-hva-skal-rapporteres-tittel"), level: "2" }),
    renderToString(
      <PortableText value={getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold")} />
    ),
  ].join("");
}

function getAktivitetModal(props: IProps): string {
  const { getAppText, getRichText } = props;
  const modalHeader = `${getHeader({ text: getAppText("rapportering-hva-vil-du-lagre"), level: "1" })}`;
  const modalBody = aktivitetType
    .map((aktivitet) => getAktivitetCheckbox(aktivitet, getAppText, getRichText))
    .join("");

  return ["// popup", "<dialog>", modalHeader, "<div>", modalBody, "</div>", "</dialog>"].join("");
}

function getAktivitet(aktivitet: IAktivitet, getAppText: GetAppText): string {
  if (aktivitet.type === "Arbeid") {
    return `${aktivitetTypeMap(aktivitet.type, getAppText)} (${periodeSomTimer(aktivitet.timer) ?? 0})`;
  }

  return aktivitetTypeMap(aktivitet.type, getAppText);
}

function getDag(
  dag: IRapporteringsperiodeDag,
  ukedag: { kort: string; lang: string },
  getAppText: GetAppText
): string {
  return `<li>${ukedag.lang} ${format(new Date(dag.dato), "d")}.: ${dag.aktiviteter.length ? dag.aktiviteter.map((aktivitet) => getAktivitet(aktivitet, getAppText)).join(", ") : "-"}</li>`;
}

function getKalender(props: IProps, showModal: boolean = true): string {
  const { periode, getAppText, locale } = props;
  const ukedager = getWeekDays(locale);
  const forsteUke = [...periode.dager].splice(0, 7);
  const andreUke = [...periode.dager].splice(7, 7);

  const items = `<ul>${forsteUke.map((dag, index) => getDag(dag, ukedager[index], getAppText)).join("")}</ul><ul>${andreUke.map((dag, index) => getDag(dag, ukedager[index], getAppText)).join("")}</ul>`;

  const seksjoner = [
    `<h3>${hentUkeTekst(periode, getAppText)}</h3>`,
    `<p>${formaterPeriodeDato(periode.periode.fraOgMed, periode.periode.tilOgMed)}</p>`,
  ];

  if (showModal) {
    seksjoner.push(getAktivitetModal(props));
  }

  seksjoner.push([items].join(""));

  return seksjoner.join("");
}

function getOppsummering({
  getAppText,
  periode,
}: {
  getAppText: GetAppText;
  periode: IRapporteringsperiode;
}): string {
  const oppsummering = aktivitetType
    .map((aktivitet) => {
      let tekst = `${aktivitetTypeMap(aktivitet, getAppText)}: `;

      if (aktivitet === "Arbeid") {
        tekst += hentTotaltArbeidstimerTekst(periode, getAppText);
      } else {
        tekst += hentTotaltFravaerTekstMedType(periode, aktivitet, getAppText);
      }

      return `<p>${tekst}</p>`;
    })
    .join("");

  return [
    "<div>",
    `<h3>${getAppText("rapportering-oppsummering-tittel")}</h3>`,
    oppsummering,
    "</div>",
  ].join("");
}

function getInput({
  type,
  name,
  value,
  checked,
  label,
}: {
  type: string;
  name: string;
  value: string | boolean;
  checked: boolean;
  label: string;
}): string {
  return `<input type="${type}" name="${name}" value="${value}" id="${value}" ${checked ? "checked" : ""} /><label for="${value}">${label}</label>`;
}

export function htmlForEndringBegrunnelse(props: IProps): string {
  const { getAppText, periode } = props;
  const options = [
    "rapportering-endring-begrunnelse-nedtrekksmeny-select",
    "rapportering-endring-begrunnelse-nedtrekksmeny-option-1",
    "rapportering-endring-begrunnelse-nedtrekksmeny-option-2",
    "rapportering-endring-begrunnelse-nedtrekksmeny-option-3",
    "rapportering-endring-begrunnelse-nedtrekksmeny-option-4",
    "rapportering-endring-begrunnelse-nedtrekksmeny-option-5",
    "rapportering-endring-begrunnelse-nedtrekksmeny-option-6",
    "rapportering-endring-begrunnelse-nedtrekksmeny-option-other",
  ];

  const seksjoner = [
    getHeader({ text: getAppText("rapportering-tittel"), level: "1" }),
    getHeader({ text: getAppText("rapportering-periode-endre-tittel"), level: "2" }),
    getHeader({
      text: getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-label"),
      level: "3",
    }),
    `<p>${getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-description")}</p>`,
    `<ul>${options.map((option) => (periode.begrunnelseEndring === option ? `<li><strong>${getAppText(option)}</strong></li>` : `<li>${getAppText(option)}</li>`)).join("")}</ul>`,
  ];

  return seksjoner.join("");
}

export function htmlForLandingsside(props: IProps): string {
  const { getAppText, getRichText, rapporteringsperioder, periode } = props;
  const seksjoner: string[] = [getHeader({ text: getAppText("rapportering-tittel"), level: "1" })];

  if (rapporteringsperioder.length === 0) {
    seksjoner.push(`<p>${getAppText("rapportering-ingen-meldekort")}</p>`);
  }

  if (!periode.kanSendes) {
    seksjoner.push(
      renderToString(
        <PortableText
          components={getSanityPortableTextComponents({
            dato: formaterDato(new Date(periode.kanSendesFra)),
          })}
          value={getRichText("rapportering-for-tidlig-a-sende-meldekort")}
        />
      )
    );
  }

  seksjoner.push(renderToString(<PortableText value={getRichText("rapportering-innledning")} />));

  if (periode.kanSendes) {
    seksjoner.push(getHeader({ text: getAppText("rapportering-samtykke-tittel"), level: "2" }));
    seksjoner.push(
      renderToString(<PortableText value={getRichText("rapportering-samtykke-beskrivelse")} />)
    );
    seksjoner.push(
      `<input type="checkbox" checked/><label>${getAppText("rapportering-samtykke-checkbox")}</label>`
    );
  }

  return seksjoner.join("");
}

export function htmlForRapporteringstype(props: IProps): string {
  const { rapporteringsperioder, getAppText, getRichText, periode } = props;
  const harFlerePerioder = rapporteringsperioder.length > 1;

  const tidligstInnsendingDato = formaterDato(new Date(periode.kanSendesFra));
  const senestInnsendingDato = formaterDato(addDays(new Date(periode.periode.fraOgMed), 21));

  const seksjoner: string[] = [getHeader({ text: getAppText("rapportering-tittel"), level: "1" })];

  if (harFlerePerioder) {
    seksjoner.push(
      getHeader({
        text: getAppText("rapportering-flere-perioder-tittel").replace(
          "{antall}",
          rapporteringsperioder.length.toString()
        ),
        level: "2",
      })
    );
    seksjoner.push(`<p>${getAppText("rapportering-flere-perioder-innledning")}</p>`);
  }

  seksjoner.push(
    getHeader({
      text:
        rapporteringsperioder.length > 1
          ? getAppText("rapportering-foerste-periode")
          : getAppText("rapportering-naavaerende-periode"),
      level: "2",
    })
  );
  seksjoner.push(`<p>${hentPeriodeTekst(props.periode, getAppText)}</p>`);
  seksjoner.push(
    renderToString(
      <PortableText
        components={getSanityPortableTextComponents({
          "fra-dato": tidligstInnsendingDato,
          "til-dato": senestInnsendingDato,
        })}
        value={getRichText("rapportering-fyll-ut-frister")}
      />
    )
  );
  seksjoner.push(getLesMer(props));

  const legend =
    rapporteringsperioder.length === 1
      ? getAppText("rapportering-rapporter-navarende-tittel")
      : getAppText("rapportering-ikke-utfylte-rapporter-tittel");
  const description = hentPeriodeTekst(periode, getAppText);

  const options = [
    { value: Rapporteringstype.harAktivitet, label: getAppText("rapportering-noe-å-rapportere") },
    {
      value: Rapporteringstype.harIngenAktivitet,
      label: renderToString(
        <PortableText value={getRichText("rapportering-ingen-å-rapportere")} />
      ),
    },
  ]
    .map((option) =>
      getInput({
        type: "radio",
        name: "rapporteringstype",
        value: option.value,
        checked: periode.rapporteringstype === option.value,
        label: "",
      })
    )
    .join("");

  const radioGroup = `<form><fieldset><legend>${legend}</legend><p>${description}</p>${options}</fieldset></form>`;

  seksjoner.push(radioGroup);

  return seksjoner.join("");
}

export function htmlForFyllUt(props: IProps): string {
  const { getAppText, getRichText, periode } = props;

  const tittel = props.periode.originalId
    ? "rapportering-periode-endre-tittel"
    : "rapportering-periode-fyll-ut-tittel";
  const beskrivelse = props.periode.originalId
    ? "rapportering-periode-endre-beskrivelse"
    : "rapportering-periode-fyll-ut-beskrivelse";

  const seksjoner: string[] = [
    getHeader({ text: getAppText("rapportering-tittel"), level: "1" }),
    getHeader({ text: getAppText(tittel), level: "2" }),
    renderToString(<PortableText value={getRichText(beskrivelse)} />),
    getKalender(props),
    getOppsummering({ getAppText, periode }),
  ];

  return seksjoner.join("");
}

export function htmlForTom(props: IProps): string {
  const { getAppText, getRichText } = props;

  const seksjoner: string[] = [
    getHeader({ text: props.getAppText("rapportering-tittel"), level: "1" }),
    getHeader({ text: props.getAppText("rapportering-tom-periode-tittel"), level: "2" }),
    `<p>${getAppText("rapportering-tom-periode-innhold")}</p>`,
    `<p>${getAppText("rapportering-tom-noe-å-rapportere")}</p>`,
    renderToString(<PortableText value={getRichText("rapportering-tom-ingen-å-rapportere")} />),
  ];

  return seksjoner.join("");
}

export function htmlForArbeidssoker(props: IProps): string {
  const { getAppText, getRichText, periode } = props;
  const seksjoner: string[] = [getHeader({ text: getAppText("rapportering-tittel"), level: "1" })];

  const legend = getAppText("rapportering-arbeidssokerregister-tittel");
  const description = getAppText("rapportering-arbeidssokerregister-subtittel");
  const options = [
    { value: true, label: "rapportering-arbeidssokerregister-svar-ja" },
    { value: false, label: "rapportering-arbeidssokerregister-svar-nei" },
  ]
    .map((option) => {
      return getInput({
        type: "checkbox",
        name: "erRegistrertSomArbeidssoker",
        value: option.value,
        checked: option.value === periode.registrertArbeidssoker,
        label: getAppText(option.label),
      });
    })
    .join("");

  const radioGroup = `<fieldset><legend>${legend}</legend><p>${description}</p>${options}</fieldset>${getArbeidssokerAlert(periode, getAppText, getRichText)}`;
  seksjoner.push(radioGroup);

  return seksjoner.join("");
}

export function htmlForOppsummering(props: IProps): string {
  const { getAppText, getRichText, periode } = props;

  const ukenummer = formaterPeriodeTilUkenummer(periode.periode.fraOgMed, periode.periode.tilOgMed);
  const dato = formaterPeriodeDato(periode.periode.fraOgMed, periode.periode.tilOgMed);

  const invaerendePeriodeTekst = `${getAppText("rapportering-uke")} ${ukenummer} (${dato})`;

  const tittel = props.periode.originalId
    ? "rapportering-endring-send-inn-tittel"
    : "rapportering-send-inn-tittel";
  const beskrivelse = props.periode.originalId
    ? "rapportering-endring-send-inn-innhold"
    : "rapportering-send-inn-innhold";

  const seksjoner: string[] = [
    getHeader({ text: getAppText("rapportering-tittel"), level: "1" }),
    getHeader({ text: getAppText(tittel), level: "2" }),
    renderToString(<PortableText value={getRichText(beskrivelse)} />),
    getHeader({ text: getAppText("rapportering-send-inn-periode-tittel"), level: "3" }),
    `<p>${invaerendePeriodeTekst}</p>`,
    getKalender(props, false),
    getOppsummering({ getAppText, periode }),
  ];

  if (periode.originalId) {
    seksjoner.push(
      getHeader({ text: getAppText("rapportering-endring-begrunnelse-tittel"), level: "3" })
    );
    seksjoner.push(`<p>${periode.begrunnelseEndring}</p>`);
  } else {
    seksjoner.push(getArbeidssokerAlert(periode, getAppText, getRichText));
  }

  if (periode.originalId) {
    seksjoner.push(
      `<input type="checkbox" checked/><label>${getAppText("rapportering-endring-send-inn-bekreft-opplysning")}</label>`
    );
  } else {
    seksjoner.push(
      `<input type="checkbox" checked/><label>${getAppText("rapportering-send-inn-bekreft-opplysning")}</label>`
    );
  }

  return seksjoner.join("");
}

export function samleHtmlForPeriode(
  rapporteringsperioder: IRapporteringsperiode[],
  periode: IRapporteringsperiode,
  getAppText: GetAppText,
  getRichText: GetRichText,
  locale: DecoratorLocale
): string {
  const pages: string[] = [];

  if (periode.originalId) {
    const fns = [htmlForFyllUt, htmlForEndringBegrunnelse, htmlForOppsummering];

    fns.forEach((fn) =>
      pages.push(fn({ periode, getAppText, getRichText, locale, rapporteringsperioder }))
    );
  } else {
    const fns = [
      htmlForLandingsside,
      htmlForRapporteringstype,
      htmlForArbeidssoker,
      htmlForOppsummering,
    ];

    if (periode.rapporteringstype === Rapporteringstype.harAktivitet) {
      fns.splice(2, 0, htmlForFyllUt);
    }

    const harIngenAktiviteter = periode.dager.every((dag) => dag.aktiviteter.length === 0);

    if (periode.rapporteringstype === Rapporteringstype.harAktivitet && harIngenAktiviteter) {
      fns.splice(3, 0, htmlForTom);
    }

    fns.forEach((fn) =>
      pages.push(fn({ periode, getAppText, getRichText, locale, rapporteringsperioder }))
    );
  }

  return `<div>${pages.join("</div><div>")}</div>`;

  // const antallPerioder = rapporteringsperioder.length;

  // const rapporteringstypeFormLabel =
  //   antallPerioder === 1
  //     ? getAppText("rapportering-rapporter-navarende-tittel")
  //     : getAppText("rapportering-ikke-utfylte-rapporter-tittel");
  // const harIngenAktiviteter = periode.dager.every((dag) => dag.aktiviteter.length === 0);
  // const tidligstInnsendingDato = formaterDato(new Date(periode.kanSendesFra));
  // const senestInnsendingDato = formaterDato(addDays(new Date(periode.periode.fraOgMed), 21));
  // const harAktivitet = atob(getCookie("rapporteringstype") || "").indexOf("harAktivitet") > -1;

  // let html = "<div>";

  // if (!periode.begrunnelseEndring) {
  //   html +=
  //     "<h1>" +
  //     getAppText("rapportering-tittel") +
  //     "</h1>" +
  //     renderToString(<PortableText value={getRichText("rapportering-innledning")} />) +
  //     "<br>" +
  //     (antallPerioder === 0 ? getAppText("rapportering-ingen-rapporter-å-fylle-ut") + "<br>" : "") +
  //     (antallPerioder > 1
  //       ? getAppText("rapportering-flere-perioder-tittel").replace(
  //           "{antall}",
  //           antallPerioder.toString()
  //         ) +
  //         "<br>" +
  //         getAppText("rapportering-flere-perioder-innledning") +
  //         "<br><br>"
  //       : "") +
  //     "<b>" +
  //     rapporteringstypeFormLabel +
  //     "</b><br>" +
  //     (antallPerioder > 0 ? hentPeriodeTekst(rapporteringsperioder[0], getAppText) : "") +
  //     "<br>" +
  //     "<br>" +
  //     '<div style="display: flex; align-items: center; column-gap: 10px;">' +
  //     "<div>" +
  //     (harAktivitet ? "X" : "_") +
  //     "</div><div>" +
  //     getAppText("rapportering-noe-å-rapportere") +
  //     "</div>" +
  //     "</div>" +
  //     '<div style="display: flex; align-items: center; column-gap: 10px;">' +
  //     "<div>" +
  //     (harAktivitet ? "_" : "X") +
  //     "</div><div>" +
  //     renderToString(<PortableText value={getRichText("rapportering-ingen-å-rapportere")} />) +
  //     "</div>" +
  //     "</div>" +
  //     "<h3>" +
  //     getAppText("rapportering-les-mer-hva-skal-rapporteres-tittel") +
  //     "</h3>" +
  //     '<div style="border-left: solid 1px black; padding-left: 5px;">' +
  //     renderToString(
  //       <PortableText value={getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold")} />
  //     ) +
  //     "</div>";
  // } else {
  //   html +=
  //     // Fyll ut Endring
  //     "<h1>" +
  //     getAppText("rapportering-periode-endre-tittel") +
  //     "</h1>" +
  //     renderToString(
  //       <PortableText value={getRichText("rapportering-periode-endre-beskrivelse")} />
  //     ) +
  //     "<br>" +
  //     "<h3>" +
  //     (antallPerioder > 0 ? hentPeriodeTekst(rapporteringsperioder[0], getAppText) : "") +
  //     "</h3>" +
  //     // Popup
  //     "<b>" +
  //     getAppText("rapportering-hva-vil-du-lagre") +
  //     "</b><br>" +
  //     aktivitetTypeMap("Arbeid", getAppText) +
  //     ": " +
  //     getAppText("rapportering-aktivitet-radio-arbeid-beskrivelse") +
  //     " " +
  //     getAppText("rapportering-antall-timer") +
  //     " " +
  //     renderToString(<PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />) +
  //     "<br>" +
  //     aktivitetTypeMap("Syk", getAppText) +
  //     ": " +
  //     getAppText("rapportering-aktivitet-radio-syk-beskrivelse") +
  //     "<br>" +
  //     aktivitetTypeMap("Fravaer", getAppText) +
  //     ": " +
  //     getAppText("rapportering-aktivitet-radio-fravaer-beskrivelse") +
  //     "<br>" +
  //     aktivitetTypeMap("Utdanning", getAppText) +
  //     ": " +
  //     getAppText("rapportering-aktivitet-radio-utdanning-beskrivelse") +
  //     "<br>" +
  //     "<br>" +
  //     getAppText("rapportering-periode-innsending-og-frist-dato")
  //       .replace("{date1}", tidligstInnsendingDato)
  //       .replace("{date2}", senestInnsendingDato) +
  //     "<br>" +
  //     "<br>" +
  //     "<h2>" +
  //     getAppText("rapportering-endring-begrunnelse-tittel") +
  //     "</h2>" +
  //     getAppText("rapportering-endring-begrunnelse-beskrivelse") +
  //     "<br>" +
  //     "<b>" +
  //     getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-label") +
  //     "</b><br>" +
  //     getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-description") +
  //     "<br>" +
  //     periode.begrunnelseEndring +
  //     "<br>";
  // }

  // if (!periode.begrunnelseEndring) {
  //   if (harAktivitet) {
  //     html +=
  //       // Fyll ut
  //       "<h1>" +
  //       getAppText("rapportering-periode-fyll-ut-tittel") +
  //       "</h1>" +
  //       getAppText("rapportering-periode-fyll-ut-beskrivelse") +
  //       "<br>" +
  //       "<br>" +
  //       // Popup
  //       "<b>" +
  //       getAppText("rapportering-hva-vil-du-lagre") +
  //       "</b><br>" +
  //       aktivitetTypeMap("Arbeid", getAppText) +
  //       ": " +
  //       getAppText("rapportering-aktivitet-radio-arbeid-beskrivelse") +
  //       " " +
  //       getAppText("rapportering-antall-timer") +
  //       " " +
  //       renderToString(
  //         <PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />
  //       ) +
  //       "<br>" +
  //       aktivitetTypeMap("Syk", getAppText) +
  //       ": " +
  //       getAppText("rapportering-aktivitet-radio-syk-beskrivelse") +
  //       "<br>" +
  //       aktivitetTypeMap("Fravaer", getAppText) +
  //       ": " +
  //       getAppText("rapportering-aktivitet-radio-fravaer-beskrivelse") +
  //       "<br>" +
  //       aktivitetTypeMap("Utdanning", getAppText) +
  //       ": " +
  //       getAppText("rapportering-aktivitet-radio-utdanning-beskrivelse") +
  //       "<br>" +
  //       "<br>" +
  //       getAppText("rapportering-periode-innsending-og-frist-dato")
  //         .replace("{date1}", tidligstInnsendingDato)
  //         .replace("{date2}", senestInnsendingDato) +
  //       "<br>" +
  //       "<br>" +
  //       // Tom
  //       (harIngenAktiviteter
  //         ? '<div style="border: 1px solid black; padding: 5px;"><b>' +
  //           getAppText("rapportering-tom-periode-tittel") +
  //           "</b><br>" +
  //           getAppText("rapportering-tom-periode-innhold") +
  //           "</div>" +
  //           "<br>" +
  //           getAppText("rapportering-tom-noe-å-rapportere") +
  //           renderToString(
  //             <PortableText value={getRichText("rapportering-tom-ingen-å-rapportere")} />
  //           )
  //         : "");
  //   }

  //   html +=
  //     // Arbeidssøker
  //     "<b>" +
  //     getAppText("rapportering-arbeidssokerregister-tittel") +
  //     "</b><br>" +
  //     getAppText("rapportering-arbeidssokerregister-subtittel") +
  //     "<br>" +
  //     (periode.registrertArbeidssoker ? "X " : "_ ") +
  //     getAppText("rapportering-arbeidssokerregister-svar-ja") +
  //     "<br>" +
  //     (periode.registrertArbeidssoker ? "_ " : "X ") +
  //     getAppText("rapportering-arbeidssokerregister-svar-nei") +
  //     "<br>" +
  //     "<br>" +
  //     '<div style="border: 1px solid black; padding: 5px;">' +
  //     (periode.registrertArbeidssoker
  //       ? "<b>" + getAppText("rapportering-arbeidssokerregister-alert-tittel-registrert") + "</b>"
  //       : "<b>" +
  //         getAppText("rapportering-arbeidssokerregister-alert-tittel-avregistrert") +
  //         "</b><br>" +
  //         renderToString(
  //           <PortableText
  //             value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert")}
  //           />
  //         )) +
  //     "</div>";
  // }

  // html +=
  //   // Oppsummering
  //   "<h1>" +
  //   getAppText("rapportering-send-inn-tittel") +
  //   "</h1>" +
  //   renderToString(<PortableText value={getRichText("rapportering-send-inn-innhold")} />) +
  //   "<br>" +
  //   "<b>" +
  //   getAppText("rapportering-send-inn-periode-tittel") +
  //   "</b><br>" +
  //   (antallPerioder > 0 ? hentPeriodeTekst(rapporteringsperioder[0], getAppText) : "") +
  //   "<br>" +
  //   "<br>" +
  //   // Sammenlagt
  //   "<b>" +
  //   getAppText("rapportering-oppsummering-tittel") +
  //   "</b><br>" +
  //   getAppText("rapportering-arbeid") +
  //   " " +
  //   hentTotaltArbeidstimerTekst(periode, getAppText) +
  //   "<br>" +
  //   getAppText("rapportering-syk") +
  //   " " +
  //   hentTotaltFravaerTekstMedType(periode, "Syk", getAppText) +
  //   "<br>" +
  //   getAppText("rapportering-fraevaer") +
  //   " " +
  //   hentTotaltFravaerTekstMedType(periode, "Fravaer", getAppText) +
  //   "<br>" +
  //   getAppText("rapportering-utdanning") +
  //   " " +
  //   hentTotaltFravaerTekstMedType(periode, "Utdanning", getAppText) +
  //   "<br>" +
  //   "<br>" +
  //   "X " +
  //   getAppText("rapportering-send-inn-bekreft-opplysning") +
  //   // Kvittering
  //   "<h3>" +
  //   getAppText("rapportering-periode-bekreftelse-tittel") +
  //   "</h3>" +
  //   "</div>";

  // return html;
}

export function harAktiviteter(periode: IRapporteringsperiode): boolean {
  return periode.dager.some((dag) => dag.aktiviteter.length > 0);
}
