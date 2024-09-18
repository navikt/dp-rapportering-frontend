// import { render } from "@testing-library/react";
// import { describe, expect, it, vi } from "vitest";
// import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
// import { PeriodeDetaljer } from "~/routes/denne-kan-slettes-index/PeriodeDetaljer";

// vi.mock("~/hooks/useSanity", () => ({
//   useSanity: () => ({
//     getAppText: (key: string) => key,
//     getRichText: (key: string) => key,
//   }),
// }));

// vi.mock("@remix-run/react", () => ({
//   useFetcher: vi.fn(),
// }));

// vi.mock("~/utils/periode.utils", () => ({
//   hentForstePeriodeTekst: () => "Uke 1 - 2 (01.01.2024 - 14.01.2024)",
// }));

// describe("PeriodeDetaljer Komponent", () => {
//   const rapporteringsperioder = [
//     { id: "1" } as IRapporteringsperiode,
//     { id: "2" } as IRapporteringsperiode,
//   ];

//   it("viser riktig melding ved ingen rapporteringsperioder", () => {
//     const { getByText } = render(
//       <PeriodeDetaljer rapporteringstype={undefined} rapporteringsperioder={[]} />
//     );
//     expect(getByText("rapportering-ingen-rapporter-å-fylle-ut")).toBeInTheDocument();
//   });

//   it("viser info-alert med riktig tittel og innledning ved flere perioder", () => {
//     const rapporteringsperioder = [{ id: "1" }, { id: "2" }] as IRapporteringsperiode[];
//     const { getByText } = render(
//       <PeriodeDetaljer
//         rapporteringstype={undefined}
//         rapporteringsperioder={rapporteringsperioder}
//       />
//     );

//     expect(getByText("rapportering-flere-perioder-tittel")).toBeInTheDocument();
//     expect(getByText("rapportering-flere-perioder-innledning")).toBeInTheDocument();
//   });

//   it("ikke viser info-alert med riktig tittel og innledning ved en periode", () => {
//     const rapporteringsperioder = [{ id: "1" }] as IRapporteringsperiode[];
//     const { queryByText } = render(
//       <PeriodeDetaljer
//         rapporteringstype={undefined}
//         rapporteringsperioder={rapporteringsperioder}
//       />
//     );

//     expect(queryByText("rapportering-flere-perioder-tittel")).not.toBeInTheDocument();
//     expect(queryByText("rapportering-flere-perioder-innledning")).not.toBeInTheDocument();
//   });

//   it("viser korrekt tittel for én periode", () => {
//     const { getByText } = render(
//       <PeriodeDetaljer
//         rapporteringstype={undefined}
//         rapporteringsperioder={[rapporteringsperioder[0]]}
//       />
//     );

//     expect(getByText("rapportering-rapporter-navarende-tittel")).toBeInTheDocument();
//   });
// });
