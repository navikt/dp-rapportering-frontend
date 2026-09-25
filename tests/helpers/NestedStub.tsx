import { render as TLRender } from "@testing-library/react";
import { ActionFunction, LoaderFunction } from "react-router";
import { createRoutesStub, Outlet } from "react-router";

import RapporteringsPeriodeSide, {
  loader as rapporteringsperiodeLoader,
} from "~/routes/periode.$rapporteringsperiodeId";

const arbeidssokerstatusBeskjed = [
  {
    _key: "test-beskjed",
    _type: "block",
    children: [
      {
        _key: "test-beskjed-text",
        _type: "span",
        marks: [],
        text: "Arbeidssøkerstatus",
      },
    ],
    markDefs: [],
    style: "normal",
  },
];

interface IRoutesStub {
  path: string;
  Component: React.ComponentType;
  action?: ActionFunction;
  loader?: LoaderFunction;
  initialEntry: string;
}

export const withNestedRapporteringsperiode = ({
  path,
  Component,
  action,
  loader,
  initialEntry,
}: IRoutesStub) => {
  const RoutesStub = createRoutesStub([
    {
      id: "root",
      Component: Outlet,
      loader: () => ({
        sanityTekst: {
          meldekortdetaljer: {
            tittel: "Meldekort",
            periode: "rapportering-uke {{fomUke}} - {{tomUke}} ({{fomDate}} - {{tomDate}})",
            sendt: "Sendt",
            endret: "Endret",
            belopUtbetalt: "Beløp utbetalt",
            oppsummering: "Oppsummering",
            status: {
              tilUtfylling: "Til utfylling",
              innsendt: "Innsendt",
              ferdig: "Ferdig",
              endret: "Endret",
              feilet: "Feilet",
            },
            ukedager: {
              mandag: { kort: "man", lang: "mandag" },
              tirsdag: { kort: "tir", lang: "tirsdag" },
              onsdag: { kort: "ons", lang: "onsdag" },
              torsdag: { kort: "tor", lang: "torsdag" },
              fredag: { kort: "fre", lang: "fredag" },
              lordag: { kort: "lør", lang: "lørdag" },
              sondag: { kort: "søn", lang: "søndag" },
            },
            aktiviteter: {
              jobb: { kort: "jobb", lang: "Jobb" },
              syk: { kort: "syk", lang: "Syk" },
              ferie: { kort: "ferie", lang: "Ferie" },
              utdanning: { kort: "utdanning", lang: "Utdanning" },
            },
            tidsverdi: { timer: "timer", dager: "dager" },
          },
          meldekortInnsendingsstatusBeskjed: {
            ikkeSendtInnEnda: "Meldekortet er ikke sendt inn enda",
            endringerIkkeSendtInnEnda: "Endringene er ikke sendt inn enda",
            kanIkkeSendesInn: "Meldekortet kan ikke sendes inn",
            sendtInn: "Meldekortet er sendt inn",
            sendtInnEndringer: "Endringene er sendt inn",
          },
          arbeidssokerstatusBeskjeder: {
            duVilVaereRegistrert: arbeidssokerstatusBeskjed,
            duVilBliAvregistrert: {
              lang: arbeidssokerstatusBeskjed,
              kort: arbeidssokerstatusBeskjed,
            },
            duSkalIkkeSvarePaSporsmaal: arbeidssokerstatusBeskjed,
            fraArena: arbeidssokerstatusBeskjed,
            utenArbeidssokerSporsmaal: arbeidssokerstatusBeskjed,
            etterregistrert: arbeidssokerstatusBeskjed,
          },
          utfylling: {
            seOver: {
              sidetittel: "Se over meldekortet",
              beskrivelse: arbeidssokerstatusBeskjed,
              jegHarSettOverBeskjed: "Jeg har sett over opplysningene.",
            },
            arbeidssokerstatusSporsmaal: {
              tittel:
                "Ønsker du fortsatt å være registrert som arbeidssøker fra {{fom}} til {{tom}}?",
              beskrivelse: "Du må være registrert for å få utbetalinger og oppfølging fra Nav.",
              alternativer: {
                ja: "Ja",
                nei: "Nei",
              },
            },
          },
          knapper: {
            tilbake: "Tilbake",
            neste: "Neste",
          },
        },
      }),
      children: [
        {
          path: "/periode/:rapporteringsperiodeId",
          Component: RapporteringsPeriodeSide,
          loader: rapporteringsperiodeLoader,
          id: "routes/periode.$rapporteringsperiodeId",
          children: [{ path, Component, loader, action }],
        },
      ],
    },
  ]);

  TLRender(<RoutesStub initialEntries={[initialEntry]} />);
};
