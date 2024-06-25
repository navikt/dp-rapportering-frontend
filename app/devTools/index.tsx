import { Scenerio } from "./Scenerio";
import { SandboxIcon } from "@navikt/aksel-icons";
import { Button, Heading, Modal, Tooltip } from "@navikt/ds-react";
import { useFetcher } from "@remix-run/react";
import { useRef } from "react";

export enum ScenerioType {
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
    type: ScenerioType.en,
    tittel: "Én periode",
  },
  {
    type: ScenerioType.to,
    tittel: "To perioder",
  },
];

export function DevTools() {
  const fetcher = useFetcher();
  const ref = useRef<HTMLDialogElement>(null);

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
            <fetcher.Form method="post">
              {scenerios.map((scenerio) => {
                return (
                  <Scenerio
                    key={scenerio.type}
                    tittel={scenerio.tittel}
                    value={scenerio.type}
                    onClick={() => ref.current?.close()}
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
                  name="scenerio"
                  size="medium"
                  variant="secondary"
                  value="reset"
                  type="submit"
                  onClick={() => ref.current?.close()}
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
