import { InformationSquareIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { type AktivitetType, sletteAktivitet } from "~/models/aktivitet.server";
import { validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import { useSanity } from "~/hooks/useSanity";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const onBehalfOfToken = await getRapporteringOboToken(request);
  const formdata = await request.formData();
  const aktivitetId = formdata.get("aktivitetId") as string;
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return await sletteAktivitet(onBehalfOfToken, periodeId, aktivitetId);
    }

    case "lagre": {
      return await validerOgLagreAktivitet(onBehalfOfToken, periodeId, formdata);
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
  const [searchParams, setSearchParams] = useSearchParams();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    // Vi setter fokus på headeren når brukeren kommer til denne siden fra en annen side.
    // Ellers følger vi browser default fokus oppførsel.
    if (!searchParams.get("utfylling")) {
      setFokus(sidelastFokusRef);
    }

    scrollToView(sidelastFokusRef);
  }, [setFokus, scrollToView, searchParams]);

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
        <Heading
          ref={sidelastFokusRef}
          tabIndex={-1}
          size={"large"}
          level={"2"}
          className="vo-fokus"
        >
          {getAppText("rapportering-periode-fyll-ut-tittel")}
        </Heading>
        <BodyLong className="tekst-subtil" spacing>
          {getAppText("rapportering-periode-fyll-ut-beskrivelse")}
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
        <div className="navigasjon-container">
          <RemixLink as="Button" to={`/periode/${periode.id}/send-inn`}>
            {getLink("rapportering-korriger-fyll-ut-send-rapportering").linkText}
          </RemixLink>
        </div>
        <div className="hva-skal-jeg-rapportere-nav-link">
          <RemixLink
            as="Link"
            to={getLink("rapportering-fyll-ut-info").linkUrl}
            iconPosition="left"
            icon={<InformationSquareIcon title="a11y-title" fontSize={24} aria-hidden />}
          >
            {getLink("rapportering-fyll-ut-info").linkText}
          </RemixLink>
        </div>
      </div>
    </>
  );
}
