import { BodyShort, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { getSession } from "~/models/getSession.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { getEnv } from "~/utils/env.utils";
import { useSanity } from "~/hooks/useSanity";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { RemixLink } from "~/components/RemixLink";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { SessionModal } from "~/components/session-modal/SessionModal";

export async function loader({ request }: LoaderFunctionArgs) {
  let gjeldendePeriode: IRapporteringsperiode | null = null;

  const onBehalfOfToken = await getRapporteringOboToken(request);
  const gjeldendePeriodeResponse = await hentGjeldendePeriode(onBehalfOfToken);

  const session = await getSession(request);

  if (!gjeldendePeriodeResponse.ok) {
    if (gjeldendePeriodeResponse.status !== 404)
      throw new Response("Feil i uthenting av gjeldende periode", {
        status: 500,
      });
  } else {
    gjeldendePeriode = await gjeldendePeriodeResponse.json();
  }

  return json({ gjeldendePeriode, session });
}

export default function Landingsside() {
  const { gjeldendePeriode } = useLoaderData<typeof loader>();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();
  const { getAppText, getRichText, getLink } = useSanity();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  let invaerendePeriodeTekst;

  if (gjeldendePeriode) {
    const ukenummer = formaterPeriodeTilUkenummer(
      gjeldendePeriode.periode.fraOgMed,
      gjeldendePeriode.periode.tilOgMed
    );
    const dato = formaterPeriodeDato(
      gjeldendePeriode.periode.fraOgMed,
      gjeldendePeriode.periode.tilOgMed
    );

    invaerendePeriodeTekst = `Uke ${ukenummer} (${dato})`;
  }

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading
            ref={sidelastFokusRef}
            tabIndex={-1}
            level="1"
            size="xlarge"
            className="vo-fokus"
          >
            {getAppText("rapportering-tittel")}
          </Heading>
        </div>
      </div>
      <div className="rapportering-container">
        <PortableText value={getRichText("rapportering-innledning")} />
        <Heading size={"small"} level="2">
          {getAppText("rapportering-ikke-utfylte-rapporter-tittel")}
        </Heading>
        {!gjeldendePeriode && <>{getAppText("rapportering-ingen-rapporter-å-fylle-ut")}</>}
        {gjeldendePeriode && (
          <div>
            <BodyShort>{invaerendePeriodeTekst}</BodyShort>
            <RemixLink
              as="Button"
              to={`/rapportering/periode/${gjeldendePeriode.id}/fyll-ut`}
              className="my-4"
            >
              {getLink("rapportering-rapporter-for-perioden").linkText}
            </RemixLink>
          </div>
        )}
        <p>
          <RemixLink as="Link" to={getLink("rapportering-se-og-korriger").linkUrl}>
            {getLink("rapportering-se-og-korriger").linkText}
          </RemixLink>
        </p>
      </div>
      <SessionModal />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (getEnv("IS_LOCALHOST") === "true" && error.status === 440) {
      return (
        <main>
          <div className="rapportering-header">
            <div className="rapportering-header-innhold">
              <Heading level="1" size="xlarge">
                Dagpengerapportering
              </Heading>
            </div>
          </div>
          <div className="rapportering-container">
            <DevelopmentContainer>
              <>
                Sesjon utløpt! &nbsp;
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering"
                >
                  Klikk på lenken for å hente ny token
                </a>
              </>
            </DevelopmentContainer>
          </div>
        </main>
      );
    }

    return (
      <main>
        <div className="rapportering-header">
          <div className="rapportering-header-innhold">
            <Heading level="1" size="xlarge">
              Dagpengerapportering
            </Heading>
          </div>
        </div>
        <div className="rapportering-container">
          <Heading level="2" size="medium">
            {error.status} {error.statusText}
          </Heading>
          <p>{error.data}</p>
        </div>
      </main>
    );
  }
}
