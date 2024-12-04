import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { createRemixStub } from "@remix-run/testing";
import { render as TLRender } from "@testing-library/react";

import RapporteringsPeriodeSide, {
  loader as rapporteringsperiodeLoader,
} from "~/routes/periode.$rapporteringsperiodeId";

interface IRemixStub {
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
}: IRemixStub) => {
  const RemixStub = createRemixStub([
    {
      path: "/periode/:rapporteringsperiodeId",
      Component: RapporteringsPeriodeSide,
      loader: rapporteringsperiodeLoader,

      id: "routes/periode.$rapporteringsperiodeId",
      children: [
        {
          path,
          Component,
          loader,
          action,
        },
      ],
    },
  ]);

  TLRender(<RemixStub initialEntries={[initialEntry]} />);
};
