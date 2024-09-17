import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  Radio,
  RadioGroup,
  ReadMore,
} from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/models/getSession.server";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { getRapporteringstype } from "~/models/rapporteringstype.server";
import { RichTextLabel, Section, StringLabel, pages } from "~/routes/_index/pages";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringstype = await getRapporteringstype(request);
  const session = await getSession(request);
  const rapporteringsperioderResponse = await hentRapporteringsperioder(request);

  if (rapporteringsperioderResponse.ok) {
    const rapporteringsperioder = await rapporteringsperioderResponse.json();
    return json({ rapporteringstype, rapporteringsperioder, session });
  }

  throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
}

function renderTextValue(value: StringLabel | RichTextLabel): JSX.Element | string {
  if (value.type === "rich-text") {
    return <PortableText value={value.value} />;
  }

  return value.value;
}

function renderSection(section: Section) {
  switch (section.content.type) {
    case "rich-text":
      return <PortableText value={section.content.value} />;
    case "radio-group":
      return (
        <RadioGroup
          legend={section.content.label}
          description={section.content.description}
          value={section.content.value}
        >
          {section.content.options.map((option) => (
            <Radio key={option.value} value={option.value}>
              {renderTextValue(option.label)}
            </Radio>
          ))}
        </RadioGroup>
      );
    case "checkbox-group":
      return (
        <CheckboxGroup legend={section.content.label} disabled={section.content.disabled}>
          {section.content.options.map((option) => (
            <Checkbox key={option.value} value={option.value}>
              {renderTextValue(option.label)}
            </Checkbox>
          ))}
        </CheckboxGroup>
      );
    case "read-more":
      return (
        <ReadMore header={renderTextValue(section.content.header)}>
          {renderTextValue(section.content.value)}
        </ReadMore>
      );
    case "button":
      return <Button disabled={section.content.disabled}>{section.content.text}</Button>;
    case "link":
      return (
        <RemixLink className="my-8" as="Link" to={section.content.url}>
          {section.content.text}
        </RemixLink>
      );
    case "alert":
      return (
        <Alert variant={section.content.variant}>
          {section.content.sections?.map((section) => (
            <div key={section.id}>{renderSection(section)}</div>
          ))}
        </Alert>
      );
    default:
      return (
        <Alert variant="error">
          <Heading spacing size="small" level="3">
            {`Du håndterer ikke seksjonstypen "${section.content.type}"`}
          </Heading>
          <p>{JSON.stringify(section, null, 2)}</p>
        </Alert>
      );
  }
}

export default function Demoside() {
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const { getAppText, getRichText, getLink } = useSanity();

  const periode = rapporteringsperioder[0];

  const p = pages({ getAppText, getRichText, getLink });

  const sections = p[0].sections.map((section) => section);

  console.log(periode);

  return (
    <div className="rapportering-container">
      {sections.map((section) => (
        <div key={section.id}>{renderSection(section)}</div>
      ))}
    </div>
  );
}
