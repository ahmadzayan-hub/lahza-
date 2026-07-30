import { describe, expect, it } from "vitest";
import { en } from "../en";
import { ar } from "../ar";

/** Collect every leaf key path of a nested dictionary. */
function leafPaths(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return leafPaths(v as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe("EN/AR dictionary parity", () => {
  it("Arabic mirrors the exact key structure of English", () => {
    expect(leafPaths(ar as Record<string, unknown>).sort()).toEqual(
      leafPaths(en as Record<string, unknown>).sort()
    );
  });

  it("no leaf translation is empty", () => {
    const check = (obj: Record<string, unknown>, lang: string) => {
      for (const path of leafPaths(obj)) {
        const val = path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], obj);
        if (typeof val === "string") {
          expect(val.trim(), `${lang}:${path} is empty`).not.toBe("");
        }
      }
    };
    check(en as Record<string, unknown>, "en");
    check(ar as Record<string, unknown>, "ar");
  });
});
