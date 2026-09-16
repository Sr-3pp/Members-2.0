import { afterEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import MemberForm from "../../app/components/Member/Form.vue";
import EnterpriseForm from "../../app/components/Enterprise/Form.vue";
import ProgramForm from "../../app/components/Program/Form.vue";

mockNuxtImport("useToast", () => () => ({ add: vi.fn() }));
afterEach(() => vi.unstubAllGlobals());

// Search endpoints answer with a page, every other endpoint with a plain list.
const emptyPage = { items: [], total: 0, skip: 0, limit: 20 };
const stubFetch = () =>
  vi.stubGlobal("$fetch", vi.fn((url: string) =>
    Promise.resolve(String(url).includes("/search") ? emptyPage : []),
  ));

const forms = [
  { name: "member", component: MemberForm, initial: { _id: "m1", name: "Ada", email: "ada@example.com", status: "pending" } },
  { name: "enterprise", component: EnterpriseForm, initial: { _id: "e1", name: "Acme", status: "active" } },
  { name: "program", component: ProgramForm, initial: { _id: "p1", title: "Training", length: 3, status: "active" } },
] as const;

describe("entity forms share the same building blocks", () => {
  it.each(forms)("renders the shared fields for a $name and emits cancel", async ({ component, initial, name }) => {
    stubFetch();
    const wrapper = await mountSuspended(component, { props: { initial: initial as never } });
    const text = wrapper.text();

    expect(text).toContain(`Update ${name}`);
    expect(text).toContain("Cancel");
    expect(wrapper.find('[aria-label="Active status"]').exists()).toBe(true);
    expect(text).toContain(initial.status.charAt(0).toUpperCase() + initial.status.slice(1));
    expect(wrapper.findAll('input[type="file"]')).toHaveLength(1);
    // Every form exposes the editable skill rows.
    expect(wrapper.findAll('[aria-label="Level 10"]').length).toBeGreaterThan(0);
    if (name !== "program") expect(text).toContain("Social");

    const cancel = wrapper.findAll("button").find((button) => button.text() === "Cancel");
    expect(cancel).toBeDefined();
    await cancel!.trigger("click");
    expect(wrapper.emitted("cancel")).toHaveLength(1);
    wrapper.unmount();
  });

  it("offers a label for every member category option", async () => {
    stubFetch();
    const wrapper = await mountSuspended(MemberForm);
    for (const label of ["Consultor", "Coach", "Capacitador", "Certificaciones especiales"]) {
      expect(wrapper.text()).toContain(label);
    }
    expect(wrapper.text()).toContain("Create member");
    wrapper.unmount();
  });
});
