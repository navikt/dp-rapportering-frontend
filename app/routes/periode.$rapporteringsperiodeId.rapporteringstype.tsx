import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { addDays } from "date-fns";
import { useCallback } from "react";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { lagreRapporteringstype } from "~/models/rapporteringstype.server";
import { getSanityPortableTextComponents } from "~/sanity/sanityPortableTextComponents";
import { formaterDato } from "~/utils/dato.utils";
import { hentPeriodeTekst, kanSendes, perioderSomKanSendes } from "~/utils/periode.utils";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { KanIkkeSendes } from "~/components/KanIkkeSendes/KanIkkeSendes";
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

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);

    return json({ rapporteringsperioder });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    // TODO: Sanityfy
    throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
  }
}

export default function RapporteringstypeSide() {
  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getRichText } = useSanity();

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
      ? getAppText("rapportering-knapp-neste")
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
      <KanIkkeSendes periode={periode} />

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
        {rapporteringsperioder.length > 1
          ? getAppText("rapportering-foerste-periode")
          : getAppText("rapportering-naavaerende-periode")}
      </Heading>

      <p>{hentPeriodeTekst(periode, getAppText)}</p>

      <PortableText
        components={getSanityPortableTextComponents({
          "rapportering-apnes-i-ny-fane": getAppText("rapportering-apnes-i-ny-fane"),
          "fra-dato": tidligstInnsendingDato,
          "til-dato": senestInnsendingDato,
        })}
        value={getRichText("rapportering-fyll-ut-frister")}
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

        <RemixLink
          as="Button"
          to={nesteKnappLink}
          variant="primary"
          iconPosition="right"
          className="navigasjonsknapp"
          icon={<ArrowRightIcon aria-hidden />}
          disabled={type === null}
        >
          {nesteKnappTekst}
        </RemixLink>
      </div>
    </>
  );
}
