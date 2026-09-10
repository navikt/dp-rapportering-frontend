import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Radio, RadioGroup } from "@navikt/ds-react";
import { useEffect, useMemo } from "react";
import type { ActionFunctionArgs } from "react-router";
import { useFetcher, useNavigate, useRouteLoaderData } from "react-router";
import invariant from "tiny-invariant";
import { uuidv7 } from "uuidv7";

import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import type { loader as RootLoader } from "~/root";
import { formaterDato } from "~/utils/dato.utils";
import { kanSendes, nestePeriode, skalHaArbeidssokerSporsmal } from "~/utils/periode.utils";
import { INetworkResponse } from "~/utils/types";
import { FEATURE_TOGGLES, isFeatureEnabled } from "~/utils/unleash.server";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import { Error } from "../components/error/Error";

export async function loader() {
  return {
    disableSpm5: await isFeatureEnabled(FEATURE_TOGGLES.disableSpm5),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const rapporteringsperiodeId = params.rapporteringsperiodeId;
  const formData = await request.formData();
  const svar = formData.get("registrertArbeidssoker");

  const registrertArbeidssoker = svar === "true";

  return lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
    registrertArbeidssoker,
  });
}

export default function ArbeidssøkerRegisterSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText } = useSanity();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const sanityTekst = rootData?.sanityTekst;
  const navigate = useNavigate();
  const fetcher = useFetcher<INetworkResponse>();
  const isSubmitting = useIsSubmitting(fetcher);

  const { trackSkjemaStegStartet, trackSkjemaStegFullført } = useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "arbeidssoker";
  const steg = 4;
  const nesteMeldeperiode = nestePeriode(periode.periode);
  const dateFormat =
    nesteMeldeperiode.fraOgMed.getFullYear() !== nesteMeldeperiode.tilOgMed.getFullYear() ||
    nesteMeldeperiode.fraOgMed.getFullYear() !== new Date().getFullYear()
      ? "d. MMMM yyyy"
      : "d. MMMM";
  const arbeidssokerstatusSporsmaal = sanityTekst?.utfylling?.arbeidssokerstatusSporsmaal;
  const fom = formaterDato({ dato: nesteMeldeperiode.fraOgMed, dateFormat });
  const tom = formaterDato({
    dato: nesteMeldeperiode.tilOgMed,
    dateFormat: "d. MMMM yyyy",
  });
  const arbeidssokerTittel = arbeidssokerstatusSporsmaal?.tittel
    ?.replaceAll("{{fom}}", fom)
    .replaceAll("{{tom}}", tom);

  function neste() {
    trackSkjemaStegFullført({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });

    navigate(`/periode/${periode.id}/send-inn`);
  }

  useEffect(() => {
    trackSkjemaStegStartet({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });
  }, []);

  function handleChange(registrertArbeidssokerSvar: boolean) {
    if (kanSendes(periode)) {
      fetcher.submit(
        {
          registrertArbeidssoker: registrertArbeidssokerSvar,
          rapporteringsperiodeId: periode.id,
        },
        { method: "post" },
      );
    }
  }

  return (
    <>
      <KanIkkeSendes periode={periode} />

      <fetcher.Form method="post">
        <RadioGroup
          disabled={!kanSendes(periode) || !skalHaArbeidssokerSporsmal(periode) || isSubmitting}
          legend={
            arbeidssokerTittel ??
            getAppText("rapportering-arbeidssokerregister-tittel-v2", { fom, tom })
          }
          description={arbeidssokerstatusSporsmaal?.beskrivelse}
          onChange={handleChange}
          name="_action"
          value={periode.registrertArbeidssoker}
        >
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={true}
            checked={periode.registrertArbeidssoker === true}
          >
            {arbeidssokerstatusSporsmaal?.alternativer.ja ??
              getAppText("rapportering-arbeidssokerregister-svar-ja")}
          </Radio>
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={false}
            checked={periode.registrertArbeidssoker === false}
          >
            {arbeidssokerstatusSporsmaal?.alternativer.nei ??
              getAppText("rapportering-arbeidssokerregister-svar-nei")}
          </Radio>
        </RadioGroup>
      </fetcher.Form>

      {fetcher.data?.status === "error" && (
        <Error title={getAppText(fetcher.data.error.statusText)} />
      )}

      <ArbeidssokerstatusBeskjed periode={periode} side="utfylling" />

      <NavigasjonContainer>
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className={navigasjonStyles.knapp}
        >
          {sanityTekst?.knapper?.tilbake ?? getAppText("rapportering-knapp-tilbake")}
        </Button>

        <Button
          size="medium"
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          className={navigasjonStyles.knapp}
          disabled={periode.registrertArbeidssoker === null || isSubmitting}
          onClick={neste}
        >
          {sanityTekst?.knapper?.neste ?? getAppText("rapportering-knapp-neste")}
        </Button>
      </NavigasjonContainer>
      <LagretAutomatisk />
    </>
  );
}
