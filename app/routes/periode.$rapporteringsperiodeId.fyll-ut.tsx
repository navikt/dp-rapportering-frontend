import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading, ReadMore } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { type AktivitetType } from "~/models/aktivitet.server";
import { slettAlleAktiviteter, validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
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
  const [_, setSearchParams] = useSearchParams();

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
    setSearchParams({ utfylling: "true" });

    if (periode.status === "TilUtfylling") {
      setValgtDato(dato);
      setModalAapen(true);
    }
  }

  function lukkModal() {
    setValgteAktiviteter([]);
    setValgtDato(undefined);
    setModalAapen(false);
  }

  return (
    <>
      <div className="rapportering-container">
        <Heading tabIndex={-1} size={"large"} level={"2"} className="vo-fokus">
          {getAppText("rapportering-periode-fyll-ut-tittel")}
        </Heading>
        <BodyLong className="tekst-subtil" spacing>
          {getAppText("rapportering-periode-fyll-ut-beskrivelse")}
          <ReadMore header="Les mer om hva som skal rapporteres">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias pariatur, explicabo
            quisquam harum aspernatur ex, officiis doloremque atque tempora tenetur distinctio quasi
            doloribus voluptatum aliquid ipsam! In dolore consectetur quae iusto porro ipsum culpa
            nemo velit error eos assumenda illo omnis, amet, excepturi sit qui, ab quia voluptates
            cum fugit.
          </ReadMore>
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
          Du kan sende denne rapporteringen fra 6. juni, og senest 13. juni for å unngå trekk i
          utbetalingen.
        </BodyLong>

        <div className="navigasjon-container-to-knapper my-4">
          <RemixLink
            as="Button"
            to={`/`}
            variant="secondary"
            iconPosition="left"
            icon={<ArrowLeftIcon aria-hidden />}
            className="py-4 px-8"
          >
            {getLink("rapportering-periode-send-inn-tilbake").linkText}
          </RemixLink>

          <RemixLink
            as="Button"
            to={`/periode/${periode.id}/arbeidssoker`}
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
