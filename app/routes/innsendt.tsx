import { TZDate } from "@date-fns/tz";
import { InformationSquareIcon } from "@navikt/aksel-icons";
import { Accordion, BodyShort, Button, Detail, Heading, InfoCard, Tag } from "@navikt/ds-react";
import { setBreadcrumbs as setDekoratorenBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { useEffect } from "react";
import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRouteLoaderData } from "react-router";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { Kalender } from "~/components/kalender/Kalender";
import { PortableTextRenderer } from "~/components/portable-text/PortableTextRenderer";
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
import { IRapporteringsperiodeStatus, TIDSSONER } from "~/utils/types";

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

type StatusColor = "info" | "success" | "danger" | "neutral";

function getStatusColor(status: IRapporteringsperiodeStatus): StatusColor {
  switch (status) {
    case IRapporteringsperiodeStatus.Innsendt:
      return "info";
    case IRapporteringsperiodeStatus.Ferdig:
      return "success";
    case IRapporteringsperiodeStatus.Feilet:
      return "danger";
    default:
      return "neutral";
  }
}

function getStatusLabel(
  status: IRapporteringsperiodeStatus,
  statusTexts:
    | {
        innsendt: string | null;
        ferdigBehandlet: string | null;
        feilVedBehandling: string | null;
        endret: string | null;
        tilUtfylling: string | null;
      }
    | undefined,
) {
  if (!statusTexts) return undefined;

  switch (status) {
    case IRapporteringsperiodeStatus.Innsendt:
      return statusTexts.innsendt;
    case IRapporteringsperiodeStatus.Ferdig:
      return statusTexts.ferdigBehandlet;
    case IRapporteringsperiodeStatus.Feilet:
      return statusTexts.feilVedBehandling;
    case IRapporteringsperiodeStatus.Endret:
      return statusTexts.endret;
    case IRapporteringsperiodeStatus.TilUtfylling:
      return statusTexts.tilUtfylling;
  }
}

export default function InnsendteRapporteringsPerioderSide() {
  const { innsendtPerioder, rapporteringsperioder } = useLoaderData<typeof loader>();
  const { locale } = useLocale();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const grunntekster = rootData?.sanityTekst?.grunntekster;
  const oversikt = rootData?.sanityTekst?.oversikt;
  const knapper = rootData?.sanityTekst?.knapper;
  const meldekortdetaljer = rootData?.sanityTekst?.meldekortdetaljer;

  const antallPerioder = perioderSomKanSendes(rapporteringsperioder).length;
  const harFlerePerioder = antallPerioder >= 1;
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

  return (
    <>
      <div className={rootStyles.pageContent}>
        <Heading size="medium" level="2">
          {oversikt?.tittel}
        </Heading>
        {oversikt?.tekst && <PortableTextRenderer value={oversikt.tekst} />}
        {innsendtPerioder.length === 0 && (
          <InfoCard data-color="info">
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
              {oversikt?.ingenInnsendteMeldekort}
            </InfoCard.Message>
          </InfoCard>
        )}
        <div className={innsendtStyles.innsendtPerioder}>
          {sortertePerioder.map((perioder) => {
            const nyestePeriode = perioder[0];
            const statusColor = getStatusColor(nyestePeriode.status);

            return (
              <Accordion key={nyestePeriode.periode.fraOgMed} data-color="neutral">
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
                      {getStatusLabel(nyestePeriode.status, oversikt?.meldekortStatus)}
                    </Tag>
                  </Accordion.Header>
                  <Accordion.Content>
                    {perioder.map((periode) => (
                      <div key={periode.id} className={innsendtStyles.innsendtOppsummering}>
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
                    ))}
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
            {knapper?.gaaTilNesteMeldekort}
          </ReactLink>
        ) : (
          <Button as="a" href="https://www.nav.no/minside">
            {knapper?.gaaTilMinSide}
          </Button>
        )}
      </div>
    </>
  );
}
