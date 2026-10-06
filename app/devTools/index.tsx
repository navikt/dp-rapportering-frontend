import { ArrowsCirclepathIcon, SandboxIcon } from "@navikt/aksel-icons";
import { Button, Modal, Tooltip } from "@navikt/ds-react";
import { useState } from "react";

import { getEnv } from "~/utils/env.utils";

import { Scenario } from "./Scenario";

export enum ScenarioType {
  ingen = "ingen",
  en = "en",
  to = "to",
  reset = "reset",
  fremtidig = "fremtidig",
  innsendte = "innsendte",
  manuelt = "manuelt",
  etterregistrert = "etterregistrert",
  ikkeAnsvar = "ikkeAnsvar",
  bokmerket = "bokmerket",
  arena = "arena",
}
interface IScenario {
  type: ScenarioType;
  tittel: string;
}

const scenarios: IScenario[] = [
  {
    type: ScenarioType.ingen,
    tittel: "Ingen meldekort",
  },
  {
    type: ScenarioType.fremtidig,
    tittel: "Fremtidig meldekort",
  },
  {
    type: ScenarioType.en,
    tittel: "Ett meldekort",
  },
  {
    type: ScenarioType.to,
    tittel: "To meldekort",
  },
  {
    type: ScenarioType.innsendte,
    tittel: "Har innsendte meldekort",
  },
  {
    type: ScenarioType.manuelt,
    tittel: "Manuelt regisrerte meldekort",
  },
  {
    type: ScenarioType.etterregistrert,
    tittel: "Etterregistrert meldekort",
  },
  {
    type: ScenarioType.ikkeAnsvar,
    tittel: "Meldekort – vi har ikke ansvar for bruker",
  },
  {
    type: ScenarioType.bokmerket,
    tittel: "Bokmerket meldekort (Innsendt)",
  },
  {
    type: ScenarioType.arena,
    tittel: "Arena meldekort",
  },
];

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip content="Scenario-velger">
          <Button
            data-color="neutral"
            type="button"
            onClick={() => setIsOpen(true)}
            icon={<SandboxIcon title="Åpne scenarioer-velgeren" />}
            variant="tertiary"
          />
        </Tooltip>
      </div>
      <div>
        <Modal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          header={{ heading: "Scenarioer" }}
          style={{
            height: "100%",
            left: "auto",
            right: "1rem",
          }}
          width={400}
        >
          <Modal.Body>
            <form method="post" action={`${getEnv("BASE_PATH")}/demo/scenario`}>
              {scenarios.map((scenario) => {
                return (
                  <Scenario key={scenario.type} tittel={scenario.tittel} type={scenario.type} />
                );
              })}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "2rem",
                }}
              >
                <Button
                  type="submit"
                  name="type"
                  value={ScenarioType.reset}
                  size="medium"
                  variant="secondary"
                  icon={<ArrowsCirclepathIcon aria-hidden />}
                >
                  Tilbakestill testdata
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
