import type { Member } from "~~/shared/types/entities";
import {
  createFormSkills,
  createFormSocial,
  buildProfilePayload,
} from "~~/utils/forms";
import { memberFormSchema as schema } from "~~/utils/formSchemas";
import {
  countryOptions,
  languageOptions,
  categoryOptions,
  rangeOptions,
} from "~~/utils/formOptions";

export const useMemberForm = (
  initial: Member | undefined,
  onSubmitted: () => void,
) => {
  const form = reactive({
    folio: initial?.folio ?? "",
    name: initial?.name ?? "",
    last_name: initial?.last_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    mobile: initial?.mobile ?? "",
    range: initial?.range ?? "afiliado",
    pictureFile: null as File | null,
    picture: initial?.picture ?? "",
    social: createFormSocial(initial?.social),
    countryCode: initial?.country?.code ?? "",
    city: initial?.city ?? "",
    nationality: initial?.nationality ?? "",
    languages: [...(initial?.languages ?? [])],
    education: initial?.education ?? "",
    resume: initial?.resume ?? "",
    categories: [...(initial?.categories ?? [])],
    skills: createFormSkills(initial?.skills),
    status: initial?.status ?? "active",
  });

  const {
    submitting,
    onSubmit,
    onPickImage: onPickPicture,
  } = useEntityForm({
    endpoint: "/api/members",
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
    languageOptions,
    categoryOptions,
    rangeOptions,
  };
};
