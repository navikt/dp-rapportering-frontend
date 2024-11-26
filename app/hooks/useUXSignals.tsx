import { useEffect } from "react";

export function useUXSignals(ready: boolean) {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://widget.uxsignals.com/embed.js";
    if (ready) {
      document.body.appendChild(script);
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [ready]);
}
