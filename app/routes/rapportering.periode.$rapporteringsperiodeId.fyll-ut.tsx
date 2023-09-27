import { InformationSquareIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import { isBefore } from "date-fns";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { FormattertDato } from "~/components/FormattertDato";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { sletteAktivitet, type TAktivitetType } from "~/models/aktivitet.server";
import { validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const onBehalfOfToken = await getRapporteringOboToken(request);
  const formdata = await request.formData();
  const aktivitetId = formdata.get("aktivitetId") as string;
  const aktivitetsType = formdata.get("type") as TAktivitetType;
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return await sletteAktivitet(onBehalfOfToken, periodeId, aktivitetId);
    }

    case "lagre": {
      return await validerOgLagreAktivitet(onBehalfOfToken, aktivitetsType, periodeId, formdata);
    }
  }
}

export default function RapporteringFyllut() {
  const { periode } = useTypedRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  );
  const actionData = useActionData<typeof action>();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgtAktivitet, setValgtAktivitet] = useState<TAktivitetType | string>("");
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

  function aapneModal(dato: string) {
    setSearchParams({ utfylling: "true" });

    if (periode.status === "TilUtfylling") {
      setValgtDato(dato);
      setModalAapen(true);
    }
  }

  function lukkModal() {
    setValgtAktivitet("");
    setValgtDato(undefined);
    setModalAapen(false);
  }

  const kanSendePeriodeTilNav = !isBefore(new Date(), new Date(periode.kanGodkjennesFra));

  return (
    <>
      <div className="rapportering-kontainer">
        <Heading
          ref={sidelastFokusRef}
          tabIndex={-1}
          size={"large"}
          level={"2"}
          className="vo-fokus"
        >
          Fyll ut rapporteringen
        </Heading>
        <BodyLong className="tekst-subtil" spacing>
          Klikk på dagen du skal rapportere for. Du kan velge mellom jobb, sykdom, fravær og ferie.
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
        <div className="registert-meldeperiode-kontainer">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>

        <Alert variant="info" className="my-10">
          Du kan sende rapporteringen til NAV tidligst{" "}
          <FormattertDato dato={periode.kanGodkjennesFra} ukedag />
        </Alert>

        <div className="navigasjon-kontainer">
          {kanSendePeriodeTilNav && (
            <RemixLink as="Button" to={`/rapportering/periode/${periode.id}/send-inn`}>
              Send rapportering
            </RemixLink>
          )}

          <RemixLink as="Button" to="/rapportering" variant="secondary">
            Lagre og fortsett senere
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
