import { getEnv } from "~/utils/env.utils";

export const sanityConfig = {
  dataset: getEnv("SANITY_DATASETT") || "production",
  projectId: "rt6o382n",
  useCdn: true,
  token: "",
  apiVersion: "2022-03-07",
};
