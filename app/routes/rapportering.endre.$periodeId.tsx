import { type SessionWithOboProvider } from "@navikt/dp-auth/index/";
import { Modal } from "@navikt/ds-react";
import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { useActionData, useLoaderData, type ShouldRevalidateFunction } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import {
  godkjennPeriode,
  hentEnPeriode,
  type IRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { lagreAktivitetAction, slettAktivitetAction } from "~/utils/aktivitet.action.server";
import { getSession } from "~/utils/auth.utils.server";

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
    case "slette": {
      return await slettAktivitetAction(formdata, request);
    }

    case "lagre": {
      return await lagreAktivitetAction(formdata, request);
    }

    case "godkjenne": {
      const periodeId = formdata.get("periode-id") as string;

      return await godkjennPeriode(periodeId, request);
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
  const { rapporteringsperiode } = useLoaderData<typeof loader>();
  const actionData = useActionData();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [modalAapen, setModalAapen] = useState(false);

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  useEffect(() => {
    if (actionData?.lagret) {
      lukkModal();
    }
  }, [actionData]);

  function aapneModal(dato: string) {
    setValgtDato(dato);
    setModalAapen(true);
  }

  function lukkModal() {
    setValgtDato(undefined);
    setModalAapen(false);
  }

  return (
    <>
      <Kalender rapporteringsperiode={rapporteringsperiode} aapneModal={aapneModal} />

      <AktivitetModal
        rapporteringsperiode={rapporteringsperiode}
        valgtDato={valgtDato}
        modalAapen={modalAapen}
        lukkModal={lukkModal}
      />

      <AktivitetOppsummering rapporteringsperiode={rapporteringsperiode} />
    </>
  );
}
