import { act, renderHook } from "@testing-library/react";
import { useLayoutEffect } from "react";
import type { Navigation } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { usePreventDoubleClick } from "~/hooks/usePreventDoubleClick";

let navigationState: Navigation["state"] = "idle";

vi.mock("react-router", () => ({
  useNavigation: () => ({ state: navigationState }),
}));

describe("usePreventDoubleClick", () => {
  beforeEach(() => {
    navigationState = "idle";
  });

  test("Beholder klikk-låsen når et klikk skjer før første passive effekt", () => {
    const { result } = renderHook(() => {
      const beskyttelse = usePreventDoubleClick();
      useLayoutEffect(() => {
        beskyttelse[1]();
      }, []);
      return beskyttelse;
    });

    expect(result.current[0]).toBe(true);
  });

  test("Beholder klikk-låsen mens navigasjonen fortsatt er idle", () => {
    const { result, rerender } = renderHook(() => usePreventDoubleClick());

    act(() => {
      expect(result.current[1]()).toBe(true);
    });
    rerender();

    expect(result.current[0]).toBe(true);
    act(() => {
      expect(result.current[1]()).toBe(false);
    });
  });

  test("Nullstiller klikk-låsen når navigasjonen er ferdig", () => {
    const { result, rerender } = renderHook(() => usePreventDoubleClick());

    act(() => {
      result.current[1]();
    });
    navigationState = "loading";
    rerender();
    expect(result.current[0]).toBe(true);

    navigationState = "idle";
    rerender();
    expect(result.current[0]).toBe(false);
  });

  test("Tillater nytt forsøk etter eksplisitt nullstilling", () => {
    const { result } = renderHook(() => usePreventDoubleClick());

    act(() => {
      result.current[1]();
    });
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(false);
    act(() => {
      expect(result.current[1]()).toBe(true);
    });
    expect(result.current[0]).toBe(true);
  });
});
