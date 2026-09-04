import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  basename: "/arbeid/dagpenger/meldekort",
  routeDiscovery: { mode: "initial" },
} satisfies Config;
