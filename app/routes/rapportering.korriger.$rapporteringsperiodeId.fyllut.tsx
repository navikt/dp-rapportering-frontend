import { useActionData, useRouteLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import { BodyLong, Heading, Modal } from "@navikt/ds-react";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { useEffect, useState } from "react";
import type { TAktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import type { ActionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { lagreAktivitetAction, slettAktivitetAction } from "~/utils/aktivitet.action.server";

export async function action({ request, params }: ActionArgs) {
  invariant(params.rapporteringsperiodeId, `params.rapporteringsperiode er påkrevd`);
  const periodeId = params.rapporteringsperiodeId;
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      await slettAktivitetAction(formdata, request, periodeId);
    }

    case "lagre": {
      await lagreAktivitetAction(formdata, request, periodeId);
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
  const [valgtDag, setValgtDag] = useState<IRapporteringsperiodeDag | undefined>(undefined);
  const [modalAapen, setModalAapen] = useState(false);
  const [muligeAktiviteter, setMuligeAktiviteter] = useState<TAktivitetType[]>([]);

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  useEffect(() => {
    setMuligeAktiviteter(periode.dager.find((r) => r.dato === valgtDato)?.muligeAktiviteter || []);
  }, [periode.dager, valgtDato]);

  useEffect(() => {
    if (actionData?.lagret) {
      lukkModal();
    }
  }, [actionData]);

  function aapneModal(dato: string) {
    if (periode.status === "TilUtfylling") {
      setValgtDato(dato);
      setValgtDag(periode.dager.find((dag) => dag.dato === dato));
      setModalAapen(true);
    }
  }

  function lukkModal() {
    setValgtAktivitet("");
    setValgtDato(undefined);
    setValgtDag(undefined);
    setModalAapen(false);
  }

  return (
    <>
      <main className={styles.rapporteringKontainer}>
        <Heading size={"medium"} level={"2"}>
          Korrigering
        </Heading>
        <BodyLong spacing>
          Du kan korrigere rapporteringer intill X antall uker tilbake i tid. Endringer i
          rapportering vil føre til at NAV beregner periodene på nytt. Dette kan få konsekvenser for
          utbetaling eller tibakekreving av penger.
        </BodyLong>
        <Kalender rapporteringsperiode={periode} aapneModal={aapneModal} />
        <AktivitetModal
          rapporteringsperiodeDag={valgtDag}
          valgtDato={valgtDato}
          valgtAktivitet={valgtAktivitet}
          setValgtAktivitet={setValgtAktivitet}
          modalAapen={modalAapen}
          setModalAapen={setModalAapen}
          lukkModal={lukkModal}
          muligeAktiviteter={muligeAktiviteter}
        />
        <div className={styles.registertMeldeperiodeKontainer}>
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
        <div className={styles.navigasjonKontainer}>
          <RemixLink as={"Button"} to={`/rapportering/korriger/${periode.id}/send-inn`}>
            Lagre og send korrigering
          </RemixLink>
          <RemixLink as={"Button"} to={`/rapportering/alle`} variant={"secondary"}>
            Avbryt
          </RemixLink>
        </div>
      </main>
    </>
  );
}
