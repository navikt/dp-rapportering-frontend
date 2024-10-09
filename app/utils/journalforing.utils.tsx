import {
  formaterDato,
  formaterPeriodeDato,
  formaterPeriodeTilUkenummer,
  getWeekDays,
} from "./dato.utils";
import { DecoratorLocale } from "./dekoratoren.utils";
import {
  hentPeriodeTekst,
  hentTotaltArbeidstimerTekst,
  hentTotaltFravaerTekstMedType,
  hentUkeTekst,
  periodeSomTimer,
} from "./periode.utils";
import { Rapporteringstype } from "./types";
import { PortableText } from "@portabletext/react";
import type { SubmitFunction } from "@remix-run/react";
import { addDays, format } from "date-fns";
import { renderToString } from "react-dom/server";
import type { AktivitetType, IAktivitet } from "~/models/aktivitet.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { getSanityPortableTextComponents } from "~/sanity/sanityPortableTextComponents";
import { aktivitetType, aktivitetTypeMap } from "~/utils/aktivitettype.utils";
import { type GetAppText, type GetRichText } from "~/hooks/useSanity";
import { hentAktivitetBeskrivelse } from "~/components/aktivitet-checkbox/AktivitetCheckboxes";

interface IProps {
  locale: DecoratorLocale;
  getAppText: GetAppText;
  getRichText: GetRichText;
  periode: IRapporteringsperiode | null;
  rapporteringsperioder: IRapporteringsperiode[];
}

interface IUseAddHtml extends IProps {
  submit: SubmitFunction;
  periode: IRapporteringsperiode;
}

export function useAddHtml({
  rapporteringsperioder,
  periode,
  getAppText,
  getRichText,
  submit,
  locale,
}: IUseAddHtml) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const html = samleHtmlForPeriode(
      rapporteringsperioder,
      periode,
      getAppText,
      getRichText,
      locale
    );
    formData.set("_html", html);
    formData.set("_action", "send-inn");

    submit(formData, { method: "post" });
  };
}

export function getArbeidssokerAlert(
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

export function getHeader({ text, level }: { text: string; level: "1" | "2" | "3" | "4" }): string {
  return `<h${level}>${text}</h${level}>`;
}

export function getLesMer(props: IProps): string {
  const { getAppText, getRichText } = props;
  return [
    "// Les mer",
    getHeader({ text: getAppText("rapportering-les-mer-hva-skal-rapporteres-tittel"), level: "2" }),
    renderToString(
      <PortableText value={getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold")} />
    ),
  ].join("");
}

export function getAktivitetCheckbox(
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

export function getAktivitetModal(props: IProps): string {
  const { getAppText, getRichText } = props;
  const modalHeader = `${getHeader({ text: getAppText("rapportering-hva-vil-du-lagre"), level: "1" })}`;
  const modalBody = aktivitetType
    .map((aktivitet) => getAktivitetCheckbox(aktivitet, getAppText, getRichText))
    .join("");

  return ["// popup", "<dialog>", modalHeader, "<div>", modalBody, "</div>", "</dialog>"].join("");
}

export function getAktivitet(aktivitet: IAktivitet, getAppText: GetAppText): string {
  if (aktivitet.type === "Arbeid") {
    return `${aktivitetTypeMap(aktivitet.type, getAppText)} (${periodeSomTimer(aktivitet.timer) ?? 0})`;
  }

  return aktivitetTypeMap(aktivitet.type, getAppText);
}

export function getDag(
  dag: IRapporteringsperiodeDag,
  ukedag: { kort: string; lang: string },
  getAppText: GetAppText
): string {
  return `<li>${ukedag.lang} ${format(new Date(dag.dato), "d")}. ${dag.aktiviteter.length ? dag.aktiviteter.map((aktivitet) => getAktivitet(aktivitet, getAppText)).join(", ") : ""}</li>`;
}

export function getKalender(props: IProps, showModal: boolean = true): string {
  const { periode, getAppText, locale } = props;

  if (!periode) {
    return "";
  }

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

export function getOppsummering({
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

export function getInput({
  type,
  checked,
  label,
}: {
  type: string;
  checked: boolean;
  label: string;
}): string {
  return `<input type="${type}" ${checked ? "checked" : ""} /><label>${label}</label>`;
}

export function htmlForEndringBegrunnelse(props: IProps): string {
  const { getAppText, periode } = props;

  if (!periode) {
    return "";
  }

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

  if (periode && !periode.kanSendes) {
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

  if (periode?.kanSendes) {
    seksjoner.push(getHeader({ text: getAppText("rapportering-samtykke-tittel"), level: "2" }));
    seksjoner.push(
      renderToString(<PortableText value={getRichText("rapportering-samtykke-beskrivelse")} />)
    );
    seksjoner.push(
      `<form><input type="checkbox" checked/><label>${getAppText("rapportering-samtykke-checkbox")}</label></form>`
    );
  }

  return seksjoner.join("");
}

export function htmlForRapporteringstype(props: IProps): string {
  const { rapporteringsperioder, getAppText, getRichText, periode } = props;

  if (!periode) {
    return "";
  }

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
  seksjoner.push(`<p>${hentPeriodeTekst(periode, getAppText)}</p>`);
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
      ).replaceAll(/<\/?p>/g, ""),
    },
  ]
    .map((option) =>
      getInput({
        type: "radio",
        checked: periode.rapporteringstype === option.value,
        label: option.label,
      })
    )
    .join("</div><div>");

  const radioGroup = `<fieldset><legend>${legend}</legend><p>${description}</p><form><div>${options}</div></form></fieldset>`;

  seksjoner.push(radioGroup);

  return seksjoner.join("");
}

export function htmlForFyllUt(props: IProps): string {
  const { getAppText, getRichText, periode } = props;

  if (!periode) {
    return "";
  }

  const tittel = periode.originalId
    ? "rapportering-periode-endre-tittel"
    : "rapportering-periode-fyll-ut-tittel";
  const beskrivelse = periode.originalId
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

  if (!periode) {
    return "";
  }

  const seksjoner: string[] = [getHeader({ text: getAppText("rapportering-tittel"), level: "1" })];

  const legend = getAppText("rapportering-arbeidssokerregister-tittel");
  const description = getAppText("rapportering-arbeidssokerregister-subtittel");
  const options = [
    { value: true, label: "rapportering-arbeidssokerregister-svar-ja" },
    { value: false, label: "rapportering-arbeidssokerregister-svar-nei" },
  ]
    .map((option) => {
      return getInput({
        type: "radio",
        checked: option.value === periode.registrertArbeidssoker,
        label: getAppText(option.label),
      });
    })
    .join("");

  const radioGroup = `<form><fieldset><legend>${legend}</legend><p>${description}</p>${options}</fieldset></form>`;
  seksjoner.push(radioGroup);
  seksjoner.push(getArbeidssokerAlert(periode, getAppText, getRichText));

  return seksjoner.join("");
}

export function htmlForOppsummering(props: IProps): string {
  const { getAppText, getRichText, periode } = props;

  if (!periode) {
    return "";
  }

  const ukenummer = formaterPeriodeTilUkenummer(periode.periode.fraOgMed, periode.periode.tilOgMed);
  const dato = formaterPeriodeDato(periode.periode.fraOgMed, periode.periode.tilOgMed);

  const invaerendePeriodeTekst = `${getAppText("rapportering-uke")} ${ukenummer} (${dato})`;

  const tittel = periode.originalId
    ? "rapportering-endring-send-inn-tittel"
    : "rapportering-send-inn-tittel";
  const beskrivelse = periode.originalId
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
      `<form><input type="checkbox" checked/><label>${getAppText("rapportering-endring-send-inn-bekreft-opplysning")}</label></form>`
    );
  } else {
    seksjoner.push(
      `<form><input type="checkbox" checked/><label>${getAppText("rapportering-send-inn-bekreft-opplysning")}</label></form>`
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

  return `<div class="melding-om-vedtak">${pages.join('</div><div class="melding-om-vedtak">')}</div>`;
}