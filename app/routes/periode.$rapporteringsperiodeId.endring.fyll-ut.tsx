import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { slettAlleAktiviteter, validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { erPeriodeneLike } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";
import { KanIkkeSendes } from "~/components/KanIkkeSendes/KanIkkeSendes";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return slettAlleAktiviteter(request, periodeId, formdata);
    }

    case "lagre": {
      return validerOgLagreAktivitet(request, periodeId, formdata);
    }

    default: {
      return {
        status: "error",
        error: {
          statusCode: 500,
          statusText: "Det skjedde en feil.",
        },
      };
    }
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;
  const periode = await hentPeriode(request, periodeId, false);
  const originalPeriode = await hentPeriode(request, periode.originalId as string, true);

  return json({ periode, originalPeriode });
}

export default function RapporteringsPeriodeFyllUtSide() {
  const { periode, originalPeriode } = useLoaderData<typeof loader>();

  const { getAppText, getRichText, getLink } = useSanity();
  const actionData = useActionData<typeof action>();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgteAktiviteter, setValgteAktiviteter] = useState<AktivitetType[]>([]);
  const [modalAapen, setModalAapen] = useState(false);

  useEffect(() => {
    if (actionData?.status === "success") {
      lukkModal();
    }
  }, [actionData]);

  useEffect(() => {
    if (valgtDato) {
      const defaultValgteAktiviteter: AktivitetType[] | undefined = periode.dager
        .find((dag) => dag.dato === valgtDato)
        ?.aktiviteter.map((aktivitet) => aktivitet.type);

      setValgteAktiviteter(defaultValgteAktiviteter || []);
    }
  }, [valgtDato, periode.dager]);

  function aapneModal(dato: string) {
    if (periode.status === "TilUtfylling" || periode.status === "Endret") {
      setValgtDato(dato);
      setModalAapen(true);
    }
  }

  function lukkModal() {
    setValgteAktiviteter([]);
    setValgtDato(undefined);
    setModalAapen(false);
  }

  const periodeneErLike = erPeriodeneLike(periode, originalPeriode);

  const nextLink = periodeneErLike
    ? `/periode/${periode.id}/endring/tom`
    : `/periode/${periode.id}/endring/begrunnelse`;

  return (
    <>
      <KanIkkeSendes periode={periode} />

      <Heading tabIndex={-1} size="medium" level="2" className="vo-fokus">
        {getAppText("rapportering-periode-endre-tittel")}
      </Heading>
      <PortableText value={getRichText("rapportering-periode-endre-beskrivelse")} />

      <Kalender periode={periode} aapneModal={aapneModal} />
      <AktivitetModal
        periode={periode}
        valgtDato={valgtDato}
        valgteAktiviteter={valgteAktiviteter}
        setValgteAktiviteter={setValgteAktiviteter}
        modalAapen={modalAapen}
        lukkModal={lukkModal}
      />
      <div className="registert-meldeperiode-container">
        <AktivitetOppsummering periode={periode} />
      </div>

      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={`/innsendt`}
          variant="secondary"
          className="py-4 px-8"
          icon={<ArrowLeftIcon aria-hidden />}
          iconPosition="left"
        >
          {getLink("rapportering-knapp-tilbake").linkText}
        </RemixLink>

        <RemixLink
          as="Button"
          to={nextLink}
          variant="primary"
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          className="py-4 px-8"
        >
          {getAppText("rapportering-knapp-neste")}
        </RemixLink>
      </div>
      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={getLink("rapportering-endre-avbryt").linkUrl}
          variant="tertiary"
          className="px-8"
        >
          {getLink("rapportering-endre-avbryt").linkText}
        </RemixLink>
      </div>

      <LagretAutomatisk />
    </>
  );
}
