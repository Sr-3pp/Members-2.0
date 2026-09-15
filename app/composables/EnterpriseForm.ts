import type { Enterprise } from "~~/shared/types/entities";
import { enterpriseFormSchema as schema } from "~~/utils/formSchemas";

export const useEnterpriseForm = (
  initial: Enterprise | undefined,
  onSubmitted: () => void,
) => {
  const profile = useProfileForm({
    endpoint: "/api/enterprises",
    initial,
    fields: {
      description: initial?.description ?? "",
    },
    onSubmitted,
  });

  return { ...profile, schema };
};
