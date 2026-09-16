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
