import { BodyLong, Heading, Modal } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { useActionData, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import type { TAktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { lagreAktivitetAction, slettAktivitetAction } from "~/utils/aktivitet.action.server";

export async function action({ request, params }: ActionArgs) {
  invariant(params.rapporteringsperiodeId, `params.rapporteringsperiode er påkrevd`);
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
      <main className="rapportering-kontainer">
        <Heading size={"large"} level={"2"}>
          Fyll ut rapportering
        </Heading>
        <BodyLong spacing>
          Klikk på dagen du ønsker å rapportere for. Du vil da få alternativer for jobb, sykdom,
          fravær og ferie.
        </BodyLong>
        <BodyLong spacing>
          For tidligst mulig utbetaling av dagpenger må rapportering sendes senest siste søndag i
          perioden.
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
        <div className="registert-meldeperiode-kontainer">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
        <div className="navigasjon-kontainer">
          <RemixLink as={"Button"} to={`/rapportering/periode/${periode.id}/send-inn`}>
            Send rapportering
          </RemixLink>
          <RemixLink as={"Button"} to={`/rapportering/alle`} variant={"secondary"}>
            Lagre og fortsett senere
          </RemixLink>
        </div>
      </main>
    </>
  );
}
