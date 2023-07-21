import { useActionData, useRouteLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import { Heading, Modal } from "@navikt/ds-react";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { useEffect, useState } from "react";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { lagreAktivitet, sletteAktivitet } from "~/models/aktivitet.server";
import type { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { useSanity } from "~/hooks/useSanity";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { validator } from "~/utils/validering.util";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      const rapporteringsperiodeId = formdata.get("rapporteringsperiodeId") as string;
      const aktivitetId = formdata.get("aktivitetId") as string;

      const slettAktivitetResponse = await sletteAktivitet(
        rapporteringsperiodeId,
        aktivitetId,
        request
      );

      if (!slettAktivitetResponse.ok) {
        return json({ error: "Det har skjedd en feil ved sletting, prøv igjen." });
      }

      return {};
    }

    case "lagre": {
      const aktivitType = formdata.get("type") as TAktivitetType;
      const inputVerdier = await validator(aktivitType).validate(formdata);

      if (inputVerdier.error) {
        return validationError(inputVerdier.error);
      }

      const { rapporteringsperiodeId, type, dato, timer: tid } = inputVerdier.submittedData;

      function hentAktivitetArbeid() {
        const delt = tid.replace(/\./g, ",").split(",");
        const timer = delt[0] || 0;
        const minutter = delt[1] || 0;
        const minutterFloat = parseFloat(`0.${minutter}`);

        return {
          type,
          dato,
          timer: serialize({
            hours: timer,
            minutes: Math.round(minutterFloat * 60),
          }),
        };
      }

      const andreAktivitet = {
        type,
        dato,
      };

      const aktivitetData = aktivitType === "Arbeid" ? hentAktivitetArbeid() : andreAktivitet;

      const lagreAktivitetResponse = await lagreAktivitet(
        rapporteringsperiodeId,
        aktivitetData,
        request
      );

      if (!lagreAktivitetResponse.ok) {
        return json({ error: "Noen gikk feil med lagring av aktivitet, prøv igjen." });
      }

      return json({ lagret: true });
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
  const [valgtDag, setValgtDag] = useState<IRapporteringsperiodeDag | undefined>(undefined);
  const [modalAapen, setModalAapen] = useState(false);
  const [muligeAktiviteter, setMuligeAktiviteter] = useState<TAktivitetType[]>([]);
  const { hentAppTekstMedId } = useSanity();

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
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        <Kalender rapporteringsperiode={periode} aapneModal={aapneModal} />
        <AktivitetModal
          rapporteringsperiodeId={periode.id}
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
      </main>
    </>
  );
}
