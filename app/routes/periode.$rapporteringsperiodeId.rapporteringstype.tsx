import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { addDays } from "date-fns";
import { useCallback } from "react";
import invariant from "tiny-invariant";
import { hentPeriode, hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { lagreRapporteringstype } from "~/models/rapporteringstype.server";
import { getSanityPortableTextComponents } from "~/sanity/sanityPortableTextComponents";
import { formaterDato } from "~/utils/dato.utils";
import { hentPeriodeTekst, perioderSomKanSendes } from "~/utils/periode.utils";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { LesMer } from "~/components/LesMer";
import { RemixLink } from "~/components/RemixLink";
import { Error } from "~/components/error/Error";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const rapporteringstype: Rapporteringstype = formData.get(
    "rapporteringstype"
  ) as Rapporteringstype;

  return await lagreRapporteringstype(request, rapporteringsperiodeId, rapporteringstype);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;

  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);
    const periode = await hentPeriode(request, periodeId, false);

    return json({ rapporteringsperioder, periode });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
  }
}

export default function RapporteringstypeSide() {
  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  const { periode, rapporteringsperioder } = useLoaderData<typeof loader>();
  const { getAppText, getRichText, getLink } = useSanity();

  const rapporteringstypeFetcher = useFetcher<typeof action>();

  const antallPerioder = perioderSomKanSendes(rapporteringsperioder).length;
  const harFlerePerioder = antallPerioder > 1;

  const type = periode.rapporteringstype;

  const rapporteringstypeFormLabel =
    rapporteringsperioder.length === 1
      ? getAppText("rapportering-rapporter-navarende-tittel")
      : getAppText("rapportering-ikke-utfylte-rapporter-tittel");

  const nesteKnappTekst =
    type === Rapporteringstype.harIngenAktivitet
      ? getAppText("rapportering-neste")
      : getAppText("rapportering-til-utfylling");

  const nesteKnappLink =
    type === Rapporteringstype.harIngenAktivitet
      ? `/periode/${periode.id}/arbeidssoker`
      : `/periode/${periode.id}/fyll-ut`;

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

  return (
    <>
      {harFlerePerioder && (
        <>
          <Alert variant="info" className="my-8">
            <Heading spacing size="small" level="2">
              {getAppText("rapportering-flere-perioder-tittel").replace(
                "{antall}",
                antallPerioder.toString()
              )}
            </Heading>
            {getAppText("rapportering-flere-perioder-innledning")}
          </Alert>
        </>
      )}

      <Heading size="medium" level="2">
        {rapporteringsperioder.length > 1 && getAppText("rapportering-foerste-periode")}
        {rapporteringsperioder.length === 1 && getAppText("rapportering-naavaerende-periode")}
      </Heading>
      <p>{hentPeriodeTekst(periode, getAppText)}</p>

      <PortableText
        components={getSanityPortableTextComponents({
          "fra-dato": tidligstInnsendingDato,
          "til-dato": senestInnsendingDato,
        })}
        value={getRichText("rapportering-fyll-ut-frister")}
      />

      <LesMer />

      <RadioGroup
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
          className="py-4 px-8"
        >
          {getLink("rapportering-periode-send-inn-tilbake").linkText}
        </RemixLink>

        <RemixLink
          as="Button"
          to={nesteKnappLink}
          variant="primary"
          iconPosition="right"
          className="py-4 px-8"
          icon={<ArrowRightIcon aria-hidden />}
          disabled={type === null}
        >
          {nesteKnappTekst}
        </RemixLink>
      </div>
    </>
  );
}
