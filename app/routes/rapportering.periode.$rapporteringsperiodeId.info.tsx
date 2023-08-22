import { Accordion, BodyLong, Heading, List } from "@navikt/ds-react";

export default function Info() {
  return (
    <>
      <main className="rapportering-kontainer">
        <Heading size={"medium"} level={"2"}>
          Hva skal jeg rapportere til NAV?
        </Heading>
        <BodyLong spacing>
          Her kan du lese om hva du skal rapportere til NAV når du mottar dagpenger. Det er lurt å
          gjøre seg godt kjent med hvordan rapporteringen fungerer.
        </BodyLong>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>Hva må jeg rapportere som arbeid?</Accordion.Header>
            <Accordion.Content>
              <List as="ul" title="Arbeid">
                <List.Item>Alle timer du har jobbet i perioden føres på meldekortet.</List.Item>
                <List.Item>
                  Timene rundes av til nærmeste halve time, er det midt mellom to halve timer,
                  runder du nedover.
                </List.Item>
                <List.Item>
                  Inntektsgivende arbeid skal føres i den perioden arbeidet er utført, selv om
                  inntekten kommer senere.
                </List.Item>
                <List.Item>
                  Får du lønn for flere timer enn du jobbet, skal du føre alle timene du får lønn
                  for.
                </List.Item>
              </List>
              <Heading size="small" level="3">
                Utbetalt lunsj
              </Heading>
              <BodyLong spacing>Regnes ikke som arbeid, skal ikke føres på meldekortet.</BodyLong>
              <Heading size="small" level="3">
                Avspasering
              </Heading>
              <BodyLong spacing>Føres som om du var på jobb.</BodyLong>
              <Heading size="small" level="3">
                Hva regnes som arbeid?
              </Heading>
              <List as="ul" title="">
                <BodyLong spacing>
                  Med «arbeid» mener vi aktivitet som kan gi eller som normalt ville ha vært betalt,
                  som for eksempel:
                </BodyLong>
                <List.Item>arbeid i arbeidsforholdarbeid</List.Item>
                <List.Item>arbeid i eget foretak</List.Item>
                <List.Item>gratisarbeid (for andre) når arbeidet vanligvis er betalt</List.Item>
                <List.Item>
                  timer du får betalt for, også når du ikke jobber alle timene (for eksempel ved
                  akkordarbeid)
                </List.Item>
                <List.Item>provisjonssalg, telefonsalg og liknende</List.Item>
                <List.Item>frilansarbeid</List.Item>
                <List.Item>lønnede verv</List.Item>
                <List.Item>hobbypreget arbeid, «homeparties» og liknende</List.Item>
                <List.Item>omsorgsstønad</List.Item>
              </List>
              <Heading size="small" level="3">
                Fosterforeldre
              </Heading>
              <BodyLong>Du skal ikke føre opp timer som fosterforeldre på meldekortet.</BodyLong>
              <Heading size="small" level="3">
                Etablere egen virksomhet
              </Heading>
              <List as="ul" title="">
                <BodyLong spacing>
                  Har du fått vedtak om at du kan beholde dagpenger under etablering?
                </BodyLong>
                <List.Item>Du skal ikke føre timene du jobber i virksomheten.</List.Item>
              </List>
              <List as="ul" title="">
                <BodyLong spacing>Har du ikke fått vedtak fra NAV?</BodyLong>
                <List.Item>
                  Du skal føre alle timene du jobber i virksomheten, selv om du ikke tar ut lønn og
                  det går med underskudd.
                </List.Item>
              </List>
              <Heading size="small" level="3">
                Formue og skattefri inntekt
              </Heading>
              <List as="ul" title="">
                <BodyLong spacing>
                  Du skal ikke føre opp rene inntekter fra formue, det samme gjelder enkelte
                  skattefrie inntekter utenfor virksomhet. Eksempler er:
                </BodyLong>
                <List.Item>utleie av fast eiendom</List.Item>
                <List.Item>
                  renter, aksjeutbytte og annen avkastning av penger og verdipapir
                </List.Item>
                <List.Item>erskattefri oppussing av egen bolig/fritidsbolig</List.Item>
              </List>
              <Heading size="small" level="3">
                Ulønnet arbeid
              </Heading>
              <List as="ul" title="">
                <BodyLong spacing>
                  Du skal ikke føre opp enkelte former for ulønnet arbeid på meldekortet. Eksempler
                  er:
                </BodyLong>
                <List.Item>
                  ulønnet arbeid, sosiale tjenester og besøkstjenester for funksjonshemmede og eldre
                </List.Item>
                <List.Item>
                  arbeid for humanitære organisasjoner, religiøse organisasjoner, idrettslag og
                  liknende, for arbeid som normalt utføres av medlemmer og frivillige uten
                  godtgjørelse
                </List.Item>
              </List>

              <Heading size="small" level="3">
                Naturalytelser
              </Heading>
              <List as="ul" title="">
                <BodyLong spacing>
                  Naturalytelser er goder som du mottar fra arbeidsgiveren din, som for eksempel
                  telefon eller bil.
                </BodyLong>
                <List.Item>
                  For permitterte: Hvis du har hatt goder i mindre enn tre måneder før du ble
                  permittert, regnes summen av disse godene som timelønn. Antall timer som godene
                  utgjør skal føres som timer med arbeid på meldekortene.
                </List.Item>
              </List>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hva må jeg rapportere av tiltak, kurs og utdanning?</Accordion.Header>
            <Accordion.Content>LEGG INN INNHOLD</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hva gjelder for sykdom?</Accordion.Header>
            <Accordion.Content>LEGG INN INNHOLD</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hvis jeg tar ferie eller har annet fravær?</Accordion.Header>
            <Accordion.Content>LEGG INN INNHOLD</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </main>
    </>
  );
}
