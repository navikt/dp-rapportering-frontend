import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useEffect, useMemo, useState } from "react";
import type { ActionFunctionArgs } from "react-router";
import { useActionData, useNavigate, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { uuidv7 } from "uuidv7";

import { validerOgLagreAktivitet } from "~/actions/aktivitet.action.server";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { LesMer } from "~/components/LesMer";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { usePreventDoubleClick } from "~/hooks/usePreventDoubleClick";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { kanSendes, skalHaArbeidssokerSporsmal } from "~/utils/periode.utils";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import styles from "../styles/fyll-ut.module.css";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
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

function nesteSide(periode: IRapporteringsperiode) {
  const harIngenAktiviteter = periode.dager.every((dag) => dag.aktiviteter.length === 0);

  if (harIngenAktiviteter) {
    return `/periode/${periode.id}/tom`;
  }

  if (!skalHaArbeidssokerSporsmal(periode)) {
    return `/periode/${periode.id}/send-inn`;
  }

  return `/periode/${periode.id}/arbeidssoker`;
}

export default function RapporteringsPeriodeFyllUtSide() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = useIsSubmitting(navigation);
  const { locale } = useLocale();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const { trackSkjemaStegStartet, trackSkjemaStegFullført } = useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "fyll-ut";
  const steg = 2;

  const { getAppText, getRichText } = useSanity();
  const actionData = useActionData<typeof action>();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgteAktiviteter, setValgteAktiviteter] = useState<AktivitetType[]>([]);
  const [modalAapen, setModalAapen] = useState(false);

  const [harTrykketNeste, trySetHarTrykketNeste] = usePreventDoubleClick();

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
    if (kanSendes(periode)) {
      setValgtDato(dato);
      setModalAapen(true);
    }
  }

  function lukkModal() {
    setValgteAktiviteter([]);
    setValgtDato(undefined);
    setModalAapen(false);
  }

  const neste = () => {
    if (!trySetHarTrykketNeste()) return;

    trackSkjemaStegFullført({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });

    const nextLink = nesteSide(periode);
    navigate(nextLink);
  };

  useEffect(() => {
    trackSkjemaStegStartet({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });
  }, []);

  return (
    <>
      <KanIkkeSendes periode={periode} />

      <Heading tabIndex={-1} size="medium" level="2" className="vo-fokus">
        {getAppText("rapportering-periode-fyll-ut-tittel")}
      </Heading>

      <PortableText value={getRichText("rapportering-periode-fyll-ut-beskrivelse")} />

      <LesMer periodeId={periode.id} />

      <Kalender periode={periode} aapneModal={aapneModal} locale={locale} />
      <AktivitetModal
        periode={periode}
        valgtDato={valgtDato}
        valgteAktiviteter={valgteAktiviteter}
        setValgteAktiviteter={setValgteAktiviteter}
        modalAapen={modalAapen}
        lukkModal={lukkModal}
      />
      <div className={styles.container}>
        <AktivitetOppsummering periode={periode} />
      </div>

      <NavigasjonContainer>
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className={navigasjonStyles.knapp}
        >
          {getAppText("rapportering-knapp-tilbake")}
        </Button>

        <Button
          size="medium"
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          className={navigasjonStyles.knapp}
          onClick={neste}
          disabled={isSubmitting || harTrykketNeste}
        >
          {getAppText("rapportering-knapp-neste")}
        </Button>
      </NavigasjonContainer>

      <LagretAutomatisk />
    </>
  );
}
