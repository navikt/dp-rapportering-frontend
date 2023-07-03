import { type SessionWithOboProvider } from "@navikt/dp-auth/index/";
import { Accordion, Alert, Button, Heading } from "@navikt/ds-react";
import { type ActionArgs, json, type LoaderArgs } from "@remix-run/node";
import { Outlet, type ShouldRevalidateFunction, useLoaderData, Form } from "@remix-run/react";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import {
  type IRapporteringsperiode,
  hentGjeldendePeriode,
  hentAllePerioder,
  startKorrigering,
  hentEnPeriode,
} from "~/models/rapporteringsperiode.server";
import { getSession } from "~/utils/auth.utils.server";
import { PeriodeHeaderDetaljer } from "~/components/PeriodeHeaderDetaljer";
import { DevelopmentKontainer } from "~/components/development-kontainer/DevelopmentKontainer";

import styles from "./rapportering.module.css";
import invariant from "tiny-invariant";
import { Kalender } from "~/components/kalender/Kalender";

export interface IRapporteringLoader {
  rapporteringsperiode: IRapporteringsperiode;
  allePerioder: IRapporteringsperiode[];
  session: SessionWithOboProvider;
  error: IError | null;
}

interface IError {
  status: number;
  statusText: string;
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  defaultShouldRevalidate,
}) => {
  if (formAction === "/rapportering/send-inn") {
    return false;
  }

  return defaultShouldRevalidate;
};

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "start-korrigering": {
      const periodeId = formdata.get("periode-id") as string;

      const korrigeringResponse = await startKorrigering(periodeId, request);

      if (korrigeringResponse.ok) {
        return {};
      } else {
        json({ error: "" });
      }
    }
  }
}

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request);

  // Denne gjelder bare lokalt, DEV og PROD håndteres av wonderwall
  if (session.expiresIn === 0) {
    return json({ rapporteringsperiode: null, allePerioder: null, session, error: null });
  }

  invariant(params.periodeId, "RapporteringsID må være satt");

  const response = await hentEnPeriode(params.periodeId, request);
  if (response.ok) {
    const rapporteringsperiode = await response.json();
    return json({ rapporteringsperiode, session, error: null });
  } else {
    return json({ rapporteringsperiode: null, session, error: true });
  }
}

export default function Endre() {
  const { rapporteringsperiode, session, error } = useLoaderData<typeof loader>();
  const harSessjon = session?.expiresIn > 0;

  function aapneModal(dato: string) {
    console.log("Noe skal skje :)");
  }

  return (
    <>
      <Kalender rapporteringsperiode={rapporteringsperiode} aapneModal={aapneModal} />
    </>
  );
}

interface IRapporteringError {
  error: IError;
}

function RapporteringError({ error }: IRapporteringError) {
  if (error.status === 404) {
    return (
      <main>
        <Alert variant="warning">Fant ikke rapporteringsperioder</Alert>
      </main>
    );
  }

  return (
    <main>
      <Alert variant="warning">Teknisk feil, prøv igjen senere</Alert>
    </main>
  );
}
