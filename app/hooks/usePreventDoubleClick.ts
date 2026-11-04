import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";

/**
 * En hook som beskytter mot dobbeltklikk på knapper,
 * og resetter automatisk når navigering er ferdig.
 */
export function usePreventDoubleClick(): [boolean, () => boolean, () => void] {
  const [harTrykket, setHarTrykket] = useState(false);
  const navigation = useNavigation();
  const forrigeNavigationState = useRef(navigation.state);

  // Reset når navigasjonen er ferdig (tilstand "idle")
  useEffect(() => {
    if (forrigeNavigationState.current !== "idle" && navigation.state === "idle") {
      setHarTrykket(false);
    }
    forrigeNavigationState.current = navigation.state;
  }, [navigation.state]);

  // Kaller denne for å "låse" første klikk
  function trySetHarTrykket(): boolean {
    if (harTrykket) return false;
    setHarTrykket(true);
    return true;
  }

  return [harTrykket, trySetHarTrykket, () => setHarTrykket(false)];
}
