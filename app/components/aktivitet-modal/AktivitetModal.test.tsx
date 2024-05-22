// @vitest-environment jsdom

import { json } from "@remix-run/node";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import type { AktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { gjeldendePeriodeResponse } from "../../../mocks/responses/gjeldendePeriodeResponse";
import { TestContainer } from "../../../tests/helpers/TestContainer";
import { AktivitetModal } from "./AktivitetModal";
import type { INetworkResponse } from "~/utils/types";

describe("AktivitetModal", () => {
  const dagUtenAktivitet: IRapporteringsperiodeDag = {
    dagIndex: 0,
    dato: "2023-06-19",
    muligeAktiviteter: ["Arbeid", "Ferie"],
    aktiviteter: [],
  };

  const dagMedAktivitet: IRapporteringsperiodeDag = {
    dagIndex: 1,
    dato: "2023-06-20",
    muligeAktiviteter: [],
    aktiviteter: [
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9a",
        type: "Ferie",
        timer: "PT8H0M",
        dato: "2023-06-20",
      },
    ],
  };

  const rapporteringsperiode = { ...gjeldendePeriodeResponse };
  rapporteringsperiode.dager = [dagUtenAktivitet, dagMedAktivitet];

  describe("Lagre aktivitet", () => {
    const utvalgtAktivitet = dagUtenAktivitet.muligeAktiviteter[1];

    test("burde vise mulige aktiviteter", async () => {
      const TestComponent = () => {
        const [valgtAktivitet, setValgtAktivitet] = useState<AktivitetType | string>("");

        return (
          <div id="dp-saksbehandling-frontend">
            <AktivitetModal
              rapporteringsperiode={rapporteringsperiode}
              valgtDato={dagUtenAktivitet.dato}
              valgtAktivitet={valgtAktivitet}
              setValgtAktivitet={setValgtAktivitet}
              modalAapen={true}
              lukkModal={() => {}}
            />
          </div>
        );
      };

      render(
        <TestContainer>
          <TestComponent />
        </TestContainer>
      );

      const arbeidLabel = await screen.findByTestId(
        `aktivitet-radio-${dagUtenAktivitet.muligeAktiviteter[0]}`
      );

      const ferieLabel = await screen.findByTestId(
        `aktivitet-radio-${dagUtenAktivitet.muligeAktiviteter[1]}`
      );

      expect(arbeidLabel).toBeInTheDocument();
      expect(ferieLabel).toBeInTheDocument();
    });

    test("burde kunne velge og lagre en aktivitet", async () => {
      let dato, aktivitetstype, submit;

      const actionFn = vi.fn(async ({ request }) => {
        const formData = await request.formData();
        dato = formData.get("dato") as string;
        submit = formData.get("submit") as string;
        aktivitetstype = formData.get("type") as string;

        return json({ status: "success" });
      });

      const TestComponent = () => {
        const [valgtAktivitet, setValgtAktivitet] = useState<AktivitetType | string>("");

        return (
          <div id="dp-saksbehandling-frontend">
            <AktivitetModal
              rapporteringsperiode={rapporteringsperiode}
              valgtDato={dagUtenAktivitet.dato}
              valgtAktivitet={valgtAktivitet}
              setValgtAktivitet={setValgtAktivitet}
              modalAapen={true}
              lukkModal={() => {}}
            />
          </div>
        );
      };

      render(
        <TestContainer action={actionFn}>
          <TestComponent />
        </TestContainer>
      );

      const valgtAktivitet = await screen.findByTestId(`aktivitet-radio-${utvalgtAktivitet}`);
      const lagreKnapp = await screen.findByRole("button", { name: "Lagre" });

      await userEvent.click(valgtAktivitet);
      await userEvent.click(lagreKnapp);

      expect(actionFn).toBeCalledTimes(1);

      expect(dato).toBe(dagUtenAktivitet.dato);
      expect(aktivitetstype).toBe(utvalgtAktivitet);
      expect(submit).toBe("lagre");
    });

    test("burde vise feilmelding hvis det er feil i backenden når vi lagrer aktivitet", async () => {
      const actionFn = vi.fn(async () => {
        const actionResponse: INetworkResponse = {
          status: "error",
          error: {
            statusCode: 500,
            statusText: "Det har skjedd en feil ved lagring av aktivitet, prøv igjen.",
          },
        };

        return json(actionResponse);
      });

      const TestComponent = () => {
        const [valgtAktivitet, setValgtAktivitet] = useState<AktivitetType | string>("");

        return (
          <div id="dp-saksbehandling-frontend">
            <AktivitetModal
              rapporteringsperiode={rapporteringsperiode}
              valgtDato={dagUtenAktivitet.dato}
              valgtAktivitet={valgtAktivitet}
              setValgtAktivitet={setValgtAktivitet}
              modalAapen={true}
              lukkModal={() => {}}
            />
          </div>
        );
      };

      render(
        <TestContainer action={actionFn}>
          <TestComponent />
        </TestContainer>
      );

      const valgtAktivitet = await screen.findByTestId(`aktivitet-radio-${utvalgtAktivitet}`);
      const lagreKnapp = await screen.findByRole("button", { name: "Lagre" });

      await userEvent.click(valgtAktivitet);
      await userEvent.click(lagreKnapp);

      expect(actionFn).toBeCalledTimes(1);
      expect(
        await screen.findByText("Det har skjedd en feil ved lagring av aktivitet, prøv igjen.")
      ).toBeInTheDocument();
    });

    describe("Arbeid", () => {
      const aktivitetArbeid = "Arbeid";

      test("burde kunne velge og lagre timer når man velger Arbeid", async () => {
        let dato, aktivitetstype, timer, submit;
        const actionResponse: INetworkResponse = { status: "success" };

        const actionFn = vi.fn(async ({ request }) => {
          const formData = await request.formData();
          dato = formData.get("dato") as string;
          timer = formData.get("timer") as string;
          submit = formData.get("submit") as string;
          aktivitetstype = formData.get("type") as string;

          return json(actionResponse);
        });

        const TestComponent = () => {
          const [valgtAktivitet, setValgtAktivitet] = useState<AktivitetType | string>("");

          return (
            <div id="dp-saksbehandling-frontend">
              <AktivitetModal
                rapporteringsperiode={rapporteringsperiode}
                valgtDato={dagUtenAktivitet.dato}
                valgtAktivitet={valgtAktivitet}
                setValgtAktivitet={setValgtAktivitet}
                modalAapen={true}
                lukkModal={() => {}}
              />
            </div>
          );
        };

        render(
          <TestContainer action={actionFn}>
            <TestComponent />
          </TestContainer>
        );

        const valgtAktivitet = await screen.findByTestId(`aktivitet-radio-${aktivitetArbeid}`);
        const lagreKnapp = await screen.findByRole("button", { name: "Lagre" });

        await userEvent.click(valgtAktivitet);
        const antallTimer = await screen.findByLabelText("Antall timer:");

        await userEvent.type(antallTimer, "2,5");
        await userEvent.click(lagreKnapp);

        expect(actionFn).toBeCalledTimes(1);

        expect(dato).toBe(dagUtenAktivitet.dato);
        expect(aktivitetstype).toBe(aktivitetArbeid);
        expect(timer).toBe("2,5");
        expect(submit).toBe("lagre");
      });

      test("burde vise feilmelding hvis bruker prøver å lagre arbeid uten å skrive inn timer", async () => {
        const actionResponse: INetworkResponse = { status: "success" };

        const actionFn = vi.fn(async () => {
          return json(actionResponse);
        });

        const TestComponent = () => {
          const [valgtAktivitet, setValgtAktivitet] = useState<AktivitetType | string>("");

          return (
            <div id="dp-saksbehandling-frontend">
              <AktivitetModal
                rapporteringsperiode={rapporteringsperiode}
                valgtDato={dagUtenAktivitet.dato}
                valgtAktivitet={valgtAktivitet}
                setValgtAktivitet={setValgtAktivitet}
                modalAapen={true}
                lukkModal={() => {}}
              />
            </div>
          );
        };

        render(
          <TestContainer action={actionFn}>
            <TestComponent />
          </TestContainer>
        );

        const valgtAktivitet = await screen.findByTestId(`aktivitet-radio-${aktivitetArbeid}`);
        const lagreKnapp = await screen.findByRole("button", { name: "Lagre" });

        await userEvent.click(valgtAktivitet);
        const antallTimer = await screen.findByLabelText("Antall timer:");

        await userEvent.click(lagreKnapp);

        expect(actionFn).toBeCalledTimes(0);
        expect(antallTimer.getAttribute("aria-invalid")).toBe("true");
        expect(
          await screen.findByText("Du må skrive et tall mellom 0,5 og 24 timer")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Slett aktivitet", () => {
    test("burde vise allerede valgt aktivitet", async () => {
      const TestComponent = () => {
        const [valgtAktivitet, setValgtAktivitet] = useState<AktivitetType | string>("");

        return (
          <div id="dp-saksbehandling-frontend">
            <AktivitetModal
              rapporteringsperiode={rapporteringsperiode}
              valgtDato={dagMedAktivitet.dato}
              valgtAktivitet={valgtAktivitet}
              setValgtAktivitet={setValgtAktivitet}
              modalAapen={true}
              lukkModal={() => {}}
            />
          </div>
        );
      };

      render(
        <TestContainer>
          <TestComponent />
        </TestContainer>
      );

      const valgtAktivitet = await screen.findByText(dagMedAktivitet.aktiviteter[0].type);

      expect(valgtAktivitet).toBeInTheDocument();
    });

    test("burde kunne fjerne en aktivitet", async () => {
      let aktivitetId, submit;
      const actionResponse: INetworkResponse = { status: "success" };

      const actionFn = vi.fn(async ({ request }) => {
        const formData = await request.formData();
        aktivitetId = formData.get("aktivitetId") as string;
        submit = formData.get("submit") as string;

        return json(actionResponse);
      });

      const TestComponent = () => {
        const [valgtAktivitet, setValgtAktivitet] = useState<AktivitetType | string>("");

        return (
          <div id="dp-saksbehandling-frontend">
            <AktivitetModal
              rapporteringsperiode={rapporteringsperiode}
              valgtDato={dagMedAktivitet.dato}
              valgtAktivitet={valgtAktivitet}
              setValgtAktivitet={setValgtAktivitet}
              modalAapen={true}
              lukkModal={() => {}}
            />
          </div>
        );
      };

      render(
        <TestContainer action={actionFn}>
          <TestComponent />
        </TestContainer>
      );

      const valgtAktivitet = await screen.findByText(dagMedAktivitet.aktiviteter[0].type);

      expect(valgtAktivitet).toBeInTheDocument();

      const slettKnapp = await screen.findByRole("button", { name: "Fjern registrering" });
      await userEvent.click(slettKnapp);

      expect(actionFn).toBeCalledTimes(1);
      expect(aktivitetId).toBe(dagMedAktivitet.aktiviteter[0].id);
      expect(submit).toBe("slette");
    });
  });
});
