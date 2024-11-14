export function useIsSubmitting({ state }: { state: "submitting" | "idle" | "loading" }): boolean {
  return state !== "idle";
}
