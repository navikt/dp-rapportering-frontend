import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { type AktivitetType } from "~/models/aktivitet.server";
import { slettAlleAktiviteter, validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { formaterDato } from "~/utils/dato.utils";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { LesMer } from "~/components/LesMer";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return await slettAlleAktiviteter(request, periodeId, formdata);
    }

    case "lagre": {
      return await validerOgLagreAktivitet(request, periodeId, formdata);
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

export default function RapporteringsPeriodeFyllUtSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const { getAppText, getLink } = useSanity();
  const actionData = useActionData<typeof action>();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgteAktiviteter, setValgteAktiviteter] = useState<AktivitetType[]>([]);
  const [modalAapen, setModalAapen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

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
    setSearchParams((prev) => {
      if (!prev.has("utfylling")) {
        prev.append("utfylling", "true");
      }
      return prev;
    });

    if (periode.status === "TilUtfylling" || periode.status === "Korrigert") {
      setValgtDato(dato);
      setModalAapen(true);
    }
  }

  function lukkModal() {
    setValgteAktiviteter([]);
    setValgtDato(undefined);
    setModalAapen(false);
  }

  const tidligstInnsendingDato = formaterDato(new Date(periode.kanSendesFra));
  const senestInnsendingDato = formaterDato(addDays(new Date(periode.periode.fraOgMed), 21));

  const harIngenAktiviteter = periode.dager.every((dag) => dag.aktiviteter.length === 0);
  const nextLink = harIngenAktiviteter
    ? `/periode/${periode.id}/tom`
    : `/periode/${periode.id}/arbeidssoker`;
  return (
    <>
      <div className="rapportering-container">
        <Heading tabIndex={-1} size={"large"} level={"2"} className="vo-fokus">
          {getAppText("rapportering-periode-fyll-ut-tittel")}
        </Heading>
        <BodyLong className="tekst-subtil" spacing>
          {getAppText("rapportering-periode-fyll-ut-beskrivelse")}
          <LesMer />
        </BodyLong>

        <Kalender rapporteringsperiode={periode} aapneModal={aapneModal} />
        <AktivitetModal
          rapporteringsperiode={periode}
          valgtDato={valgtDato}
          valgteAktiviteter={valgteAktiviteter}
          setValgteAktiviteter={setValgteAktiviteter}
          modalAapen={modalAapen}
          lukkModal={lukkModal}
        />
        <div className="registert-meldeperiode-container">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
        <BodyLong className="my-8">
          {`${getAppText("rapportering-periode-innsending-og-frist-dato")
            .replace("{date1}", tidligstInnsendingDato)
            .replace("{date2}", senestInnsendingDato)}`}
        </BodyLong>

        <div className="navigasjon-container-to-knapper my-4">
          <RemixLink
            as="Button"
            to={`/`}
            variant="secondary"
            iconPosition="left"
            icon={<ArrowLeftIcon aria-hidden />}
            className="py-4 px-8"
            disabled={searchParams.has("korrigering")}
          >
            {getLink("rapportering-periode-send-inn-tilbake").linkText}
          </RemixLink>

          <RemixLink
            as="Button"
            to={nextLink}
            variant="primary"
            iconPosition="right"
            icon={<ArrowRightIcon aria-hidden />}
            className="py-4 px-8"
          >
            {getAppText("rapportering-knapp-neste")}
          </RemixLink>
        </div>

        <LagretAutomatisk />
      </div>
    </>
  );
}
