import { ArrowsCirclepathIcon, SandboxIcon } from "@navikt/aksel-icons";
import { Button, Modal, Tooltip } from "@navikt/ds-react";
import { useFetcher } from "@remix-run/react";
import { useRef } from "react";

import { INetworkResponse } from "~/utils/types";

import { Scenario } from "./Scenario";

export enum ScenarioType {
  ingen = "ingen",
  en = "en",
  to = "to",
  reset = "reset",
  fremtidig = "fremtidig",
  innsendte = "innsendte",
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
];

export function DevTools() {
  const fetcher = useFetcher<INetworkResponse>();
  const ref = useRef<HTMLDialogElement>(null);

  const changeHandler = (type: ScenarioType) => {
    fetcher.submit({ type }, { method: "post", action: "demo/scenario" });
    ref.current?.close();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip content="Scenario-velger">
          <Button
            onClick={() => ref.current?.showModal()}
            icon={<SandboxIcon title="Åpne scenarioer-velgeren" />}
            variant="tertiary-neutral"
          />
        </Tooltip>
      </div>
      <div>
        <Modal
          ref={ref}
          header={{ heading: "Scenarioer" }}
          style={{
            height: "100%",
            left: "auto",
            right: "1rem",
          }}
          width={400}
        >
          <Modal.Body>
            <fetcher.Form method="post" onSubmit={(e) => e.preventDefault()}>
              {scenarios.map((scenario) => {
                return (
                  <Scenario
                    key={scenario.type}
                    tittel={scenario.tittel}
                    onClick={() => changeHandler(scenario.type)}
                  />
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
                  size="medium"
                  variant="secondary"
                  onClick={() => changeHandler(ScenarioType.reset)}
                  icon={<ArrowsCirclepathIcon aria-hidden />}
                >
                  Tilbakestill testdata
                </Button>
              </div>
            </fetcher.Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
