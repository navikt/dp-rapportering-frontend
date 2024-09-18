import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Checkbox, CheckboxGroup, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
// import { LoaderFunctionArgs, json } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
// import { DevTools } from "~/devTools";
// import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
// import { hentRapporteringstype } from "~/models/rapporteringstype.server";
import { useSanity } from "~/hooks/useSanity";
// import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LesMer } from "~/components/LesMer";
import { RemixLink } from "~/components/RemixLink";
import Center from "~/components/center/Center";

// export async function loader({ request }: LoaderFunctionArgs) {
//   try {
//     const rapporteringstype = await hentRapporteringstype(request);
//     const rapporteringsperioder = await hentRapporteringsperioder(request);

//     return json({ rapporteringstype, rapporteringsperioder });
//   } catch (error: unknown) {
//     if (error instanceof Response) {
//       throw error;
//     }

//     throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
//   }
// }

export default function Landingsside() {
  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  // const { rapporteringsperioder } = useLoaderData<typeof loader>();

  const { getAppText, getLink, getRichText } = useSanity();

  const [samtykker, setSamtykker] = useState(false);

  return (
    <>
      <PortableText value={getRichText("rapportering-innledning")} />

      <LesMer />

      <Heading size="small">{getAppText("rapportering-samtykke-tittel")}</Heading>

      <PortableText value={getRichText("rapportering-samtykke-beskrivelse")} />

      <CheckboxGroup
        value={[samtykker]}
        legend=""
        hideLegend
        onChange={(value) => setSamtykker(value.includes(true))}
      >
        <Checkbox value={true}>{getAppText("rapportering-samtykke-checkbox")}</Checkbox>
      </CheckboxGroup>

      <Center>
        <RemixLink
          size="medium"
          as="Button"
          className="my-18 py4 px-16"
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          to={"/rapporteringstype"}
          disabled={!samtykker}
        >
          {getAppText("rapportering-neste")}
        </RemixLink>
      </Center>

      <Center>
        <RemixLink className="my-8" as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </Center>
    </>
  );
}
