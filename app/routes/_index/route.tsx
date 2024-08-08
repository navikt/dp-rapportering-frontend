import { NesteKnapp } from "./NesteKnapp";
import { PeriodeDetaljer } from "./PeriodeDetaljer";
import { BodyLong, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { DevTools } from "~/devTools";
import { getSession } from "~/models/getSession.server";
import {
  IRapporteringsperiode,
  hentRapporteringsperioder,
} from "~/models/rapporteringsperiode.server";
import { getRapporteringstype, setRapporteringstype } from "~/models/rapporteringstype.server";
import { getEnv } from "~/utils/env.utils";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { LesMer } from "~/components/LesMer";
import { RemixLink } from "~/components/RemixLink";
import { ArbeidssokerRegisterering } from "~/components/arbeidssokerregister/ArbeidssokerRegister";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { SessionModal } from "~/components/session-modal/SessionModal";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringstype = await getRapporteringstype(request);
  const session = await getSession(request);
  const rapporteringsperioderResponse = await hentRapporteringsperioder(request);

  if (rapporteringsperioderResponse.ok) {
    const rapporteringsperioder = await rapporteringsperioderResponse.json();
    return json({ rapporteringstype, rapporteringsperioder, session });
  }

  throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
}

export async function action({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const formData = await request.formData();

  const rapporteringstype = formData.get("rapporteringstype") as Rapporteringstype;

  return json(
    { status: "success" },
    {
      headers: {
        "Set-Cookie": await setRapporteringstype(cookieHeader, rapporteringstype),
      },
    }
  );
}

export default function Landingsside() {
  const { rapporteringsperioder, rapporteringstype } = useLoaderData<typeof loader>();
  const { isLocalOrDemo } = useTypedRouteLoaderData("root");

  const { getAppText, getLink, getRichText } = useSanity();

  const harPeriode = rapporteringsperioder.length > 0;
  const forstePeriode: IRapporteringsperiode = harPeriode ? rapporteringsperioder[0] : null;
  const visArbeidssokerRegisterering = rapporteringstype === Rapporteringstype.harIngenAktivitet;

  const visAutomatiskLagret =
    rapporteringstype === Rapporteringstype.harIngenAktivitet &&
    forstePeriode &&
    forstePeriode.registrertArbeidssoker !== null;
  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading tabIndex={-1} level="1" size="xlarge" className="vo-fokus">
            {getAppText("rapportering-tittel")}
          </Heading>
          {isLocalOrDemo && <DevTools />}
        </div>
      </div>

      <div className="rapportering-container">
        <BodyLong>
          <PortableText value={getRichText("rapportering-innledning")} />
        </BodyLong>

        <PeriodeDetaljer
          rapporteringstype={rapporteringstype}
          rapporteringsperioder={rapporteringsperioder}
        />

        {harPeriode && (
          <div>
            <LesMer />

            {visArbeidssokerRegisterering && (
              <div className="my-8">
                <ArbeidssokerRegisterering
                  rapporteringsperiodeId={forstePeriode.id}
                  registrertArbeidssoker={forstePeriode.registrertArbeidssoker}
                />
              </div>
            )}

            <NesteKnapp
              rapporteringstype={rapporteringstype}
              rapporteringsPeriode={forstePeriode}
            />

            {visAutomatiskLagret && <LagretAutomatisk />}
          </div>
        )}
        <div>
          <RemixLink className="my-8" as="Link" to={getLink("rapportering-se-og-korriger").linkUrl}>
            {getLink("rapportering-se-og-korriger").linkText}
          </RemixLink>
        </div>
      </div>
      <SessionModal />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { getAppText } = useSanity();

  if (isRouteErrorResponse(error)) {
    if (getEnv("IS_LOCALHOST") === "true" && error.status === 440) {
      return (
        <main>
          <div className="rapportering-header">
            <div className="rapportering-header-innhold">
              <Heading level="1" size="xlarge">
                {getAppText("rapportering-tittel")}
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
              {getAppText("rapportering-tittel")}
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
