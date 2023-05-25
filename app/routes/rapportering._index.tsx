import { Left, Right } from "@navikt/ds-icons";
import { Heading, Modal } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { validationError } from "remix-validated-form";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { AktivitetModal } from "~/components/ny-aktivitet-modal/NyAktivitetModal";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { lagreAktivitet } from "~/models/aktivitet.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import nbLocale from "date-fns/locale/nb";
import { validerSkjema } from "~/utils/validering.util";

import styles from "./rapportering.module.css";

export function meta() {
  return [
    {
      title: "Dagpenger rapportering",
      description: "rapporteringløsning for dagpenger",
    },
  ];
}

export async function action({ request }: ActionArgs) {
  const inputVerdier = await validerSkjema.validate(await request.formData());

  if (inputVerdier.error) {
    return validationError(inputVerdier.error);
  }

  const { type, dato, timer } = inputVerdier.submittedData;
  const aktivitet = {
    type,
    dato,
    timer: timer.replace(/,/g, "."),
  };

  return await lagreAktivitet(aktivitet);
}

export default function Rapportering() {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as {
    rapporteringsperiode: IRapporteringsperiode;
  };

  const [valgtAktivitet, setValgtAktivitet] = useState<TAktivitetType | undefined>(undefined);
  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [timer] = useState<string | undefined>(undefined);
  const [modalHeaderTekst, setModalHeaderTekst] = useState("");
  const [modalAapen, setModalAapen] = useState(false);
  const [muligeAktiviteter, setMuligeAktiviteter] = useState<TAktivitetType[]>([]);

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  useEffect(() => {
    setMuligeAktiviteter(
      rapporteringsperiode.dager.find((r) => r.dato === valgtDato)?.muligeAktiviteter || []
    );
  }, [rapporteringsperiode.dager, valgtDato]);

  function aapneModal(dato: string) {
    setValgtDato(dato);
    setModalAapen(true);

    setModalHeaderTekst(`${format(new Date(dato), "EEEE d", { locale: nbLocale })}`);
  }

  function lukkModal() {
    setValgtAktivitet(undefined);
    setValgtDato(undefined);
    setModalAapen(false);
    setModalHeaderTekst("");
  }

  return (
    <>
      <Heading level="2" size="large" spacing>
        Utfylling
      </Heading>

      <Kalender aapneModal={aapneModal} />

      <AktivitetModal
        timer={timer}
        valgtDato={valgtDato}
        setValgtDato={setValgtDato}
        valgtAktivitet={valgtAktivitet}
        setValgtAktivitet={setValgtAktivitet}
        modalAapen={modalAapen}
        setModalAapen={setModalAapen}
        modalHeaderTekst={modalHeaderTekst}
        lukkModal={lukkModal}
        muligeAktiviteter={muligeAktiviteter}
      />
      <div className={styles.registertMeldeperiodeKontainer}>
        <p>Sammenlagt for meldeperioden:</p>
        <AktivitetOppsummering />
      </div>

      <div className={styles.navigasjonKontainer}>
        <RemixLink to="" as="Button" variant="secondary" icon={<Left />}>
          Mine side
        </RemixLink>
        <RemixLink
          to="/rapportering/send-inn"
          as="Button"
          variant="primary"
          icon={<Right />}
          iconPosition="right"
        >
          Neste steg
        </RemixLink>
      </div>
    </>
  );
}
