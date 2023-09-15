import { InformationSquareIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { useActionData, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useSetFokus } from "~/hooks/useSetFokus";
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
    "routes/rapportering.korriger.$rapporteringsperiodeId"
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

  return (
    <>
      <div className="rapportering-kontainer">
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
        <div className="registert-meldeperiode-kontainer">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
        <div className="navigasjon-kontainer">
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
