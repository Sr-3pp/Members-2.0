import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick, ref } from "vue";
import SearchWizzard from "../../app/components/Search/Wizzard.vue";
import { SEARCH_PAGE_SIZE } from "../../app/utils/entitySearch";

const { searchByCategory, state } = vi.hoisted(() => ({
  searchByCategory: vi.fn(),
  state: { members: [] as Array<{ _id: string }> },
}));
mockNuxtImport("useEntitySearch", () => () => ({ searchByCategory }));
mockNuxtImport("useCountries", () => () => ({
  options: ref([]),
  loading: ref(false),
  find: () => undefined,
}));

const manyMembers = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    _id: `m${index + 1}`,
    name: `Member ${index + 1}`,
    last_name: "Lovelace",
    email: `member${index + 1}@example.com`,
    range: "afiliado",
    categories: ["consultor"],
    languages: [],
    skills: [],
    status: "active",
  }));

// Serves pages off `state.members` the way the API does: a window plus the total.
const pageFromState = (_target: string, filters: { skip?: number; limit?: number }) => {
  const skip = filters.skip ?? 0;
  const limit = filters.limit ?? 20;
  return Promise.resolve({
    items: state.members.slice(skip, skip + limit),
    total: state.members.length,
    skip,
    limit,
  });
};

// Drives the wizard the way the landing page does: through its exposed method.
const WizardHost = defineComponent({
  setup() {
    const wizard = ref<{ search: (request: object) => Promise<void> } | null>(null);
    return { wizard, search: (request: object) => wizard.value!.search(request) };
  },
  render() {
    return h(SearchWizzard, { ref: "wizard" });
  },
});

const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
};

beforeEach(() => {
  searchByCategory.mockImplementation(pageFromState);
  vi.stubGlobal("$fetch", vi.fn(() => Promise.resolve([])));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

interface Element {
  text(): string;
  trigger(event: string): Promise<void>;
}
interface Wrapper {
  findAll(selector: string): Element[];
}
const results = (wrapper: Wrapper) => wrapper.findAll('[data-testid="search-results"] > li');
const buttonLabelled = (wrapper: Wrapper, label: string) =>
  wrapper.findAll("button").find((button) => button.text().trim() === label);

describe("search wizard pagination", () => {
  it("asks the server for one page and reveals the next on demand", async () => {
    const total = SEARCH_PAGE_SIZE * 2 + 2;
    state.members = manyMembers(total);
    const wrapper = await mountSuspended(SearchWizzard);

    await buttonLabelled(wrapper, "Consultor")!.trigger("click");
    await settle();

    expect(searchByCategory).toHaveBeenLastCalledWith(
      "consultor",
      expect.objectContaining({ skip: 0, limit: SEARCH_PAGE_SIZE }),
    );
    expect(results(wrapper)).toHaveLength(SEARCH_PAGE_SIZE);
    expect(results(wrapper)[0]!.text()).toContain("Member 1");

    await buttonLabelled(wrapper, "Ver más")!.trigger("click");
    await settle();

    expect(searchByCategory).toHaveBeenLastCalledWith(
      "consultor",
      expect.objectContaining({ skip: SEARCH_PAGE_SIZE, limit: SEARCH_PAGE_SIZE }),
    );
    expect(results(wrapper)).toHaveLength(SEARCH_PAGE_SIZE * 2);

    await buttonLabelled(wrapper, "Ver más")!.trigger("click");
    await settle();

    expect(results(wrapper)).toHaveLength(total);
    expect(buttonLabelled(wrapper, "Ver más")).toBeUndefined();
    wrapper.unmount();
  });

  it("hides the load-more button when everything fits on one page", async () => {
    state.members = manyMembers(SEARCH_PAGE_SIZE);
    const wrapper = await mountSuspended(SearchWizzard);

    await buttonLabelled(wrapper, "Consultor")!.trigger("click");
    await settle();

    expect(results(wrapper)).toHaveLength(SEARCH_PAGE_SIZE);
    expect(buttonLabelled(wrapper, "Ver más")).toBeUndefined();
    wrapper.unmount();
  });

  it("starts over from the first page when the category changes", async () => {
    state.members = manyMembers(SEARCH_PAGE_SIZE * 3);
    const wrapper = await mountSuspended(SearchWizzard);

    await buttonLabelled(wrapper, "Consultor")!.trigger("click");
    await settle();
    await buttonLabelled(wrapper, "Ver más")!.trigger("click");
    await settle();
    expect(results(wrapper)).toHaveLength(SEARCH_PAGE_SIZE * 2);

    await buttonLabelled(wrapper, "Coach")!.trigger("click");
    await settle();

    expect(searchByCategory).toHaveBeenLastCalledWith(
      "coach",
      expect.objectContaining({ skip: 0, limit: SEARCH_PAGE_SIZE }),
    );
    expect(results(wrapper)).toHaveLength(SEARCH_PAGE_SIZE);
    wrapper.unmount();
  });

  it("runs a landing-form search without a category against every member", async () => {
    state.members = manyMembers(2);
    const wrapper = await mountSuspended(WizardHost);

    await wrapper.vm.search({ name: "Member", country: "MX" });
    await settle();

    expect(searchByCategory).toHaveBeenLastCalledWith(
      "members",
      expect.objectContaining({ name: "Member", country: "MX", skip: 0 }),
    );
    expect(results(wrapper)).toHaveLength(2);
    wrapper.unmount();
  });
});
