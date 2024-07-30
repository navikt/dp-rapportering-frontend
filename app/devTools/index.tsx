import { Scenerio } from "./Scenerio";
import { ArrowsCirclepathIcon, SandboxIcon } from "@navikt/aksel-icons";
import { Button, Heading, Modal, Tooltip } from "@navikt/ds-react";
import { useFetcher } from "@remix-run/react";
import { useRef } from "react";
import { INetworkResponse } from "~/utils/types";

export enum ScenerioType {
  ingen = "ingen",
  en = "en",
  to = "to",
  reset = "reset",
}
interface IScenerio {
  type: ScenerioType;
  tittel: string;
}

const scenerios: IScenerio[] = [
  {
    type: ScenerioType.ingen,
    tittel: "Ingen perioder",
  },
  {
    type: ScenerioType.en,
    tittel: "Én periode",
  },
  {
    type: ScenerioType.to,
    tittel: "To perioder",
  },
];

export function DevTools() {
  const fetcher = useFetcher<INetworkResponse>();
  const ref = useRef<HTMLDialogElement>(null);

  const changeHandler = (type: ScenerioType) => {
    fetcher.submit({ type }, { method: "post", action: "demo/scenerio" });
    ref.current?.close();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip content="Verktøy for testing">
          <Button
            onClick={() => ref.current?.showModal()}
            icon={<SandboxIcon title="Åpne testdataverktøy" />}
            variant="tertiary-neutral"
          />
        </Tooltip>
      </div>
      <div>
        <Modal
          ref={ref}
          header={{ heading: "Testdataverktøy" }}
          style={{
            height: "100%",
            left: "auto",
          }}
          width={400}
        >
          <Modal.Body>
            <hr />
            <Heading level="2" size="small">
              Scenerio:
            </Heading>
            <fetcher.Form method="post" onSubmit={(e) => e.preventDefault()}>
              {scenerios.map((scenerio) => {
                return (
                  <Scenerio
                    key={scenerio.type}
                    tittel={scenerio.tittel}
                    onClick={() => changeHandler(scenerio.type)}
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
                  onClick={() => changeHandler(ScenerioType.reset)}
                  icon={<ArrowsCirclepathIcon aria-hidden />}
                >
                  Reset testdata
                </Button>
              </div>
            </fetcher.Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
