import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import CountryFlag from "../../app/components/CountryFlag.vue";

describe("CountryFlag", () => {
  it("renders a plain image pointing at the cached flag route", async () => {
    const wrapper = await mountSuspended(CountryFlag, {
      props: { country: { code: "MX", name: "Mexico", flag: "https://flagcdn.com/mx.svg", zone: "North America" } },
    });
    const img = wrapper.find("img");
    // A provider URL in the record is ignored in favour of the local cache, and
    // the src must never be rewritten to an IPX path.
    expect(img.attributes("src")).toBe("/api/flags/mx.svg");
    expect(img.attributes("alt")).toBe("Flag of Mexico");
    expect(wrapper.html()).not.toContain("/_ipx/");
    wrapper.unmount();
  });

  it("renders nothing without a country", async () => {
    const wrapper = await mountSuspended(CountryFlag, { props: { country: null } });
    expect(wrapper.find("img").exists()).toBe(false);
    wrapper.unmount();
  });
});
