import { describe, it, expect } from "vitest";
import { parseAsYear } from "./parsing";

describe("parseAsYear", () => {
  it.each([
    ["2027", 2027],
    [2027, 2027],
    [" 2027 ", 2027],
  ])("parses %j", (value, expected) => {
    expect(parseAsYear(value)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    "",
    "27",
    "20271",
    "0000",
    "-2027",
    "2027.5",
    "abcd",
    "2027', NULL); DROP TABLE mal_licence; --",
  ])("rejects %j", (value) => {
    expect(parseAsYear(value)).toBeUndefined();
  });
});
