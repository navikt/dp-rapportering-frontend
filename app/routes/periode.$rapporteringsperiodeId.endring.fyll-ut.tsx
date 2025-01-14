import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { uuidv7 } from "uuidv7";

import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { RemixLink } from "~/components/RemixLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { slettAlleAktiviteter, validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { erPeriodeneLike } from "~/utils/periode.utils";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return slettAlleAktiviteter(request, periodeId, formdata);
    }

    case "lagre": {
      return validerOgLagreAktivitet(request, periodeId, formdata);
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

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;
  const { periode } = await hentPeriode(request, periodeId, false, "loader-endring-fyll-ut");
  const { periode: originalPeriode } = await hentPeriode(
    request,
    periode.originalId as string,
    true,
    "loader-endring-fyll-ut-original",
  );

  return { periode, originalPeriode };
}

export default function RapporteringsPeriodeFyllUtSide() {
  const { periode, originalPeriode } = useLoaderData<typeof loader>();
  const { locale } = useLocale();
  const navigation = useNavigation();
  const isSubmitting = useIsSubmitting(navigation);

  const { getAppText, getRichText, getLink } = useSanity();
  const actionData = useActionData<typeof action>();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgteAktiviteter, setValgteAktiviteter] = useState<AktivitetType[]>([]);
  const [modalAapen, setModalAapen] = useState(false);

  const { trackSkjemaStegStartet, trackSkjemaStegFullført } = useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "endring-fyll-ut";
  const steg = 1;

  const navigate = useNavigate();

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
    if (periode.status === "TilUtfylling" || periode.status === "Endret") {
      setValgtDato(dato);
      setModalAapen(true);
    }
  }

  function lukkModal() {
    setValgteAktiviteter([]);
    setValgtDato(undefined);
    setModalAapen(false);
  }

  const periodeneErLike = erPeriodeneLike(periode, originalPeriode);

  const neste = () => {
    trackSkjemaStegFullført({
      periode,
      stegnavn,
      steg,
      endring: true,
      sesjonId,
    });

    const nextLink = periodeneErLike
      ? `/periode/${periode.id}/endring/tom`
      : `/periode/${periode.id}/endring/begrunnelse`;
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
        {getAppText("rapportering-periode-endre-tittel")}
      </Heading>
      <PortableText value={getRichText("rapportering-periode-endre-beskrivelse")} />

      <Kalender periode={periode} aapneModal={aapneModal} locale={locale} />
      <AktivitetModal
        periode={periode}
        valgtDato={valgtDato}
        valgteAktiviteter={valgteAktiviteter}
        setValgteAktiviteter={setValgteAktiviteter}
        modalAapen={modalAapen}
        lukkModal={lukkModal}
      />
      <div className="registert-meldeperiode-container">
        <AktivitetOppsummering periode={periode} />
      </div>

      <NavigasjonContainer>
        <RemixLink
          as="Button"
          to={`/innsendt`}
          variant="secondary"
          className={navigasjonStyles.knapp}
          icon={<ArrowLeftIcon aria-hidden />}
          iconPosition="left"
        >
          {getAppText("rapportering-knapp-tilbake")}
        </RemixLink>

        <Button
          size="medium"
          variant="primary"
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          className={navigasjonStyles.knapp}
          onClick={neste}
          disabled={isSubmitting}
        >
          {getAppText("rapportering-knapp-neste")}
        </Button>
      </NavigasjonContainer>
      <NavigasjonContainer>
        <RemixLink
          as="Button"
          to={getLink("rapportering-endre-avbryt").linkUrl}
          variant="tertiary"
          className="px-8"
        >
          {getLink("rapportering-endre-avbryt").linkText}
        </RemixLink>
      </NavigasjonContainer>

      <LagretAutomatisk />
    </>
  );
}
