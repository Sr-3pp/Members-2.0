import { bundledCountries } from "../../server/utils/countries";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildProfilePayload, buildProgramPayload, createFormSkills, createFormSocial, createProfileFormState, resolveFormCountry,
} from "../../utils/forms";
import { memberFormSchema, enterpriseFormSchema } from "../../utils/formSchemas";
import { ZONES, isZone } from "../../shared/utils/zones";

afterEach(() => vi.unstubAllGlobals());

describe("form payloads", () => {
  it("removes UI fields, resolves the country and cleans skills without changing the form", async () => {
    const form = {
      name: "  Ada  ", pictureFile: null, picture: "/picture.webp", countryCode: "MX",
      skills: [{ name: " Leadership ", level: 8 }, { name: "  ", level: 4 }, { name: "Unused", level: 0 }],
    };
    const payload = await buildProfilePayload(form, bundledCountries);
    expect(payload).toEqual({
      name: "Ada", picture: "/picture.webp", skills: [{ name: "Leadership", level: 8 }],
      country: { code: "mx", name: "Mexico", flag: "/api/flags/mx.svg", zone: "North America" },
    });
    expect(form.name).toBe("  Ada  ");
    expect(form.skills).toHaveLength(3);
  });

  it("resolves countries from the provided list, each with an allowed zone", () => {
    expect(ZONES).toEqual([
      "North America", "Central America", "South America", "Africa", "Asia", "Europe", "Australia",
    ]);
    for (const country of bundledCountries) {
      expect(isZone(country.zone), `${country.code} zone "${country.zone}"`).toBe(true);
    }
    expect(resolveFormCountry("ES", bundledCountries)).toEqual({
      code: "es", name: "Spain", flag: "/api/flags/es.svg", zone: "Europe",
    });
    expect(() => resolveFormCountry("ZZ", bundledCountries)).toThrow(/Unknown country code/);
    expect(() => resolveFormCountry("mx", [])).toThrow(/Unknown country code/);
  });

  it("maps program relationships and omits the upload field", () => {
    expect(buildProgramPayload({
      title: " Training ", enterpriseId: "enterprise-1", participants: ["member-1"],
      photoFile: null, skills: [],
    })).toEqual({ title: "Training", enterprise: "enterprise-1", participants: ["member-1"], skills: [] });
    expect(buildProgramPayload({ photoFile: null, enterpriseId: "", skills: [] })).not.toHaveProperty("enterprise");
  });

  it("builds the shared profile state from an existing record or blank defaults", () => {
    const blank = createProfileFormState();
    expect(blank).toMatchObject({
      folio: "", name: "", pictureFile: null, picture: "", countryCode: "", status: "active",
      social: { website: "", fb: "", tw: "", in: "" },
    });
    expect(blank.skills).toHaveLength(5);

    const filled = createProfileFormState({
      _id: "1", name: "Acme", folio: "200001", languages: [], status: "pending",
      country: { code: "es", zone: "Europe" }, social: { website: "https://acme.example" },
      skills: [{ name: "Strategy", level: 9 }],
    });
    expect(filled).toMatchObject({ name: "Acme", folio: "200001", countryCode: "es", status: "pending" });
    expect(filled.social.website).toBe("https://acme.example");
    expect(filled.skills).toEqual([{ name: "Strategy", level: 9 }]);
  });

  it("creates independent editable copies and blank skill rows", () => {
    const skills = [{ name: "Leadership", level: 5 }];
    const social = { website: "https://example.com" };
    createFormSkills(skills)[0]!.name = "Edited";
    createFormSocial(social).website = "Edited";
    expect(skills[0]!.name).toBe("Leadership");
    expect(social.website).toBe("https://example.com");
    const blank = createFormSkills();
    expect(blank).toHaveLength(5);
    blank[0]!.level = 5;
    expect(blank[1]!.level).toBe(0);
  });
});


describe("profile country validation", () => {
  it.each([
    ["member", memberFormSchema],
    ["enterprise", enterpriseFormSchema],
  ] as const)("requires a country selection for a %s", (_, schema) => {
    const countrySchema = schema.shape.countryCode;
    expect(countrySchema.safeParse("").success).toBe(false);
    expect(countrySchema.safeParse("mx").success).toBe(true);
  });
});
