import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { addDays } from "date-fns";
import { useCallback } from "react";
import {
  IRapporteringsperiode,
  hentRapporteringsperioder,
} from "~/models/rapporteringsperiode.server";
import { lagreRapporteringstype } from "~/models/rapporteringstype.server";
import { formaterDato } from "~/utils/dato.utils";
import { hentPeriodeTekst, kanSendes, perioderSomKanSendes } from "~/utils/periode.utils";
import { Rapporteringstype } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";
import { useAmplitude } from "~/hooks/useAmplitude";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LesMer } from "~/components/LesMer";
import { RemixLink } from "~/components/RemixLink";
import { Error } from "~/components/error/Error";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const rapporteringstype: Rapporteringstype = formData.get(
    "rapporteringstype"
  ) as Rapporteringstype;

  return await lagreRapporteringstype(request, rapporteringsperiodeId, rapporteringstype);
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<TypedResponse<{ rapporteringsperioder: IRapporteringsperiode[] }>> {
  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);

    return Response.json({ rapporteringsperioder });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    // TODO: Sanityfy
    throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
  }
}

export default function RapporteringstypeSide() {
  const navigate = useNavigate();
  const { trackSkjemaSteg } = useAmplitude();

  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getRichText } = useSanity();

  const rapporteringstypeFetcher = useFetcher<typeof action>();
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
        { method: "post" }
      );
    },
    [periode.id, rapporteringstypeFetcher]
  );

  const tidligstInnsendingDato = formaterDato(new Date(periode.kanSendesFra));
  const senestInnsendingDato = formaterDato(addDays(new Date(periode.periode.fraOgMed), 21));

  const neste = () => {
    trackSkjemaSteg({
      periode,
      stegnavn: "rapporteringstype",
      steg: 1,
    });

    const nesteKnappLink =
      type === Rapporteringstype.harIngenAktivitet
        ? `/periode/${periode.id}/arbeidssoker`
        : `/periode/${periode.id}/fyll-ut`;
    navigate(nesteKnappLink);
  };

  return (
    <>
      <KanIkkeSendes periode={periode} />

      {harFlerePerioder && (
        <>
          <Alert variant="info" className="my-8">
            <Heading spacing size="small" level="2">
              {getAppText("rapportering-flere-perioder-tittel", { antall: antallPerioder })}
            </Heading>
            {getAppText("rapportering-flere-perioder-innledning")}
          </Alert>
        </>
      )}

      <Heading size="medium" level="2">
        {rapporteringsperioder.length > 1
          ? getAppText("rapportering-foerste-periode")
          : getAppText("rapportering-naavaerende-periode")}
      </Heading>

      <p>{hentPeriodeTekst(periode, getAppText)}</p>

      <PortableText
        value={getRichText("rapportering-fyll-ut-frister", {
          "fra-dato": tidligstInnsendingDato,
          "til-dato": senestInnsendingDato,
        })}
      />

      <LesMer />

      <RadioGroup
        disabled={!kanSendes(periode)}
        legend={rapporteringstypeFormLabel}
        description={hentPeriodeTekst(periode, getAppText)}
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

      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={`/`}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className="navigasjonsknapp"
        >
          {getAppText("rapportering-knapp-tilbake")}
        </RemixLink>

        <Button
          size="medium"
          onClick={neste}
          variant="primary"
          iconPosition="right"
          className="navigasjonsknapp"
          icon={<ArrowRightIcon aria-hidden />}
          disabled={type === null || isSubmitting}
        >
          {nesteKnappTekst}
        </Button>
      </div>
    </>
  );
}
