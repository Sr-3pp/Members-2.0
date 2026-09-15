import type { Member } from "~~/shared/types/entities";
import { memberFormSchema as schema } from "~~/utils/formSchemas";
import {
  languageOptions,
  categoryOptions,
  rangeOptions,
} from "~~/utils/formOptions";

export const useMemberForm = (
  initial: Member | undefined,
  onSubmitted: () => void,
) => {
  const profile = useProfileForm({
    endpoint: "/api/members",
    initial,
    fields: {
      last_name: initial?.last_name ?? "",
      email: initial?.email ?? "",
      mobile: initial?.mobile ?? "",
      range: initial?.range ?? "afiliado",
      languages: [...(initial?.languages ?? [])],
      education: initial?.education ?? "",
      categories: [...(initial?.categories ?? [])],
    },
    onSubmitted,
  });

  return {
    ...profile,
    schema,
    languageOptions,
    categoryOptions,
    rangeOptions,
  };
};
