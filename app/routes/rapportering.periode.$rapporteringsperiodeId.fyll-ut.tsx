import { InformationSquareIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { useActionData, useRouteLoaderData } from "@remix-run/react";
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
import type { TAktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { lagreAktivitetAction, slettAktivitetAction } from "~/utils/aktivitet.action.server";

export async function action({ request, params }: ActionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return await slettAktivitetAction(formdata, request, periodeId);
    }

    case "lagre": {
      return await lagreAktivitetAction(formdata, request, periodeId);
    }
  }
}

export default function RapporteringFyllut() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;
  const actionData = useActionData();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgtAktivitet, setValgtAktivitet] = useState<TAktivitetType | string>("");
  const [modalAapen, setModalAapen] = useState(false);

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  useEffect(() => {
    if (actionData?.lagret) {
      lukkModal();
    }
  }, [actionData]);

  function aapneModal(dato: string) {
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

  const tidligstRapporteringsDato = periode.dager[12].dato;
  // Idag er fra og med tidligste rapporteringsdato
  const kanSendeRapportering = !isBefore(new Date(), new Date(tidligstRapporteringsDato));

  return (
    <>
      <div className="rapportering-kontainer">
        <Heading
          ref={sidelastFokusRef}
          tabIndex={-1}
          size={"large"}
          level={"2"}
          spacing
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
          <FormattertDato dato={tidligstRapporteringsDato} ukedag />
        </Alert>

        <div className="navigasjon-kontainer">
          {kanSendeRapportering && (
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
