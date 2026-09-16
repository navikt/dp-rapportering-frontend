import { render as TLRender } from "@testing-library/react";
import { ActionFunction, LoaderFunction } from "react-router";
import { createRoutesStub, Outlet } from "react-router";

import RapporteringsPeriodeSide, {
  loader as rapporteringsperiodeLoader,
} from "~/routes/periode.$rapporteringsperiodeId";

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
          utfylling: {
            arbeidssokerstatusSporsmaal: {
              tittel: "rapportering-arbeidssokerregister-tittel-v2",
              beskrivelse: "rapportering-arbeidssokerregister-subtittel",
              alternativer: {
                ja: "rapportering-arbeidssokerregister-svar-ja",
                nei: "rapportering-arbeidssokerregister-svar-nei",
              },
            },
          },
          knapper: {
            tilbake: "rapportering-knapp-tilbake",
            neste: "rapportering-knapp-neste",
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
