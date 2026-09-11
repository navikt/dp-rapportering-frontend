import { TZDate } from "@date-fns/tz";
import { InformationSquareIcon } from "@navikt/aksel-icons";
import { Accordion, BodyShort, Button, Detail, Heading, InfoCard, Tag } from "@navikt/ds-react";
import { setBreadcrumbs as setDekoratorenBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { PortableText } from "@portabletext/react";
import classNames from "classnames";
import { useEffect } from "react";
import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRouteLoaderData } from "react-router";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { Kalender } from "~/components/kalender/Kalender";
import { ReactLink } from "~/components/ReactLink";
import { useLocale } from "~/hooks/useLocale";
import {
  hentInnsendtePerioder,
  hentRapporteringsperioder,
  IRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { baseUrl } from "~/utils/dekoratoren.utils";
import { sorterGrupper } from "~/utils/innsendt.utils";
import { perioderSomKanSendes } from "~/utils/periode.utils";
import { TIDSSONER } from "~/utils/types";

import innsendtStyles from "../styles/innsendt.module.css";
import rootStyles from "../styles/root.module.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioder = await hentRapporteringsperioder(request);
  const innsendtPerioder = await hentInnsendtePerioder(request);

  return { innsendtPerioder, rapporteringsperioder };
}

function grupperPerioder(
  perioder: { [key: string]: IRapporteringsperiode[] },
  periode: IRapporteringsperiode,
): { [key: string]: IRapporteringsperiode[] } {
  const { fraOgMed } = periode.periode;

  if (!perioder[fraOgMed]) {
    perioder[fraOgMed] = [];
  }

  perioder[fraOgMed].push(periode);

  return perioder;
}

export default function InnsendteRapporteringsPerioderSide() {
  const { innsendtPerioder, rapporteringsperioder } = useLoaderData<typeof loader>();
  const { locale } = useLocale();

  const antallPerioder = perioderSomKanSendes(rapporteringsperioder).length;
  const harFlerePerioder = antallPerioder >= 1;
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const grunntekster = rootData?.sanityTekst?.grunntekster;
  const oversikt = rootData?.sanityTekst?.oversikt;
  const knapper = rootData?.sanityTekst?.knapper;
  const meldekortdetaljer = rootData?.sanityTekst?.meldekortdetaljer;

  const gruppertePerioder = innsendtPerioder.reduce(grupperPerioder, {});
  const sortertePeriodeNokler = Object.keys(gruppertePerioder).sort((a, b) => b.localeCompare(a));
  const sortertePerioder = sortertePeriodeNokler
    .map((nokkel) => gruppertePerioder[nokkel])
    .map(sorterGrupper);

  useEffect(() => {
    if (grunntekster?.minSide && grunntekster.innsendteMeldekort) {
      setDekoratorenBreadcrumbs([
        { title: grunntekster.minSide, url: "https://www.nav.no/minside" },
        { title: grunntekster.innsendteMeldekort, url: `${baseUrl}/innsendt` },
      ]);
    }
  }, [grunntekster]);

  // Det er et problem med "Intl.NumberFormat" og SSR, vi får feilmeldingen:
  // > Text content did not match. Server: "kr 8 632,00" Client: "8 632,00 kr"
  // Det er mest sannsynlig pga. forskjeller i JS-motor i nettleser og på serveren
  // ref. https://github.com/nodejs/node/issues/39056

  return (
    <>
      <div className={rootStyles.pageContent}>
        <Heading size="medium" level="2">
          {oversikt?.tittel}
        </Heading>
        {oversikt?.tekst && <PortableText value={oversikt.tekst} />}
        {innsendtPerioder.length === 0 && (
          <InfoCard data-color="info">
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
              {oversikt?.ingenInnsendteMeldekort}
            </InfoCard.Message>
          </InfoCard>
        )}
        <div>
          {sortertePerioder.map((perioder) => {
            const nyestePeriode = perioder[0];
            const statusColor =
              nyestePeriode.status === "Innsendt"
                ? "info"
                : nyestePeriode.status === "Ferdig"
                  ? "success"
                  : nyestePeriode.status === "Feilet"
                    ? "danger"
                    : "neutral";

            return (
              <Accordion key={nyestePeriode.periode.fraOgMed}>
                <Accordion.Item>
                  <Accordion.Header className={innsendtStyles.innsendtAccordionHeader}>
                    <div className={innsendtStyles.innsendtPeriodeHeader}>
                      <BodyShort weight="semibold">
                        {grunntekster?.uke}{" "}
                        {formaterPeriodeTilUkenummer(
                          nyestePeriode.periode.fraOgMed,
                          nyestePeriode.periode.tilOgMed,
                        )}
                      </BodyShort>
                      <Detail className={innsendtStyles.innsendtPeriodeDato}>
                        {formaterPeriodeDato(
                          nyestePeriode.periode.fraOgMed,
                          nyestePeriode.periode.tilOgMed,
                          locale,
                        )}
                      </Detail>
                    </div>
                    <Tag variant="moderate" data-color={statusColor} size="xsmall">
                      {nyestePeriode.status === "Innsendt"
                        ? (oversikt?.meldekortStatus.innsendt ?? "Innsendt")
                        : nyestePeriode.status === "Ferdig"
                          ? (oversikt?.meldekortStatus.ferdigBehandlet ?? "Ferdig behandlet")
                          : nyestePeriode.status === "Feilet"
                            ? (oversikt?.meldekortStatus.feilVedBehandling ?? "Feil ved behandling")
                            : nyestePeriode.status === "Endret"
                              ? (meldekortdetaljer?.endret ?? "Endret")
                              : nyestePeriode.status === "TilUtfylling"
                                ? "Til utfylling"
                                : nyestePeriode.status}
                    </Tag>
                  </Accordion.Header>
                  <Accordion.Content>
                    {perioder.map((periode) => {
                      return (
                        <div
                          key={periode.id}
                          className={classNames(
                            "oppsummering",
                            innsendtStyles.innsendtOppsummering,
                          )}
                        >
                          {(periode.mottattDato || periode.bruttoBelop) && (
                            <div className="my-4">
                              {periode.mottattDato && (
                                <div>
                                  <strong>
                                    {periode.originalId
                                      ? meldekortdetaljer?.endret
                                      : meldekortdetaljer?.sendt}
                                    :{" "}
                                  </strong>
                                  {new Intl.DateTimeFormat(locale).format(
                                    new TZDate(periode.mottattDato, TIDSSONER.OSLO),
                                  )}
                                </div>
                              )}
                              {periode.bruttoBelop !== null && (
                                <div>
                                  <strong>{meldekortdetaljer?.belopUtbetalt}: </strong>
                                  {new Intl.NumberFormat(locale, {
                                    style: "currency",
                                    currency: "NOK",
                                  }).format(periode.bruttoBelop)}
                                </div>
                              )}
                            </div>
                          )}
                          <Kalender
                            key={periode.id}
                            periode={periode}
                            visEndringslenke={periode.kanEndres}
                            aapneModal={() => {}}
                            locale={locale}
                            readonly
                            visDato={false}
                          />
                          <AktivitetOppsummering periode={periode} />
                          <ArbeidssokerstatusBeskjed periode={periode} side="oversikt" />
                        </div>
                      );
                    })}
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion>
            );
          })}
        </div>
      </div>

      <div className={rootStyles.buttonsContainerColumn}>
        {harFlerePerioder ? (
          <ReactLink as="Button" to="/">
            {knapper?.gaaTilNesteMeldekort ?? "Gå til neste meldekort"}
          </ReactLink>
        ) : (
          <Button as="a" href="https://www.nav.no/minside">
            {knapper?.gaaTilMinSide ?? "Gå til Min side"}
          </Button>
        )}
      </div>
    </>
  );
}
