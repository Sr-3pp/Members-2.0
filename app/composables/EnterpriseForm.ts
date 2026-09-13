import type { Enterprise } from "~~/shared/types/entities";
import {
  createFormSkills,
  createFormSocial,
  buildProfilePayload,
} from "~~/utils/forms";
import { enterpriseFormSchema as schema } from "~~/utils/formSchemas";
import { countryOptions } from "~~/utils/formOptions";

export const useEnterpriseForm = (
  initial: Enterprise | undefined,
  onSubmitted: () => void,
) => {
  const form = reactive({
    folio: initial?.folio ?? "",
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    pictureFile: null as File | null,
    picture: initial?.picture ?? "",
    social: createFormSocial(initial?.social),
    countryCode: initial?.country?.code ?? "",
    city: initial?.city ?? "",
    nationality: initial?.nationality ?? "",
    description: initial?.description ?? "",
    resume: initial?.resume ?? "",
    skills: createFormSkills(initial?.skills),
    status: initial?.status ?? "active",
  });

  const {
    submitting,
    onSubmit,
    onPickImage: onPickPicture,
  } = useEntityForm({
    endpoint: "/api/enterprises",
    initialId: initial?._id,
    imageFile: toRef(form, "pictureFile"),
    imageUrl: toRef(form, "picture"),
    buildPayload: () => buildProfilePayload(form),
    onSubmitted,
  });

  return {
    form,
    schema,
    submitting,
    onSubmit,
    onPickPicture,
    countryOptions,
  };
};
