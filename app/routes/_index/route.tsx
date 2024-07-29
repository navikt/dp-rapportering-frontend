import { Header } from "./Header";
import { NextButton } from "./NextButton";
import { PeriodeDetaljer } from "./PeriodeDetaljer";
import { RapporteringstypeForm } from "./RapporteringstypeForm";
import { BodyLong, Heading, ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { withDb } from "mocks/responses/db";
import { getSessionId, sessionRecord } from "mocks/session";
import { ScenerioType } from "~/devTools";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { getSession } from "~/models/getSession.server";
import {
  IRapporteringsperiode,
  hentRapporteringsperioder,
  startUtfylling,
} from "~/models/rapporteringsperiode.server";
import { getEnv, isLocalOrDemo } from "~/utils/env.utils";
import { Rapporteringstype, useRapporteringstype } from "~/hooks/useRapporteringstype";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { ArbeidssokerRegisterering } from "~/components/arbeidssokerregister/ArbeidssokerRegister";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { SessionModal } from "~/components/session-modal/SessionModal";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");

  switch (action) {
    case "start": {
      const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
      await startUtfylling(request, rapporteringsperiodeId);
      return { status: "success" };
    }

    case "scenerio": {
      if (isLocalOrDemo) {
        const { type: scenerio } = Object.fromEntries(formData);
        const sessionId = getSessionId(request);

        if (sessionId) {
          withDb(sessionRecord.getDatabase(sessionId)).updateRapporteringsperioder(
            scenerio as ScenerioType
          );

          return { status: "success" };
        }
      }
      return { status: "success" };
    }

    case "registrertArbeidssoker": {
      const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
      const registrertArbeidssoker: boolean = formData.get("registrertArbeidssoker") === "true";

      return await lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
        registrertArbeidssoker,
      });
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
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const rapporteringsperioderResponse = await hentRapporteringsperioder(request);

  if (rapporteringsperioderResponse.ok) {
    const rapporteringsperioder = await rapporteringsperioderResponse.json();
    return json({ rapporteringsperioder, session });
  }

  throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
}

export default function Landingsside() {
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const { isLocalOrDemo } = useTypedRouteLoaderData("root");

  const { rapporteringstype, setRapporteringstype } = useRapporteringstype();

  const { getLink, getRichText } = useSanity();

  const harPeriode = rapporteringsperioder.length > 0;
  const forstePeriode: IRapporteringsperiode = harPeriode ? rapporteringsperioder[0] : null;
  const visArbeidssokerRegisterering = rapporteringstype === Rapporteringstype.harIngenAktivitet;

  return (
    <>
      <Header isLocalOrDemo={isLocalOrDemo} />
      <div className="rapportering-container">
        <BodyLong>
          <PortableText value={getRichText("rapportering-innledning")} />
        </BodyLong>

        <PeriodeDetaljer rapporteringsperioder={rapporteringsperioder} />

        {harPeriode && (
          <div>
            <RapporteringstypeForm
              type={rapporteringstype}
              setType={setRapporteringstype}
              rapporteringsperiodeId={forstePeriode.id}
            />

            <ReadMore header="Les mer om hva som skal rapporteres">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias pariatur, explicabo
              quisquam harum aspernatur ex, officiis doloremque atque tempora tenetur distinctio
              quasi doloribus voluptatum aliquid ipsam! In dolore consectetur quae iusto porro ipsum
              culpa nemo velit error eos assumenda illo omnis, amet, excepturi sit qui, ab quia
              voluptates cum fugit.
            </ReadMore>

            {visArbeidssokerRegisterering && (
              <div className="my-8">
                <ArbeidssokerRegisterering
                  rapporteringsperiodeId={forstePeriode.id}
                  registrertArbeidssoker={forstePeriode.registrertArbeidssoker}
                />
              </div>
            )}

            <NextButton
              rapporteringstype={rapporteringstype}
              rapporteringsPeriode={forstePeriode}
            />
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
