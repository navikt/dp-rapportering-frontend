import { unstable_createRemixStub } from "@remix-run/testing";
import * as React from "react";
import { type PropsWithChildren } from "react";
import type { ActionFunction } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/server-runtime";

interface IProps {
  action?: ActionFunction;
  loader?: LoaderFunction;
}

interface IRemixStubProps {
  path: string;
  Component?: React.ComponentType;
  action?: ActionFunction;
  loader?: LoaderFunction;
}

// Denne er gull når remix dokumentasjon ikke er helt up to date
// https://github.com/remix-run/remix/blob/main/packages/remix-testing/__tests__/stub-test.tsx
export function TestContainer(props: PropsWithChildren<IProps>) {
  const { action, loader, children } = props;

  const RemixStubConfig: IRemixStubProps = {
    action,
    loader,
    path: "/",
    Component() {
      return <>{children}</>;
    },
  };

  const RemixStub = unstable_createRemixStub([RemixStubConfig]);

  return (
    <>
      <RemixStub />
    </>
  );
}
