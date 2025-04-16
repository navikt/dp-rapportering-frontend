import { PortableText } from "@portabletext/react";
import type { SubmitFunction } from "@remix-run/react";
import { addDays, format } from "date-fns";
import { renderToString } from "react-dom/server";

import { hentAktivitetBeskrivelse } from "~/components/aktivitet-checkbox/AktivitetCheckboxes";
import { lesMerInnhold } from "~/components/LesMer";
import { type GetAppText, type GetRichText } from "~/hooks/useSanity";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import {
  AktivitetType,
  aktivitetType,
  aktivitetTypeMap,
  IAktivitet,
} from "~/utils/aktivitettype.utils";

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
  perioderSomKanSendes,
  periodeSomTimer,
} from "./periode.utils";
import { KortType, Rapporteringstype } from "./types";

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
      locale,
    );
    formData.set("_html", html);
    formData.set("_action", "send-inn");

    submit(formData, { method: "post" });
  };
}

export function getArbeidssokerAlert(
  periode: IRapporteringsperiode,
  getAppText: GetAppText,
  getRichText: GetRichText,
): string {
  if (periode.registrertArbeidssoker === true) {
    return `<p>${getAppText("rapportering-arbeidssokerregister-alert-tittel-registrert")}</p>`;
  }

  if (periode.registrertArbeidssoker === false) {
    return [
      getHeader({
        text: getAppText("rapportering-arbeidssokerregister-alert-tittel-avregistrert"),
        level: "3",
      }),

      renderToString(
        <PortableText
          value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert")}
        />,
      ),
    ].join("");
  }

  return "";
}

export function getHeader({
  text,
  level,
}: {
  text: string;
  level: "1" | "2" | "3" | "4" | "5";
}): string {
  return `<h${level}>${text}</h${level}>`;
}

export function getLesMer(props: IProps & { tittel: string; innhold: string }): string {
  const { getAppText, tittel, innhold } = props;
  return [
    "// Les mer",
    "<div style='border: 1px solid black; padding: 10px;'>",
    getHeader({ text: getAppText(tittel), level: "2" }),
    innhold,
    "</div>",
  ].join("");
}

export function getLesMerFyllUt(props: IProps): string {
  const { getAppText, getRichText } = props;

  const legend = getAppText("rapportering-les-mer-hva-skal-rapporteres-legend");
  const options = lesMerInnhold
    .map(
      ({ value }) =>
        `<input type="checkbox" name="${value}" /><label>${aktivitetTypeMap(value, getAppText)}</label>`,
    )
    .join("</div><div>");

  const checkboxes = `<fieldset><legend>${getHeader({ text: legend, level: "3" })}</legend><form><div>${options}</div></form></fieldset>`;

  const innhold = lesMerInnhold
    .map(({ content }) => renderToString(<PortableText value={getRichText(content)} />))
    .join("");

  return getLesMer({
    ...props,
    tittel: "rapportering-les-mer-hva-skal-rapporteres-tittel",
    innhold: [checkboxes, innhold].join(""),
  });
}

export function getAktivitetCheckbox(props: IProps & { aktivitet: AktivitetType }): string {
  const { aktivitet, getAppText, getRichText } = props;
  let arbeid = "";

  if (aktivitet === "Arbeid") {
    const lesMer = getLesMer({
      ...props,
      tittel: "rapportering-aktivitet-jobb-prosentstilling-tittel",
      innhold: renderToString(
        <PortableText value={getRichText("rapportering-aktivitet-jobb-prosentstilling-innhold")} />,
      ),
    });
    arbeid = `${getHeader({ text: getAppText("rapportering-antall-timer"), level: "5" })}<p>${renderToString(<PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />)}</p>${lesMer}`;
  }

  return `${getHeader({ text: aktivitetTypeMap(aktivitet, getAppText), level: "4" })}<p>${hentAktivitetBeskrivelse(aktivitet, getAppText)}</p>${arbeid}`;
}

export function getAktivitetModal(props: IProps): string {
  const { getAppText } = props;
  const modalHeader = `${getHeader({ text: getAppText("rapportering-hva-vil-du-lagre"), level: "3" })}`;
  const modalBody = aktivitetType
    .map((aktivitet) => getAktivitetCheckbox({ ...props, aktivitet }))
    .join("");

  return [
    "// Popup",
    "<dialog style='border: 1px solid black; padding: 10px;'>",
    modalHeader,
    "<div>",
    modalBody,
    "</div>",
    "</dialog>",
  ].join("");
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
  getAppText: GetAppText,
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
    `<p>${formaterPeriodeDato(periode.periode.fraOgMed, periode.periode.tilOgMed, locale)}</p>`,
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
    getHeader({ text: getAppText("rapportering-oppsummering-tittel"), level: "4" }),
    oppsummering,
    "</div>",
  ].join("");
}

export function getInput({
  type,
  checked,
  label,
  name,
}: {
  type: string;
  checked: boolean;
  label: string;
  name: string;
}): string {
  return `<input type="${type}" name="${name}" ${checked ? "checked" : ""} /><label>${label}</label>`;
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

  const seksjoner: string[] = [];

  if (rapporteringsperioder.length === 0) {
    seksjoner.push(`<p>${getAppText("rapportering-ingen-meldekort")}</p>`);
  }

  if (periode && !periode.kanSendes) {
    seksjoner.push(
      renderToString(
        <PortableText
          value={getRichText("rapportering-for-tidlig-a-sende-meldekort", {
            dato: formaterDato(new Date(periode.kanSendesFra)),
          })}
        />,
      ),
    );
  }

  seksjoner.push(renderToString(<PortableText value={getRichText("rapportering-innledning")} />));

  if (periode?.kanSendes) {
    seksjoner.push(getHeader({ text: getAppText("rapportering-samtykke-tittel"), level: "2" }));
    seksjoner.push(
      renderToString(<PortableText value={getRichText("rapportering-samtykke-beskrivelse")} />),
    );
    seksjoner.push(
      `<form><input type="checkbox" name="rapportering-samtykke-checkbox" checked/><label>${getAppText("rapportering-samtykke-checkbox")}</label></form>`,
    );
  }

  return seksjoner.join("");
}

export function htmlForRapporteringstype(props: IProps): string {
  const { rapporteringsperioder, getAppText, getRichText, periode } = props;

  if (!periode) {
    return "";
  }

  const antallPerioder = perioderSomKanSendes(rapporteringsperioder).length;
  const harFlerePerioder = antallPerioder > 1;

  const tidligstInnsendingDato = formaterDato(new Date(periode.kanSendesFra));
  const senestInnsendingDato = formaterDato(addDays(new Date(periode.periode.fraOgMed), 21));

  const seksjoner: string[] = [];

  if (harFlerePerioder) {
    seksjoner.push(
      getHeader({
        text: getAppText("rapportering-flere-perioder-tittel", { antall: antallPerioder }),
        level: "2",
      }),
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
    }),
  );
  seksjoner.push(`<p>${hentPeriodeTekst(periode, getAppText, props.locale)}</p>`);
  seksjoner.push(
    renderToString(
      <PortableText
        value={getRichText("rapportering-fyll-ut-frister", {
          "fra-dato": tidligstInnsendingDato,
          "til-dato": senestInnsendingDato,
        })}
      />,
    ),
  );
  seksjoner.push(getLesMerFyllUt(props));

  const legend =
    rapporteringsperioder.length === 1
      ? getAppText("rapportering-rapporter-navarende-tittel")
      : getAppText("rapportering-ikke-utfylte-rapporter-tittel");
  const description = hentPeriodeTekst(periode, getAppText, props.locale);

  const options = [
    { value: Rapporteringstype.harAktivitet, label: getAppText("rapportering-noe-å-rapportere") },
    {
      value: Rapporteringstype.harIngenAktivitet,
      label: renderToString(
        <PortableText value={getRichText("rapportering-ingen-å-rapportere")} />,
      ).replaceAll(/<\/?p>/g, ""),
    },
  ]
    .map((option) =>
      getInput({
        type: "radio",
        checked: periode.rapporteringstype === option.value,
        label: option.label,
        name: "rapportering-ingen-å-rapportere-" + option.value,
      }),
    )
    .join("</div><div>");

  const radioGroup = `<fieldset><legend>${getHeader({ text: legend, level: "2" })}</legend><p>${description}</p><form><div>${options}</div></form></fieldset>`;

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
    getHeader({ text: getAppText(tittel), level: "2" }),
    renderToString(<PortableText value={getRichText(beskrivelse)} />),
    getKalender(props),
    getOppsummering({ getAppText, periode }),
  ];

  if (periode.originalId) {
    seksjoner.splice(2, 0, getLesMerFyllUt(props));
  }

  return seksjoner.join("");
}

export function htmlForTom(props: IProps): string {
  const { getRichText } = props;

  const seksjoner: string[] = [
    getHeader({ text: props.getAppText("rapportering-tom-periode-tittel"), level: "2" }),
    renderToString(<PortableText value={getRichText("rapportering-tom-periode-innhold")} />),
    renderToString(<PortableText value={getRichText("rapportering-tom-ingen-å-rapportere")} />),
  ];

  return seksjoner.join("");
}

export function htmlForArbeidssoker(props: IProps): string {
  const { getAppText, getRichText, periode } = props;

  if (!periode) {
    return "";
  }

  const seksjoner: string[] = [];

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
        name: option.label,
      });
    })
    .join("</div><div>");

  const radioGroup = `
    <form>
      <fieldset><legend>${legend}</legend><p>${description}</p><div>${options}</div></fieldset>
    </form>
  `;
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
  const dato = formaterPeriodeDato(
    periode.periode.fraOgMed,
    periode.periode.tilOgMed,
    props.locale,
  );

  const invaerendePeriodeTekst = `${getAppText("rapportering-uke")} ${ukenummer} (${dato})`;

  const tittel = periode.originalId
    ? "rapportering-endring-send-inn-tittel"
    : "rapportering-send-inn-tittel";
  const beskrivelse = periode.originalId
    ? "rapportering-endring-send-inn-innhold"
    : "rapportering-send-inn-innhold";
  const alert = periode.originalId
    ? "rapportering-endring-ikke-sendt-enda"
    : "rapportering-meldekort-ikke-sendt-enda";

  const seksjoner: string[] = [
    getHeader({ text: getAppText(tittel), level: "2" }),
    renderToString(<PortableText value={getRichText(beskrivelse)} />),
    renderToString(<PortableText value={getRichText(alert)} />),
    getHeader({ text: getAppText("rapportering-send-inn-periode-tittel"), level: "3" }),
    `<p>${invaerendePeriodeTekst}</p>`,
    getKalender(props, false),
    getOppsummering({ getAppText, periode }),
  ];

  if (periode.originalId) {
    seksjoner.push(
      getHeader({ text: getAppText("rapportering-endring-begrunnelse-tittel"), level: "3" }),
    );
    seksjoner.push(getArbeidssokerAlert(periode, getAppText, getRichText));
    seksjoner.push(`<p>${periode.begrunnelseEndring}</p>`);
  } else {
    seksjoner.push(getArbeidssokerAlert(periode, getAppText, getRichText));
  }

  if (periode.originalId) {
    seksjoner.push(
      `<form>
        <input type="checkbox" name="rapportering-send-inn-bekreft-opplysning" checked/>
        <label>${getAppText("rapportering-endring-send-inn-bekreft-opplysning")}</label>
      </form>`,
    );
  } else {
    seksjoner.push(
      `<form>
        <input type="checkbox" name="rapportering-send-inn-bekreft-opplysning" checked/>
        <label>${getAppText("rapportering-send-inn-bekreft-opplysning")}</label>
      </form>`,
    );
  }

  return seksjoner.join("");
}

export function samleHtmlForPeriode(
  rapporteringsperioder: IRapporteringsperiode[],
  periode: IRapporteringsperiode,
  getAppText: GetAppText,
  getRichText: GetRichText,
  locale: DecoratorLocale,
): string {
  const pages: string[] = [];

  if (periode.originalId) {
    const fns = [htmlForFyllUt, htmlForEndringBegrunnelse, htmlForOppsummering];

    fns.forEach((fn) =>
      pages.push(fn({ periode, getAppText, getRichText, locale, rapporteringsperioder })),
    );
  } else {
    const fns = [htmlForLandingsside, htmlForRapporteringstype];

    if (periode.rapporteringstype === Rapporteringstype.harAktivitet) {
      fns.push(htmlForFyllUt);
    }

    const harIngenAktiviteter = periode.dager.every((dag) => dag.aktiviteter.length === 0);

    if (periode.rapporteringstype === Rapporteringstype.harAktivitet && harIngenAktiviteter) {
      fns.push(htmlForTom);
    }

    if (periode.type !== KortType.MANUELL_ARENA) {
      fns.push(htmlForArbeidssoker);
    }

    fns.push(htmlForOppsummering);

    fns.forEach((fn) =>
      pages.push(fn({ periode, getAppText, getRichText, locale, rapporteringsperioder })),
    );
  }

  const html = `<div class="melding-om-vedtak">${getHeader({ text: getAppText("rapportering-tittel"), level: "1" })}${pages.join('</div><div class="melding-om-vedtak">')}</div>`;
  return html;
}
