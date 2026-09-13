import type { Ref } from "vue";
import { compressImageUnder1MB } from "~~/utils/image";
import { uploadFormImage } from "~~/utils/forms";

interface EntityFormOptions {
  endpoint: "/api/members" | "/api/enterprises" | "/api/programs";
  initialId?: string;
  imageFile: Ref<File | null>;
  imageUrl: Ref<string>;
  buildPayload: () => object | Promise<object>;
  onSubmitted: () => void;
}

export const useEntityForm = (options: EntityFormOptions) => {
  const submitting = ref(false);
  const toast = useToast();

  const onPickImage = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      options.imageFile.value = await compressImageUnder1MB(file, {
        maxBytes: 1_000_000,
        maxWidth: 1600,
        maxHeight: 1600,
        mime: "image/webp",
      });
    } catch {
      toast.add({
        title: "Could not prepare image",
        description: "Please try another image.",
        color: "error",
      });
    }
  };

  const onSubmit = async () => {
    if (submitting.value) return;
    submitting.value = true;
    try {
      if (options.imageFile.value) {
        options.imageUrl.value = await uploadFormImage(options.imageFile.value);
      }
      const body = await options.buildPayload();
      await $fetch(
        options.initialId
          ? `${options.endpoint}/${options.initialId}`
          : options.endpoint,
        { method: options.initialId ? "PATCH" : "POST", body },
      );
      options.onSubmitted();
    } catch {
      toast.add({
        title: "Could not save changes",
        description: "Please try again.",
        color: "error",
      });
    } finally {
      submitting.value = false;
    }
  };

  return { submitting, onPickImage, onSubmit };
};
