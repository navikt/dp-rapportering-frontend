import { TZDate } from "@date-fns/tz";
import { PortableText } from "@portabletext/react";
import { addDays } from "date-fns";
import { renderToString } from "react-dom/server";
import type { SubmitFunction } from "react-router";

import { hentAktivitetBeskrivelse } from "~/components/aktivitet-checkbox/AktivitetCheckboxes";
import { hentAktivitetOppsummeringTekst } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import {
  type ArbeidssokerstatusSide,
  hentArbeidssokerstatusInnhold,
} from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { hentInnsendingsStatusInnhold } from "~/components/beskjeder/InnsendingsStatusBeskjed";
import { lesMerInnhold } from "~/components/LesMer";
import { type GetAppText, type GetRichText } from "~/hooks/useSanity";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { hentSidetittel } from "~/root";
import type { MeldekortBrukerflateApiResponse } from "~/sanity/queries/meldekort-brukerflate";
import {
  AktivitetType,
  aktivitetType,
  aktivitetTypeMap,
  IAktivitet,
} from "~/utils/aktivitettype.utils";
import { sanityRichText, sanityTekst } from "~/utils/sanity.utils";

import {
  formaterDato,
  formaterPeriodeDato,
  formaterPeriodeTilUkenummer,
  getWeekDays,
} from "./dato.utils";
import { DecoratorLocale } from "./dekoratoren.utils";
import {
  hentPeriodeTekst,
  hentUkeTekst,
  nestePeriode,
  perioderSomKanSendes,
  periodeSomTimer,
  skalHaArbeidssokerSporsmal,
} from "./periode.utils";
import { Rapporteringstype, TIDSSONER } from "./types";

interface IProps {
  locale: DecoratorLocale;
  getAppText: GetAppText;
  getRichText: GetRichText;
  periode: IRapporteringsperiode | null;
  rapporteringsperioder: IRapporteringsperiode[];
  nySanityTexts?: MeldekortBrukerflateApiResponse;
  disableSpm5?: boolean;
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
  nySanityTexts,
  disableSpm5,
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
      nySanityTexts,
      disableSpm5,
    );
    formData.set("_html", html);
    formData.set("_action", "send-inn");

    submit(formData, { method: "post" });
  };
}

export function getArbeidssokerAlert(
  periode: IRapporteringsperiode,
  side: ArbeidssokerstatusSide,
  nySanityTexts: MeldekortBrukerflateApiResponse | undefined,
  locale: DecoratorLocale,
): string {
  const { tekst, felt } = hentArbeidssokerstatusInnhold(
    periode,
    side,
    nySanityTexts?.arbeidssokerstatusBeskjeder,
  );

  if (!felt) {
    return "";
  }

  const nesteMeldeperiode = nestePeriode(periode.periode);
  const dato = formaterDato({
    dato: nesteMeldeperiode.fraOgMed,
    dateFormat: "d. MMMM yyyy",
    locale,
  });
  const tekstMedDato = sanityRichText(tekst, felt).map((block) => ({
    ...block,
    children: block.children.map((child) => ({
      ...child,
      text: child.text?.replaceAll("{{nestePeriodeDato}}", dato),
    })),
  }));

  return tekstMedDato.length > 0 ? renderToString(<PortableText value={tekstMedDato} />) : "";
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
  return `<li>${ukedag.lang} ${formaterDato({ dato: dag.dato, dateFormat: "d" })}. ${dag.aktiviteter.length ? dag.aktiviteter.map((aktivitet) => getAktivitet(aktivitet, getAppText)).join(", ") : ""}</li>`;
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
  periode,
  nySanityTexts,
}: {
  getAppText?: GetAppText;
  periode: IRapporteringsperiode;
  nySanityTexts?: MeldekortBrukerflateApiResponse;
}): string {
  const oppsummering = hentAktivitetOppsummeringTekst(
    periode,
    nySanityTexts?.meldekortdetaljer ?? undefined,
  );

  return [
    "<div>",
    getHeader({ text: oppsummering.tittel, level: "4" }),
    oppsummering.rader.map((rad) => `<p>${rad.label}: ${rad.verdi}</p>`).join(""),
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
  const { getAppText, periode, nySanityTexts } = props;

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
    "rapportering-endring-begrunnelse-nedtrekksmeny-option-other",
  ];

  const seksjoner = [
    getHeader({
      text: sanityTekst(
        nySanityTexts?.utfylling?.begrunnelseForEndring?.tittel,
        "utfylling.begrunnelseForEndring.tittel",
      ),
      level: "3",
    }),
    `<p>${sanityTekst(
      nySanityTexts?.utfylling?.begrunnelseForEndring?.beskrivelse,
      "utfylling.begrunnelseForEndring.beskrivelse",
    )}</p>`,
    `<ul>${options.map((option) => (periode.begrunnelseEndring === option ? `<li><strong>${getAppText(option)}</strong></li>` : `<li>${getAppText(option)}</li>`)).join("")}</ul>`,
  ];

  return seksjoner.join("");
}

export function htmlForLandingsside(props: IProps): string {
  const { rapporteringsperioder, periode, nySanityTexts } = props;
  const velkomstside = nySanityTexts?.velkomstside;

  const seksjoner: string[] = [];

  const ingenMeldekort = velkomstside?.innsendingsmulighet.ingenMeldekort;
  if (rapporteringsperioder.length === 0 && ingenMeldekort) {
    seksjoner.push(`<p>${ingenMeldekort}</p>`);
  }

  const forTidligTekst = velkomstside?.innsendingsmulighet.forTidlig;
  if (periode && !periode.kanSendes && forTidligTekst) {
    const [ukeFom, weekTom] = formaterPeriodeTilUkenummer(
      periode.periode.fraOgMed,
      periode.periode.tilOgMed,
    ).split(" - ");
    const forTidlig = forTidligTekst
      .replaceAll("{{ukeFom}}", ukeFom)
      .replaceAll("{{weekTom}}", weekTom)
      .replaceAll(
        "{{fom}}",
        formaterDato({ dato: new TZDate(periode.kanSendesFra, TIDSSONER.OSLO) }),
      );

    seksjoner.push(`<p>${forTidlig}</p>`);
  }

  if (velkomstside?.velkomstTekst) {
    seksjoner.push(renderToString(<PortableText value={velkomstside.velkomstTekst} />));
  }

  if (velkomstside?.harDuFaattDegJobb?.tittel && velkomstside.harDuFaattDegJobb.tekst) {
    seksjoner.push(getHeader({ text: velkomstside.harDuFaattDegJobb.tittel, level: "3" }));
    seksjoner.push(renderToString(<PortableText value={velkomstside.harDuFaattDegJobb.tekst} />));
  }

  const klarTilInnsending = velkomstside?.innsendingsmulighet.klarTilInnsending;
  if (periode?.kanSendes && klarTilInnsending?.tittel && klarTilInnsending.tekst) {
    seksjoner.push(getHeader({ text: klarTilInnsending.tittel, level: "2" }));
    seksjoner.push(renderToString(<PortableText value={klarTilInnsending.tekst} />));
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

  const tidligstInnsendingDato = formaterDato({
    dato: new TZDate(periode.kanSendesFra, TIDSSONER.OSLO),
  });
  const senestInnsendingDato = formaterDato({
    dato: addDays(new TZDate(periode.periode.fraOgMed, TIDSSONER.OSLO), 21),
  });

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
    getOppsummering({ getAppText, periode, nySanityTexts: props.nySanityTexts }),
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
  const { periode, nySanityTexts, locale } = props;

  if (!periode) {
    return "";
  }

  const nesteMeldeperiode = nestePeriode(periode.periode);
  const dateFormat =
    nesteMeldeperiode.fraOgMed.getFullYear() !== nesteMeldeperiode.tilOgMed.getFullYear() ||
    nesteMeldeperiode.fraOgMed.getFullYear() !== new Date().getFullYear()
      ? "d. MMMM yyyy"
      : "d. MMMM";

  const seksjoner: string[] = [];

  const arbeidssokerstatusSporsmaal = nySanityTexts?.utfylling?.arbeidssokerstatusSporsmaal;
  const fom = formaterDato({ dato: nesteMeldeperiode.fraOgMed, dateFormat, locale });
  const tom = formaterDato({ dato: nesteMeldeperiode.tilOgMed, dateFormat, locale });

  const legend = sanityTekst(
    arbeidssokerstatusSporsmaal?.tittel?.replaceAll("{{fom}}", fom).replaceAll("{{tom}}", tom),
    "utfylling.arbeidssokerstatusSporsmaal.tittel",
  );
  const description = sanityTekst(
    arbeidssokerstatusSporsmaal?.beskrivelse,
    "utfylling.arbeidssokerstatusSporsmaal.beskrivelse",
  );
  const options = [
    {
      value: true,
      label: sanityTekst(
        arbeidssokerstatusSporsmaal?.alternativer.ja,
        "utfylling.arbeidssokerstatusSporsmaal.alternativer.ja",
      ),
    },
    {
      value: false,
      label: sanityTekst(
        arbeidssokerstatusSporsmaal?.alternativer.nei,
        "utfylling.arbeidssokerstatusSporsmaal.alternativer.nei",
      ),
    },
  ]
    .map((option) => {
      return getInput({
        type: "radio",
        checked: option.value === periode.registrertArbeidssoker,
        label: option.label,
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
  seksjoner.push(getArbeidssokerAlert(periode, "utfylling", nySanityTexts, locale));

  return seksjoner.join("");
}

export function htmlForOppsummering(props: IProps): string {
  const { getAppText, periode, nySanityTexts, locale } = props;

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

  const seOver = nySanityTexts?.utfylling?.seOver;
  const sendestatus = nySanityTexts?.meldekortInnsendingsstatusBeskjed;
  const statusFelt = periode.originalId ? "endringerIkkeSendtInnEnda" : "ikkeSendtInnEnda";
  const { tekst: statusTekst, felt: statusFeltsti } = hentInnsendingsStatusInnhold(
    statusFelt,
    sendestatus,
  );

  const seksjoner: string[] = [
    getHeader({
      text: sanityTekst(seOver?.sidetittel, "utfylling.seOver.sidetittel"),
      level: "2",
    }),
    renderToString(
      <PortableText value={sanityRichText(seOver?.beskrivelse, "utfylling.seOver.beskrivelse")} />,
    ),
    `<p>${sanityTekst(statusTekst, statusFeltsti)}</p>`,
    getHeader({ text: getAppText("rapportering-send-inn-periode-tittel"), level: "3" }),
    `<p>${invaerendePeriodeTekst}</p>`,
    getKalender(props, false),
    getOppsummering({ getAppText, periode, nySanityTexts }),
  ];

  if (periode.originalId) {
    seksjoner.push(
      getHeader({
        text: sanityTekst(
          nySanityTexts?.utfylling?.begrunnelseForEndring?.tittel,
          "utfylling.begrunnelseForEndring.tittel",
        ),
        level: "3",
      }),
    );
    seksjoner.push(getArbeidssokerAlert(periode, "bekreftelse", nySanityTexts, locale));
    seksjoner.push(`<p>${periode.begrunnelseEndring}</p>`);
  } else {
    if (!props.disableSpm5 && skalHaArbeidssokerSporsmal(periode)) {
      const arbeidssokerstatusSporsmaal = nySanityTexts?.utfylling?.arbeidssokerstatusSporsmaal;
      const nesteMeldeperiode = nestePeriode(periode.periode);
      const dateFormat =
        nesteMeldeperiode.fraOgMed.getFullYear() !== nesteMeldeperiode.tilOgMed.getFullYear() ||
        nesteMeldeperiode.fraOgMed.getFullYear() !== new Date().getFullYear()
          ? "d. MMMM yyyy"
          : "d. MMMM";
      const arbeidssokerSporsmal = sanityTekst(
        arbeidssokerstatusSporsmaal?.tittel,
        "utfylling.arbeidssokerstatusSporsmaal.tittel",
      )
        .replaceAll("{{fom}}", formaterDato({ dato: nesteMeldeperiode.fraOgMed, dateFormat }))
        .replaceAll(
          "{{tom}}",
          formaterDato({ dato: nesteMeldeperiode.tilOgMed, dateFormat: "d. MMMM yyyy" }),
        );
      const arbeidssokerSvar =
        periode.registrertArbeidssoker === null
          ? "—"
          : sanityTekst(
              periode.registrertArbeidssoker
                ? arbeidssokerstatusSporsmaal?.alternativer.ja
                : arbeidssokerstatusSporsmaal?.alternativer.nei,
              `utfylling.arbeidssokerstatusSporsmaal.alternativer.${periode.registrertArbeidssoker ? "ja" : "nei"}`,
            );

      seksjoner.push(
        `<h3>${arbeidssokerSporsmal}</h3><p>${sanityTekst(
          arbeidssokerstatusSporsmaal?.svarPrefiks,
          "utfylling.arbeidssokerstatusSporsmaal.svarPrefiks",
        )} ${arbeidssokerSvar}</p>`,
      );
    }
    if (!props.disableSpm5 && skalHaArbeidssokerSporsmal(periode)) {
      seksjoner.push(getArbeidssokerAlert(periode, "bekreftelse", nySanityTexts, locale));
    }
  }

  if (periode.originalId) {
    seksjoner.push(
      `<form>
        <input type="checkbox" name="rapportering-send-inn-bekreft-opplysning" checked/>
        <label>${sanityTekst(
          seOver?.jegHarSettOverBeskjed,
          "utfylling.seOver.jegHarSettOverBeskjed",
        )}</label>
      </form>`,
    );
  } else {
    seksjoner.push(
      `<form>
        <input type="checkbox" name="rapportering-send-inn-bekreft-opplysning" checked/>
        <label>${sanityTekst(
          seOver?.jegHarSettOverBeskjed,
          "utfylling.seOver.jegHarSettOverBeskjed",
        )}</label>
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
  nySanityTexts?: MeldekortBrukerflateApiResponse,
  disableSpm5?: boolean,
): string {
  const pages: string[] = [];

  if (periode.originalId) {
    const fns = [htmlForFyllUt, htmlForEndringBegrunnelse, htmlForOppsummering];

    fns.forEach((fn) =>
      pages.push(
        fn({
          periode,
          getAppText,
          getRichText,
          locale,
          rapporteringsperioder,
          nySanityTexts,
          disableSpm5,
        }),
      ),
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

    if (!disableSpm5 && skalHaArbeidssokerSporsmal(periode)) {
      fns.push(htmlForArbeidssoker);
    }

    fns.push(htmlForOppsummering);

    fns.forEach((fn) =>
      pages.push(
        fn({
          periode,
          getAppText,
          getRichText,
          locale,
          rapporteringsperioder,
          nySanityTexts,
          disableSpm5,
        }),
      ),
    );
  }

  const tittel = sanityTekst(hentSidetittel(nySanityTexts), "grunntekster.sidetittel");
  const html = `<div class="melding-om-vedtak">${getHeader({ text: tittel, level: "1" })}${pages.join('</div><div class="melding-om-vedtak">')}</div>`;
  return html;
}
