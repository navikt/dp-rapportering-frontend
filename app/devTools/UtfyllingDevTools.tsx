import { Scenerio } from "./Scenerio";
import { SandboxIcon } from "@navikt/aksel-icons";
import { Button, Heading, Modal, Tooltip } from "@navikt/ds-react";
import { useNavigate } from "@remix-run/react";
import { useRef } from "react";

export enum UtfyllingScenerioType {
  enkelt = "enkelt",
  flere = "flere",
  reset = "reset",
}
interface IScenerio {
  type: UtfyllingScenerioType;
  tittel: string;
}

const scenerios: IScenerio[] = [
  {
    type: UtfyllingScenerioType.enkelt,
    tittel: "Enkelt periode",
  },
  {
    type: UtfyllingScenerioType.flere,
    tittel: "Flere perioder",
  },
];

export function UtfyllingDevTools() {
  const ref = useRef<HTMLDialogElement>(null);

  const navigate = useNavigate();

  const handleChangeScenerio = (scenerioType: UtfyllingScenerioType) => {
    ref.current?.close();
    navigate(`/?scenerio=${scenerioType}`);
  };

  const handleResetScenerio = () => {
    ref.current?.close();
    navigate("/?scenerio=reset");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip content="Verktøy for testing" style={{}}>
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
              Rapporteringsperioder
            </Heading>
            {scenerios.map((scenerio) => {
              return (
                <Scenerio
                  key={scenerio.type}
                  tittel={scenerio.tittel}
                  onClick={() => handleChangeScenerio(scenerio.type)}
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
              <Button size="medium" variant="secondary" onClick={handleResetScenerio}>
                Reset testdata
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
