import { DecoratorLocale } from "./dekoratoren.utils";
import { samleHtmlForPeriode } from "./periode.utils";
import type { SubmitFunction } from "@remix-run/react";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { type GetAppText, type GetRichText } from "~/hooks/useSanity";

export function useAddHtml({
  rapporteringsperioder,
  periode,
  getAppText,
  getRichText,
  submit,
  locale,
}: {
  rapporteringsperioder: IRapporteringsperiode[];
  periode: IRapporteringsperiode;
  getAppText: GetAppText;
  getRichText: GetRichText;
  submit: SubmitFunction;
  locale: DecoratorLocale;
}) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const html = samleHtmlForPeriode(
      rapporteringsperioder,
      periode,
      getAppText,
      getRichText,
      locale
    );
    formData.set("_html", html);
    formData.set("_action", "send-inn");

    submit(formData, { method: "post" });
  };
}
