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
        return (
          <strong>
            {replaceWithValue[value.dynamiskFelt.textId] ?? value.dynamiskFelt.textId}
          </strong>
        );
      },
    },
  };
}
