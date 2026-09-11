import { TZDate } from "@date-fns/tz";
import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { InformationSquareIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading, InfoCard, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { addDays } from "date-fns";
import { useCallback, useEffect, useMemo } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { uuidv7 } from "uuidv7";

import { Error } from "~/components/error/Error";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { LesMer } from "~/components/LesMer";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import {
  hentRapporteringsperioder,
  IRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { lagreRapporteringstype } from "~/models/rapporteringstype.server";
import { formaterDato } from "~/utils/dato.utils";
import {
  harAktiviteter,
  hentPeriodeTekst,
  kanSendes,
  perioderSomKanSendes,
  skalHaArbeidssokerSporsmal,
} from "~/utils/periode.utils";
import { Rapporteringstype, TIDSSONER } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import styles from "../styles/rapporteringstype.module.css";
import rootStyles from "../styles/root.module.css";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const rapporteringstype: Rapporteringstype = formData.get(
    "rapporteringstype",
  ) as Rapporteringstype;

  return lagreRapporteringstype(request, rapporteringsperiodeId, rapporteringstype);
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);

    return { rapporteringsperioder };
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    // TODO: Sanityfy
    throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
  }
}

function nesteSide(periode: IRapporteringsperiode) {
  const skalIkkeFylleUt = periode.rapporteringstype === Rapporteringstype.harIngenAktivitet;

  if (skalIkkeFylleUt && !skalHaArbeidssokerSporsmal(periode)) {
    return `/periode/${periode.id}/send-inn`;
  } else if (skalIkkeFylleUt) {
    return `/periode/${periode.id}/arbeidssoker`;
  }
  return `/periode/${periode.id}/fyll-ut`;
}

export default function RapporteringstypeSide() {
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getRichText } = useSanity();

  const { trackSkjemaStegStartet, trackSkjemaStegFullført } = useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "rapporteringstype";
  const steg = 1;

  const rapporteringstypeFetcher = useFetcher<typeof action>();
  const slettAlleAktiviteterFetcher = useFetcher();
  const isSubmitting = useIsSubmitting(rapporteringstypeFetcher);

  const antallPerioder = perioderSomKanSendes(rapporteringsperioder).length;
  const harFlerePerioder = antallPerioder > 1;

  const type = periode.rapporteringstype;

  const rapporteringstypeFormLabel =
    rapporteringsperioder.length === 1
      ? getAppText("rapportering-rapporter-navarende-tittel")
      : getAppText("rapportering-ikke-utfylte-rapporter-tittel");

  const nesteKnappTekst =
    type === Rapporteringstype.harIngenAktivitet
      ? getAppText("rapportering-knapp-neste")
      : getAppText("rapportering-til-utfylling");

  const endreRapporteringstype = useCallback(
    (valgtType: Rapporteringstype) => {
      rapporteringstypeFetcher.submit(
        { rapporteringstype: valgtType, rapporteringsperiodeId: periode.id },
        { method: "post" },
      );
    },
    [periode.id, rapporteringstypeFetcher],
  );

  const tidligstInnsendingDato = formaterDato({
    dato: new TZDate(periode.kanSendesFra, TIDSSONER.OSLO),
  });
  const senestInnsendingDato = formaterDato({
    dato: addDays(new TZDate(periode.periode.fraOgMed, TIDSSONER.OSLO), 21),
  });

  const neste = async () => {
    if (
      periode.rapporteringstype === Rapporteringstype.harIngenAktivitet &&
      harAktiviteter(periode)
    ) {
      slettAlleAktiviteterFetcher.submit(
        {
          rapporteringsperiodeId: periode.id,
        },
        { method: "delete", action: "/api/slett-alle-aktiviteter" },
      );
    }
    trackSkjemaStegFullført({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });

    navigate(nesteSide(periode));
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
      <div className={rootStyles.pageContent}>
        <KanIkkeSendes periode={periode} />

        {harFlerePerioder && (
          <InfoCard data-color="info" className="my-8">
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
              <strong>
                {getAppText("rapportering-flere-perioder-tittel", { antall: antallPerioder })}
              </strong>
              <br />
              {getAppText("rapportering-flere-perioder-innledning")}
            </InfoCard.Message>
          </InfoCard>
        )}

        <div className={styles.textWrapper}>
          <Heading size="medium" level="2">
            {rapporteringsperioder.length > 1
              ? getAppText("rapportering-foerste-periode")
              : getAppText("rapportering-naavaerende-periode")}
          </Heading>
          <BodyShort size="small">{hentPeriodeTekst(periode, getAppText, locale)}</BodyShort>

          <PortableText
            value={getRichText("rapportering-fyll-ut-frister", {
              "fra-dato": tidligstInnsendingDato,
              "til-dato": senestInnsendingDato,
            })}
          />
        </div>
        <LesMer periodeId={periode.id} />

        <RadioGroup
          disabled={!kanSendes(periode)}
          legend={rapporteringstypeFormLabel}
          description={hentPeriodeTekst(periode, getAppText, locale)}
          onChange={endreRapporteringstype}
          value={type}
        >
          <Radio value={Rapporteringstype.harAktivitet}>
            {getAppText("rapportering-noe-å-rapportere")}
          </Radio>
          <Radio
            data-testid="rapportering-ingen-å-rapportere"
            className="rapportering-ingen-å-rapportere"
            value={Rapporteringstype.harIngenAktivitet}
          >
            <PortableText value={getRichText("rapportering-ingen-å-rapportere")} />
          </Radio>
        </RadioGroup>

        {rapporteringstypeFetcher.data?.status === "error" && (
          <Error title={getAppText(rapporteringstypeFetcher.data.error.statusText)} />
        )}
      </div>
      <div className={rootStyles.buttonsContainerRow}>
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
        >
          {getAppText("rapportering-knapp-tilbake")}
        </Button>
        <Button
          size="medium"
          onClick={neste}
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          disabled={type === null || isSubmitting}
        >
          {nesteKnappTekst}
        </Button>
      </div>
    </>
  );
}
