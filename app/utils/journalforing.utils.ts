import { samleHtmlForPeriode } from "./periode.utils";
import type { TypedObject } from "@portabletext/types";
import type { SubmitFunction } from "@remix-run/react";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

export function useAddHtml({
  rapporteringsperioder,
  periode,
  getAppText,
  getRichText,
  submit,
}: {
  rapporteringsperioder: IRapporteringsperiode[];
  periode: IRapporteringsperiode;
  getAppText: (textId: string) => string;
  getRichText: (textId: string) => TypedObject | TypedObject[];
  submit: SubmitFunction;
}) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const html = samleHtmlForPeriode(rapporteringsperioder, periode, getAppText, getRichText);
    formData.set("_html", html);
    formData.set("_action", "send-inn");

    submit(formData, { method: "post" });
  };
}
