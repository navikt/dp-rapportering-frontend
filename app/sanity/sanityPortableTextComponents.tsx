export function getSanityPortableTextComponents(replaceWithValue: {
  [key: string]: string | number;
}) {
  return {
    types: {
      dynamicFieldReference: ({
        value,
      }: {
        value: { dynamiskFelt: { textId: string; type: string } };
      }) => {
        return replaceWithValue[value.dynamiskFelt.textId] ?? value.dynamiskFelt.textId;
      },
    },
  };
}
