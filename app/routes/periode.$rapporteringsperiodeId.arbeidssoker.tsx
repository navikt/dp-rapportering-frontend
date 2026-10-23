import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Radio, RadioGroup } from "@navikt/ds-react";
import { useEffect, useMemo } from "react";
import type { ActionFunctionArgs } from "react-router";
import { useFetcher, useNavigate, useRouteLoaderData } from "react-router";
import invariant from "tiny-invariant";
import { uuidv7 } from "uuidv7";

import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { InnsendingsStatusBeskjed } from "~/components/beskjeder/InnsendingsStatusBeskjed";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import type { loader as RootLoader } from "~/root";
import { formaterArbeidssokerperiode } from "~/utils/dato.utils";
import {
  kanSendes,
  nestePeriode,
  normaliserArbeidssokerSvar,
  skalDeaktivereArbeidssokerstatusSporsmal,
  skalHaArbeidssokerSporsmal,
} from "~/utils/periode.utils";
import { sanityTekst as visSanityTekst } from "~/utils/sanity.utils";
import { INetworkResponse } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import { Error } from "../components/error/Error";
import rootStyles from "../styles/root.module.css";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const rapporteringsperiodeId = params.rapporteringsperiodeId;
  const formData = await request.formData();
  const svar = formData.get("registrertArbeidssoker");
  const arbeidssokerSvar =
    svar === "true" || svar === "false" ? { registrertArbeidssoker: svar === "true" } : {};

  return lagreArbeidssokerSvar(request, rapporteringsperiodeId, arbeidssokerSvar);
}

export default function ArbeidssøkerRegisterSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText } = useSanity();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const sanityTekst = rootData?.sanityTekst;
  const arbeidssokerSvar = normaliserArbeidssokerSvar(
    periode,
    rootData?.nyArbeidssokerstatusFlytAktiv,
  );
  const deaktivertPaaGrunnAvAarsak = skalDeaktivereArbeidssokerstatusSporsmal(
    periode,
    rootData?.nyArbeidssokerstatusFlytAktiv,
  );
  const navigate = useNavigate();
  const fetcher = useFetcher<INetworkResponse>();
  const isSubmitting = useIsSubmitting(fetcher);

  const { trackSkjemaStegStartet, trackSkjemaStegFullført } = useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "arbeidssoker";
  const steg = 4;
  const nesteMeldeperiode = nestePeriode(periode.periode);
  const arbeidssokerstatusSporsmaal = sanityTekst?.utfylling?.arbeidssokerstatusSporsmaal;
  const { fom, tom } = formaterArbeidssokerperiode(nesteMeldeperiode, rootData?.locale);
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
      <InnsendingsStatusBeskjed periode={periode} />

      <fetcher.Form method="post">
        <RadioGroup
          disabled={
            !kanSendes(periode) ||
            !skalHaArbeidssokerSporsmal(periode, rootData?.nyArbeidssokerstatusFlytAktiv) ||
            deaktivertPaaGrunnAvAarsak ||
            isSubmitting
          }
          legend={visSanityTekst(
            arbeidssokerTittel,
            "utfylling.arbeidssokerstatusSporsmaal.tittel",
          )}
          description={visSanityTekst(
            arbeidssokerstatusSporsmaal?.beskrivelse,
            "utfylling.arbeidssokerstatusSporsmaal.beskrivelse",
          )}
          onChange={handleChange}
          name="_action"
          value={arbeidssokerSvar}
        >
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={true}
            checked={arbeidssokerSvar === true}
          >
            {visSanityTekst(
              arbeidssokerstatusSporsmaal?.alternativer.ja,
              "utfylling.arbeidssokerstatusSporsmaal.alternativer.ja",
            )}
          </Radio>
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={false}
            checked={arbeidssokerSvar === false}
          >
            {visSanityTekst(
              arbeidssokerstatusSporsmaal?.alternativer.nei,
              "utfylling.arbeidssokerstatusSporsmaal.alternativer.nei",
            )}
          </Radio>
        </RadioGroup>
      </fetcher.Form>

      {fetcher.data?.status === "error" && (
        <Error title={getAppText(fetcher.data.error.statusText)} />
      )}

      <ArbeidssokerstatusBeskjed periode={periode} side="utfylling" />

      <div className={rootStyles.buttonsContainerRow}>
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
        >
          {visSanityTekst(sanityTekst?.knapper?.tilbake, "knapper.tilbake")}
        </Button>

        <Button
          size="medium"
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          disabled={(arbeidssokerSvar === null && !deaktivertPaaGrunnAvAarsak) || isSubmitting}
          onClick={neste}
        >
          {visSanityTekst(sanityTekst?.knapper?.neste, "knapper.neste")}
        </Button>
      </div>
      <LagretAutomatisk />
    </>
  );
}
