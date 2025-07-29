import { render as TLRender } from "@testing-library/react";
import { ActionFunction, LoaderFunction } from "react-router";
import { createRoutesStub } from "react-router";

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
      path: "/periode/:rapporteringsperiodeId",
      Component: RapporteringsPeriodeSide,
      loader: rapporteringsperiodeLoader,

      id: "routes/periode.$rapporteringsperiodeId",
      children: [
        {
          path,
          // @ts-expect-error Don't know why these types are incompatible now
          Component,
          loader,
          action,
        },
      ],
    },
  ]);

  TLRender(<RoutesStub initialEntries={[initialEntry]} />);
};
