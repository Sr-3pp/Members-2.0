import { describe, expect, it } from "vitest";
import { accentInsensitivePattern, escapeRegex, textSearchConditions } from "../../server/utils/search";

const matches = (query: string, value: string) => new RegExp(accentInsensitivePattern(query), "i").test(value);

describe("accent-insensitive search", () => {
  it("matches stored accents from a plain query and vice versa", () => {
    expect(matches("Maria", "María")).toBe(true);
    expect(matches("María", "Maria")).toBe(true);
    expect(matches("maria", "MARÍA")).toBe(true);
    expect(matches("Muñoz", "munoz")).toBe(true);
    expect(matches("nunez", "Núñez")).toBe(true);
    expect(matches("Jose", "José Ángel")).toBe(true);
  });

  it("still requires the letters to match", () => {
    expect(matches("Mario", "María")).toBe(false);
    expect(matches("Marta", "María")).toBe(false);
  });

  it("keeps regex metacharacters literal", () => {
    expect(matches("a.b", "aXb")).toBe(false);
    expect(matches("a.b", "a.b")).toBe(true);
    expect(matches("(x)", "(x)")).toBe(true);
    expect(accentInsensitivePattern("+")).toBe(escapeRegex("+"));
  });

  it("builds one case-insensitive condition per field", () => {
    expect(textSearchConditions("Ana", ["name", "last_name"])).toEqual([
      { name: { $regex: accentInsensitivePattern("Ana"), $options: "i" } },
      { last_name: { $regex: accentInsensitivePattern("Ana"), $options: "i" } },
    ]);
  });
});
