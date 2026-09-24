import {
  CheckmarkCircleIcon,
  ExclamationmarkTriangleIcon,
  XMarkOctagonIcon,
} from "@navikt/aksel-icons";
import { InfoCard } from "@navikt/ds-react";
import { JSX } from "react";
import { useRouteLoaderData } from "react-router";

import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import type { MeldekortBrukerflateApiResponse } from "~/sanity/queries/meldekort-brukerflate";
import { kanSendes } from "~/utils/periode.utils";
import { sanityTekst } from "~/utils/sanity.utils";

interface IProps {
  periode: IRapporteringsperiode;
  endring?: boolean;
  visMeldekortetErIkkeSendtInnBeskjed?: boolean;
  visSendtInnBeskjed?: boolean;
}

export type InnsendingsStatus =
  | "ikkeSendtInnEnda"
  | "endringerIkkeSendtInnEnda"
  | "kanIkkeSendesInn"
  | "sendtInn"
  | "sendtInnEndringer";

export function hentInnsendingsStatusInnhold(
  status: InnsendingsStatus,
  sendestatusBeskjed:
    MeldekortBrukerflateApiResponse["meldekortInnsendingsstatusBeskjed"] | undefined,
): { tekst: string | null | undefined; felt: string } {
  return {
    tekst: sendestatusBeskjed?.[status],
    felt: `meldekortInnsendingsstatusBeskjed.${status}`,
  };
}

export function InnsendingsStatusBeskjed({
  periode,
  endring,
  visMeldekortetErIkkeSendtInnBeskjed = false,
  visSendtInnBeskjed = false,
}: IProps): JSX.Element | undefined {
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const sendestatusBeskjed = rootData?.sanityTekst?.meldekortInnsendingsstatusBeskjed;
  const meldekortKanSendes = kanSendes(periode);

  if (visSendtInnBeskjed) {
    const status = endring ? "sendtInnEndringer" : "sendtInn";
    const { tekst, felt } = hentInnsendingsStatusInnhold(status, sendestatusBeskjed);

    return (
      <InfoCard data-color="success" role="status">
        <InfoCard.Message icon={<CheckmarkCircleIcon aria-hidden />}>
          {sanityTekst(tekst, felt)}
        </InfoCard.Message>
      </InfoCard>
    );
  }

  if (meldekortKanSendes && !visMeldekortetErIkkeSendtInnBeskjed) {
    return undefined;
  }

  if (meldekortKanSendes) {
    const status = endring ? "endringerIkkeSendtInnEnda" : "ikkeSendtInnEnda";
    const { tekst, felt } = hentInnsendingsStatusInnhold(status, sendestatusBeskjed);

    return (
      <InfoCard data-color="warning">
        <InfoCard.Message icon={<ExclamationmarkTriangleIcon aria-hidden />}>
          {sanityTekst(tekst, felt)}
        </InfoCard.Message>
      </InfoCard>
    );
  }

  const { tekst, felt } = hentInnsendingsStatusInnhold("kanIkkeSendesInn", sendestatusBeskjed);

  return (
    <InfoCard data-color="danger" role="alert">
      <InfoCard.Message icon={<XMarkOctagonIcon aria-hidden />}>
        {sanityTekst(tekst, felt)}
      </InfoCard.Message>
    </InfoCard>
  );
}
