import { TypedObject } from "@portabletext/types";
import { ISanityLink } from "~/sanity/sanity.types";

// import { Rapporteringstype } from "~/utils/types";

interface QuestionSection {
  /** Has the question been answered? */
  completed: boolean;
  /** The question */
  label?: string;
  /** A description for the question */
  description?: string;
  /** If the value is provided from another object, give the value's path with a dot separated string,
   * i.e. "content.value" for { content: { value: "..." } } */
  getValueFrom?: string;
}

interface RichTextSection {
  type: "rich-text";
  value: TypedObject | TypedObject[];
}

interface AddSectionAction {
  action: "add-section";
  offset: number;
  value: ButtonSection | RadioGroupSection | AlertSection;
}

export interface StringLabel {
  type: "string";
  value: string;
}

export interface RichTextLabel {
  type: "rich-text";
  value: TypedObject | TypedObject[];
}

interface AlertSection {
  type: "alert";
  variant: "info" | "warning";
  title?: StringLabel | RichTextLabel;
  sections?: Section[];
}

interface Radio {
  label: StringLabel | RichTextLabel;
  value: string;
  onSelected: AddSectionAction;
}

interface RadioGroupSection extends QuestionSection {
  type: "radio-group";
  /** The radio group's value */
  value: string;
  options: Radio[];
}

interface Checkbox {
  label: StringLabel | RichTextLabel;
  value: string;
}

interface CheckboxGroupSection extends QuestionSection {
  type: "checkbox-group";
  value: string[];
  disabled?: boolean;
  options: Checkbox[];
}

interface ReadMoreSection {
  type: "read-more";
  value: StringLabel | RichTextLabel;
  header: StringLabel | RichTextLabel;
}

interface ToEnable {
  sectionId: string;
  value: string;
  type: string;
}

interface ButtonSection {
  type: "button";
  id: string;
  text: string;
  action: string;
  disabled?: boolean;
  toEnable: ToEnable;
} // This must be part of a section

interface LinkSection {
  type: "link";
  id: string;
  text: string;
  url: string;
  description?: string;
} // This must be part of a section

interface HeadingSection {
  type: "heading";
  value: StringLabel;
}

export interface Section {
  id: string;
  content:
    | AlertSection
    | RichTextSection
    | RadioGroupSection
    | CheckboxGroupSection
    | ReadMoreSection
    | ButtonSection
    | HeadingSection
    | LinkSection;
}

interface Page {
  id: string;
  title: string;
  url: string;
  sections: Section[];
}

export function pages({
  getAppText,
  getRichText,
  getLink,
}: {
  getAppText: (textId: string) => string;
  getRichText: (textId: string) => TypedObject | TypedObject[];
  getLink: (linkId: string) => ISanityLink;
}): Page[] {
  return [
    {
      id: "rapportering",
      title: getAppText("rapportering-tittel"),
      url: "/",
      sections: [
        {
          id: "rapportering-innledning",
          content: {
            type: "rich-text",
            value: getRichText("rapportering-innledning"),
          },
        },
        {
          id: "rapportering-les-mer",
          content: {
            type: "read-more",
            value: {
              type: "rich-text",
              value: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold"),
            },
            header: {
              type: "string",
              value: getAppText("rapportering-les-mer-hva-skal-rapporteres-tittel"),
            },
          },
        },
        {
          id: "bekreft-samtykke",
          content: {
            type: "alert",
            variant: "warning",
            sections: [
              {
                id: "bekreft-samtykke-informasjon",
                content: {
                  type: "rich-text",
                  value: getRichText("bekreft-samtykke-informasjon"),
                },
              },
              {
                id: "bekreft-samtykke-radio-knapp",
                content: {
                  completed: false,
                  type: "checkbox-group",
                  value: [],
                  options: [
                    {
                      value: "true",
                      label: {
                        type: "string",
                        value: getAppText("bekreft-samtykke-radio-knapp-ja"),
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "rapportering-til-utfylling",
          content: {
            type: "button",
            disabled: true,
            toEnable: {
              sectionId: "#bekreft-samtykke.content.sections[].#bekreft-samtykke-radio-knapp",
              value: "true",
              type: "includes",
            },
            id: "1",
            text: getLink("rapportering-til-utfylling").linkText,
            action: "1",
          },
        },
        {
          id: "rapportering-til-utfylling",
          content: {
            type: "link",
            id: "1",
            text: getLink("rapportering-se-og-endre").linkText,
            url: getLink("rapportering-se-og-endre").linkUrl,
          },
        },
      ],
    },
    // {
    //   id: "rapportering",
    //   title: getAppText("rapportering-tittel"),
    //   url: "/",
    //   sections: [
    //     {
    //       id: "rapportering-innledning",
    //       content: {
    //         type: "rich-text",
    //         value: getRichText("rapportering-innledning"),
    //       },
    //     },
    //     {
    //       id: "rapportering-hva-vil-du-melde",
    //       content: {
    //         type: "radio-group",
    //         completed: false,
    //         value: "",
    //         getValueFrom: "rapporteringstype",
    //         label: getAppText("rapportering-rapporter-navarende-tittel"),
    //         description: "Uke 35 - 36 (26.08.2024 - 08.09.2024)",
    //         options: [
    //           {
    //             value: Rapporteringstype.harAktivitet,
    //             label: { type: "string", value: getAppText("rapportering-noe-å-rapportere") },
    //             onSelected: {
    //               action: "add-section",
    //               offset: 1,
    //               value: {
    //                 type: "button",
    //                 id: "1",
    //                 text: getLink("rapportering-rapporter-for-perioden").linkText,
    //                 action: "1",
    //               },
    //             },
    //           },
    //           {
    //             value: Rapporteringstype.harIngenAktivitet,
    //             label: { type: "rich-text", value: getRichText("rapportering-ingen-å-rapportere") },
    //             onSelected: {
    //               action: "add-section",
    //               offset: 1,
    //               value: {
    //                 type: "radio-group",
    //                 completed: false,
    //                 value: "",
    //                 getValueFrom: "registrertArbeidssoker",
    //                 label: getAppText("rapportering-arbeidssokerregister-tittel"),
    //                 description: getAppText("rapportering-arbeidssokerregister-subtittel"),
    //                 options: [
    //                   {
    //                     value: "true",
    //                     label: {
    //                       type: "string",
    //                       value: getAppText("rapportering-arbeidssokerregister-svar-ja"),
    //                     },
    //                     onSelected: {
    //                       action: "add-section",
    //                       offset: 1,
    //                       value: {
    //                         type: "alert",
    //                         variant: "info",
    //                         title: {
    //                           type: "string",
    //                           value: getAppText(
    //                             "rapportering-arbeidssokerregister-alert-tittel-registrert"
    //                           ),
    //                         },
    //                       },
    //                     },
    //                   },
    //                   {
    //                     value: "false",
    //                     label: {
    //                       type: "string",
    //                       value: getAppText("rapportering-arbeidssokerregister-svar-nei"),
    //                     },
    //                     onSelected: {
    //                       action: "add-section",
    //                       offset: 1,
    //                       value: {
    //                         type: "alert",
    //                         variant: "warning",
    //                         sections: [
    //                           {
    //                             id: "rapportering-arbeidssokerregister-alert-tittel",
    //                             content: {
    //                               type: "heading",
    //                               value: {
    //                                 type: "string",
    //                                 value: getAppText(
    //                                   "rapportering-arbeidssokerregister-alert-tittel"
    //                                 ),
    //                               },
    //                             },
    //                           },
    //                           {
    //                             id: "rapportering-arbeidssløkerregister-alert-innhold",
    //                             content: {
    //                               type: "rich-text",
    //                               value: getRichText(
    //                                 "rapportering-arbeidssokerregister-alert-innhold-avregistrert"
    //                               ),
    //                             },
    //                           },
    //                         ],
    //                       },
    //                     },
    //                   },
    //                 ],
    //               },
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // },
  ];
}
