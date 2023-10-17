import { InformationSquareIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { sletteAktivitet, type AktivitetType } from "~/models/aktivitet.server";
import { validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import type { INetworkResponse } from "~/utils/types";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const onBehalfOfToken = await getRapporteringOboToken(request);
  const formdata = await request.formData();
  const aktivitetsType = formdata.get("type") as AktivitetType;
  const aktivitetId = formdata.get("aktivitetId") as string;
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return await sletteAktivitet(onBehalfOfToken, periodeId, aktivitetId);
    }

    case "lagre": {
      return await validerOgLagreAktivitet(onBehalfOfToken, aktivitetsType, periodeId, formdata);
    }

    default: {
      return {
        status: "error",
        error: {
          statusCode: 500,
          statusText: "Noe gikk gal!",
        },
      };
    }
  }
}

export default function KorrigeringFyllUtSide() {
  const { periode } = useTypedRouteLoaderData(
    "routes/rapportering.korriger.$rapporteringsperiodeId"
  );
  const actionData = useActionData<INetworkResponse>();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgtAktivitet, setValgtAktivitet] = useState<AktivitetType | string>("");
  const [modalAapen, setModalAapen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    // Vi setter fokus på headeren når brukeren kommer til denne siden fra en annen side.
    // Ellers følger vi browser default fokus oppførsel
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

  function aapneModal(dato: string) {
    setSearchParams({ utfylling: "true" });

    if (periode.status === "TilUtfylling") {
      setValgtDato(dato);
      setModalAapen(true);
      setSearchParams({ dato });
    }
  }

  function lukkModal() {
    setValgtAktivitet("");
    setValgtDato(undefined);
    setModalAapen(false);
  }

  return (
    <>
      <div className="rapportering-container">
        <Heading
          size={"medium"}
          level={"2"}
          ref={sidelastFokusRef}
          tabIndex={-1}
          className="vo-fokus"
        >
          Korrigering
        </Heading>
        <BodyLong spacing>
          Endringer i rapporteringen vil føre til at NAV beregner perioden på nytt. Du vil få
          etterbetalt hvis du har fått for lite utbetalt. Har du fått utbetalt for mye vil NAV
          vurdere å kreve dette tilbake.
        </BodyLong>
        <Kalender rapporteringsperiode={periode} aapneModal={aapneModal} />
        <AktivitetModal
          rapporteringsperiode={periode}
          valgtDato={valgtDato}
          valgtAktivitet={valgtAktivitet}
          setValgtAktivitet={setValgtAktivitet}
          modalAapen={modalAapen}
          lukkModal={lukkModal}
        />
        <div className="registert-meldeperiode-container">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
        <div className="navigasjon-container">
          <RemixLink as="Button" to="/rapportering/innsendt" variant={"secondary"}>
            Avbryt
          </RemixLink>
          <RemixLink as="Button" to={`/rapportering/korriger/${periode.id}/send-inn`}>
            Lagre og send korrigering
          </RemixLink>
        </div>
        <div className="hva-skal-jeg-rapportere-nav-link">
          <RemixLink
            as="Link"
            to="/rapportering/info"
            iconPosition="left"
            icon={<InformationSquareIcon title="a11y-title" fontSize={24} aria-hidden />}
          >
            Hva skal jeg rapportere til NAV?
          </RemixLink>
        </div>
      </div>
    </>
  );
}
