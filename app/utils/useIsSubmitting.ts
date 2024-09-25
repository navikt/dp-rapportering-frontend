import { Navigation } from "@remix-run/react";

export function useIsSubmitting(navigation: Navigation, action: string = "send-inn") {
  return (
    navigation.state !== "idle" &&
    navigation.formData &&
    navigation.formData.get("_action") === action
  );
}
