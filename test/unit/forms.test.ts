import { afterEach, describe, expect, it, vi } from "vitest";
import { buildProfilePayload, buildProgramPayload, createFormSkills, createFormSocial } from "../../utils/forms";

afterEach(() => vi.unstubAllGlobals());

describe("form payloads", () => {
  it("removes UI fields, resolves the country and cleans skills without changing the form", async () => {
    const fetch = vi.fn().mockResolvedValue({
      name: { common: "Mexico" }, flags: { svg: "mexico.svg" }, subregion: "North America",
    });
    vi.stubGlobal("$fetch", fetch);
    const form = {
      name: "  Ada  ", pictureFile: null, picture: "/picture.webp", countryCode: "MX",
      skills: [{ name: " Leadership ", level: 8 }, { name: "  ", level: 4 }, { name: "Unused", level: 0 }],
    };
    const payload = await buildProfilePayload(form);
    expect(payload).toEqual({
      name: "Ada", picture: "/picture.webp", skills: [{ name: "Leadership", level: 8 }],
      country: { code: "mx", name: "Mexico", flag: "mexico.svg", zone: "North America" },
    });
    expect(form.name).toBe("  Ada  ");
    expect(form.skills).toHaveLength(3);
    expect(fetch).toHaveBeenCalledWith("https://restcountries.com/v3.1/alpha/mx?fields=name,flags,subregion");
  });

  it("maps program relationships and omits the upload field", () => {
    expect(buildProgramPayload({
      title: " Training ", enterpriseId: "enterprise-1", participants: ["member-1"],
      photoFile: null, skills: [],
    })).toEqual({ title: "Training", enterprise: "enterprise-1", participants: ["member-1"], skills: [] });
    expect(buildProgramPayload({ photoFile: null, enterpriseId: "", skills: [] })).not.toHaveProperty("enterprise");
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
