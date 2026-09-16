import { afterEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import type { DOMWrapper } from "@vue/test-utils";
import { computed } from "vue";
import Navbar from "~/components/Navbar.vue";

const auth = vi.hoisted(() => ({ isAdmin: false, logout: vi.fn() }));
mockNuxtImport("useAuth", () => () => ({
  isAdmin: computed(() => auth.isAdmin),
  logout: auth.logout,
  ready: Promise.resolve(),
}));
afterEach(() => {
  auth.isAdmin = false;
  vi.resetAllMocks();
});

const mainSiteUrl = useRuntimeConfig().public.mainSiteUrl;
const desktopLinks = (wrapper: Awaited<ReturnType<typeof mountSuspended>>) =>
  wrapper.findAll("nav > ul a").map((a: DOMWrapper<Element>) => ({ label: a.text(), href: a.attributes("href"), target: a.attributes("target") }));

describe("Navbar", () => {
  it("renders the main site links in order and opens them in a new tab", async () => {
    const wrapper = await mountSuspended(Navbar);
    expect(desktopLinks(wrapper)).toEqual([
      { label: "¿Qué es la ICCN?", href: `${mainSiteUrl}/blank-ekhzj`, target: "_blank" },
      { label: "Membresías", href: `${mainSiteUrl}/blank-luchn`, target: "_blank" },
      { label: "Programas", href: `${mainSiteUrl}/b`, target: "_blank" },
      { label: "Miembros", href: "/", target: undefined },
      { label: "Blog", href: `${mainSiteUrl}/blank-1`, target: "_blank" },
      { label: "Contacto", href: `${mainSiteUrl}/formulario`, target: "_blank" },
    ]);
    expect(wrapper.find('button[aria-label="Cerrar sesión"]').exists()).toBe(false);
  });

  it("adds the panel link and sign out for admins", async () => {
    auth.isAdmin = true;
    const wrapper = await mountSuspended(Navbar);
    expect(desktopLinks(wrapper).at(-1)).toEqual({ label: "Panel", href: "/panel", target: undefined });
    await wrapper.find('button[aria-label="Cerrar sesión"]').trigger("click");
    expect(auth.logout).toHaveBeenCalledOnce();
  });
});
