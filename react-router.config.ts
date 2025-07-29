import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  basename: "/arbeid/dagpenger/meldekort",
  routeDiscovery: {
    mode: "lazy",
    manifestPath: "/arbeid/dagpenger/meldekort",
  },
} satisfies Config;
