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
