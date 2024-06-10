import { Scenerio } from "./Scenerio";
import { SandboxIcon } from "@navikt/aksel-icons";
import { Button, Heading, Modal, Tooltip } from "@navikt/ds-react";
import { useNavigate } from "@remix-run/react";
import { useRef } from "react";

export enum ScenerioType {
  UtenAktiviteter = "UtenAktiviteter",
  MedArbeidAktivitet = "MedArbeidAktivitet",
  ArbeidSykFravaer = "ArbeidSykFravaer",
}
interface IScenerio {
  type: ScenerioType;
  tittel: string;
}

const scenerios: IScenerio[] = [
  {
    type: ScenerioType.UtenAktiviteter,
    tittel: "Perioder uten aktivitet",
  },
  {
    type: ScenerioType.MedArbeidAktivitet,
    tittel: "Perioder med arbeid aktivitet",
  },
  {
    type: ScenerioType.ArbeidSykFravaer,
    tittel: "Perioder med arbeid, syk og fravær aktiviteter",
  },
];

export function DevTools() {
  const ref = useRef<HTMLDialogElement>(null);

  const navigate = useNavigate();

  const handleChangeScenerio = (scenerioType: ScenerioType) => {
    ref.current?.close();
    navigate(`/innsendt?scenerio=${scenerioType}`);
  };

  const handleResetScenerio = () => {
    ref.current?.close();
    navigate("/innsendt");
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
        >
          <Modal.Body>
            {/* <Scenerios /> */}
            <hr />
            <Heading level="2" size="small">
              Innsendte perioder
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
