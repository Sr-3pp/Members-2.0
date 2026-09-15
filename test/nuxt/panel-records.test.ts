import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick, ref } from "vue";
import PanelRecords from "../../app/components/Panel/Records.vue";
import { PANEL_PAGE_SIZE } from "../../app/composables/PanelRecords";

const ada = { _id: "m1", name: "Ada", last_name: "Lovelace", email: "ada@example.com", status: "active" };
const { addToast, refresh, state } = vi.hoisted(() => ({
  addToast: vi.fn(),
  refresh: vi.fn(),
  state: { members: [] as object[] },
}));
mockNuxtImport("useToast", () => () => ({ add: addToast }));
mockNuxtImport("useMembers", () => () => ({
  getMembers: () => ({
    data: ref(state.members),
    status: ref("success"),
    error: ref(null),
    refresh,
  }),
}));

beforeEach(() => {
  state.members = [ada];
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

// Modals are teleported to the document body, so look them up there.
const bodyButton = (label: string) =>
  Array.from(document.body.querySelectorAll("button")).find((button) =>
    button.textContent?.trim() === label,
  );
const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
};

describe("panel pagination", () => {
  const manyMembers = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      ...ada, _id: `m${index + 1}`, name: `Member ${index + 1}`, email: `member${index + 1}@example.com`,
    }));
  const rowNames = (wrapper: { findAll: (selector: string) => Array<{ text: () => string }> }) =>
    wrapper.findAll("tbody tr").map((row) => row.text());

  it("shows at most one page of rows and navigates between pages", async () => {
    // Two full pages plus a partial third one.
    const total = PANEL_PAGE_SIZE * 2 + 2;
    const lastPage = Math.ceil(total / PANEL_PAGE_SIZE);
    state.members = manyMembers(total);
    vi.stubGlobal("$fetch", vi.fn());
    const wrapper = await mountSuspended(PanelRecords, { props: { kind: "members" }, attachTo: document.body });

    expect(wrapper.findAll("tbody tr")).toHaveLength(PANEL_PAGE_SIZE);
    expect(rowNames(wrapper)[0]).toContain("Member 1 Lovelace");
    expect(wrapper.text()).toContain(`Showing 1-${PANEL_PAGE_SIZE} of ${total} members`);

    await wrapper.findAll("button").find((button) => button.text() === String(lastPage))!.trigger("click");
    await settle();
    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
    expect(rowNames(wrapper)[0]).toContain(`Member ${total - 1} Lovelace`);
    expect(wrapper.text()).toContain(`Showing ${total - 1}-${total} of ${total} members`);
    wrapper.unmount();
  });

  it("hides the pagination when everything fits on one page", async () => {
    state.members = manyMembers(PANEL_PAGE_SIZE);
    vi.stubGlobal("$fetch", vi.fn());
    const wrapper = await mountSuspended(PanelRecords, { props: { kind: "members" }, attachTo: document.body });

    expect(wrapper.findAll("tbody tr")).toHaveLength(PANEL_PAGE_SIZE);
    expect(wrapper.text()).not.toContain("Showing");
    wrapper.unmount();
  });
});

describe("panel delete confirmation", () => {
  it("asks for confirmation before deleting and closes once done", async () => {
    const fetch = vi.fn().mockResolvedValue({});
    vi.stubGlobal("$fetch", fetch);
    const wrapper = await mountSuspended(PanelRecords, { props: { kind: "members" }, attachTo: document.body });

    await wrapper.find('[aria-label="Delete member"]').trigger("click");
    await settle();
    expect(fetch).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Ada Lovelace");

    bodyButton("Delete member")!.click();
    await settle();
    expect(fetch).toHaveBeenCalledWith("/api/members/m1", { method: "DELETE" });
    expect(refresh).toHaveBeenCalledOnce();
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
    expect(bodyButton("Delete member")).toBeUndefined();
    wrapper.unmount();
  });

  it("does nothing when the confirmation is cancelled", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("$fetch", fetch);
    const wrapper = await mountSuspended(PanelRecords, { props: { kind: "members" }, attachTo: document.body });

    await wrapper.find('[aria-label="Delete member"]').trigger("click");
    await settle();
    bodyButton("Cancel")!.click();
    await settle();

    expect(fetch).not.toHaveBeenCalled();
    expect(bodyButton("Delete member")).toBeUndefined();
    wrapper.unmount();
  });

  it("keeps the confirmation open when the request fails", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("boom"));
    vi.stubGlobal("$fetch", fetch);
    const wrapper = await mountSuspended(PanelRecords, { props: { kind: "members" }, attachTo: document.body });

    await wrapper.find('[aria-label="Delete member"]').trigger("click");
    await settle();
    bodyButton("Delete member")!.click();
    await settle();

    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "error" }));
    expect(refresh).not.toHaveBeenCalled();
    expect(bodyButton("Delete member")).toBeDefined();
    wrapper.unmount();
  });
});
