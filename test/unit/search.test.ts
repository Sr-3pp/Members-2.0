import { describe, expect, it } from "vitest";
import {
  accentInsensitivePattern,
  escapeRegex,
  normalizeSearchFilters,
  searchPage,
  textSearchConditions,
} from "../../server/utils/search";
import { queryInteger } from "../../server/utils/request";

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

describe("search pagination", () => {
  it("reads whole numbers off the query string and falls back otherwise", () => {
    expect(queryInteger("12", 0)).toBe(12);
    expect(queryInteger("6.9", 0)).toBe(6);
    expect(queryInteger("-3", 0)).toBe(-3);
    expect(queryInteger("abc", 7)).toBe(7);
    expect(queryInteger(undefined, 7)).toBe(7);
    expect(queryInteger(["6"], 7)).toBe(7);
  });

  it("keeps the page window inside the server bounds", () => {
    expect(normalizeSearchFilters({})).toMatchObject({ skip: 0, limit: 20 });
    expect(normalizeSearchFilters({ skip: -4 }).skip).toBe(0);
    expect(normalizeSearchFilters({ skip: 18, limit: 6 })).toMatchObject({ skip: 18, limit: 6 });
    expect(normalizeSearchFilters({ limit: 0 }).limit).toBe(1);
    expect(normalizeSearchFilters({ limit: 500 }).limit).toBe(100);
  });

  it("returns the window together with the total match count", async () => {
    const page = await searchPage(
      async () => ["a", "b"],
      async () => 14,
      { skip: 6, limit: 2 },
    );
    expect(page).toEqual({ items: ["a", "b"], total: 14, skip: 6, limit: 2 });
  });
});
