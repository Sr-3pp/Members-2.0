import { afterEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, ref } from "vue";
import { useEntityForm } from "../../app/composables/EntityForm";

const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }));
mockNuxtImport("useToast", () => () => ({ add: addToast }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function setupForm(initialId?: string, file: File | null = null) {
  const onSubmitted = vi.fn();
  const imageUrl = ref("/existing.webp");
  let form!: ReturnType<typeof useEntityForm>;
  const wrapper = await mountSuspended(defineComponent({
    setup() {
      form = useEntityForm({
        endpoint: "/api/members", initialId, imageFile: ref(file), imageUrl,
        buildPayload: () => ({ name: "Ada", picture: imageUrl.value }), onSubmitted,
      });
      return () => h("div");
    },
  }));
  return { form, onSubmitted, wrapper };
}

describe("shared entity form submission", () => {
  it.each([undefined, "member-1"])("saves with the correct method for id %s", async (id) => {
    const fetch = vi.fn().mockResolvedValue({});
    vi.stubGlobal("$fetch", fetch);
    const { form, onSubmitted, wrapper } = await setupForm(id);
    await form.onSubmit();
    expect(fetch).toHaveBeenCalledWith(id ? `/api/members/${id}` : "/api/members", {
      method: id ? "PATCH" : "POST", body: { name: "Ada", picture: "/existing.webp" },
    });
    expect(onSubmitted).toHaveBeenCalledOnce();
    expect(form.submitting.value).toBe(false);
    wrapper.unmount();
  });

  it("uploads the image before saving its URL", async () => {
    const fetch = vi.fn().mockResolvedValueOnce("/uploaded.webp").mockResolvedValueOnce({});
    vi.stubGlobal("$fetch", fetch);
    const { form, wrapper } = await setupForm(undefined, new File(["image"], "image.webp"));
    await form.onSubmit();
    expect(fetch).toHaveBeenNthCalledWith(1, "/api/uploads/picture", { method: "POST", body: expect.any(FormData) });
    expect(fetch).toHaveBeenNthCalledWith(2, "/api/members", {
      method: "POST", body: { name: "Ada", picture: "/uploaded.webp" },
    });
    wrapper.unmount();
  });

  it("keeps failed saves open, clears loading and allows retry", async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error("Save failed")).mockResolvedValueOnce({});
    vi.stubGlobal("$fetch", fetch);
    const { form, onSubmitted, wrapper } = await setupForm("member-1");
    await form.onSubmit();
    expect(onSubmitted).not.toHaveBeenCalled();
    expect(form.submitting.value).toBe(false);
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "error" }));
    await form.onSubmit();
    expect(onSubmitted).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
