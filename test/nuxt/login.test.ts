import { afterEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import Login from "../../app/pages/login.vue";

const { login, refresh, navigate } = vi.hoisted(() => ({ login: vi.fn(), refresh: vi.fn(), navigate: vi.fn() }));
mockNuxtImport("useAuth", () => () => ({ login, ready: Promise.resolve(), error: { value: null }, isAdmin: { value: false } }));
mockNuxtImport("navigateTo", () => navigate);
afterEach(() => vi.resetAllMocks());

describe("admin login page", () => {
  it("uses UAuthForm and signs in with the entered credentials", async () => {
    const wrapper = await mountSuspended(Login);
    expect(wrapper.text()).toContain("Admin login");
    await wrapper.find('input[type="email"]').setValue("admin@example.com");
    await wrapper.find('input[type="password"]').setValue("correct-password");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(login).toHaveBeenCalledWith({ email: "admin@example.com", password: "correct-password" });
    expect(navigate).toHaveBeenCalledWith("/panel", { replace: true });
    wrapper.unmount();
  });

  it("shows access-denied errors without navigating", async () => {
    login.mockRejectedValue({ statusCode: 403 });
    const wrapper = await mountSuspended(Login);
    await wrapper.find('input[type="email"]').setValue("member@example.com");
    await wrapper.find('input[type="password"]').setValue("correct-password");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.text()).toContain("Only administrators can access the panel.");
    expect(navigate).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
