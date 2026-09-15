import { bundledCountries } from "../../server/utils/countries";
import { describe, expect, it } from "vitest";
import {
  buildCountryList,
  findCountry,
  flagUrl,
  toCountry,
} from "../../shared/utils/countries";
import { ZONES } from "../../shared/utils/zones";

describe("country list", () => {
  it("bundles every country with a lowercase unique code and a known zone", () => {
    expect(bundledCountries.length).toBeGreaterThan(240);
    const codes = bundledCountries.map((country) => country.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const country of bundledCountries) {
      expect(country.code).toMatch(/^[a-z]{2}$/);
      expect(ZONES).toContain(country.zone);
    }
    for (const zone of ZONES) {
      expect(bundledCountries.some((country) => country.zone === zone), zone).toBe(true);
    }
    expect(findCountry(bundledCountries, "MX")).toMatchObject({ label: "Mexico", zone: "North America" });
    expect(findCountry(bundledCountries, "gt")).toMatchObject({ zone: "Central America" });
  });

  it("merges provider names with known zones and drops the rest", () => {
    const names = { "us-ca": "California", eu: "European Union", mx: "Mexico", ar: "Argentina", zz: "" };
    const zones = { mx: "North America", ar: "South America", zz: "Asia" } as const;
    expect(buildCountryList(names, zones)).toEqual([
      { code: "ar", label: "Argentina", zone: "South America" },
      { code: "mx", label: "Mexico", zone: "North America" },
    ]);
  });

  it("stores flags through the app cache route", () => {
    expect(flagUrl("MX")).toBe("/api/flags/mx.svg");
    expect(toCountry({ code: "es", label: "Spain", zone: "Europe" })).toEqual({
      code: "es", name: "Spain", flag: "/api/flags/es.svg", zone: "Europe",
    });
  });
});
