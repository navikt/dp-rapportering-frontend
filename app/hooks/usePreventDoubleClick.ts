import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

/**
 * En hook som beskytter mot dobbeltklikk på knapper,
 * og resetter automatisk når navigering er ferdig.
 */
export function usePreventDoubleClick(): [boolean, () => boolean] {
  const [harTrykket, setHarTrykket] = useState(false);
  const navigation = useNavigation();

  // Reset når navigasjonen er ferdig (tilstand "idle")
  useEffect(() => {
    if (navigation.state === "idle") {
      setHarTrykket(false);
    }
  }, [navigation.state]);

  // Kaller denne for å "låse" første klikk
  function trySetHarTrykket(): boolean {
    if (harTrykket) return false;
    setHarTrykket(true);
    return true;
  }

  return [harTrykket, trySetHarTrykket];
}
