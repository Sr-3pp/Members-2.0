import type { Enterprise, Member, Program } from "~~/shared/types/entities";
import { createFormSkills, buildProgramPayload } from "~~/utils/forms";
import { programFormSchema as schema } from "~~/utils/formSchemas";

export const useProgramForm = (
  initial: Program | undefined,
  onSubmitted: () => void,
) => {
  const {
    options: enterpriseOptions,
    loading: loadingEnterprises,
    load: loadEnterprises,
  } = useFormSearchOptions<Enterprise>(
    "/api/enterprises/search",
    (enterprise) => ({
      label: enterprise.name || "Unnamed Enterprise",
      value: enterprise._id,
    }),
  );
  const {
    options: memberOptions,
    loading: loadingMembers,
    load: loadMembers,
  } = useFormSearchOptions<Member>("/api/members/search", (member) => ({
    label:
      `${member.name ?? ""} ${member.last_name ?? ""}`.trim() || member.email,
    value: member._id,
  }));
  onMounted(() => {
    loadMembers();
    loadEnterprises();
  });

  const form = reactive({
    title: initial?.title ?? "",
    length: initial?.length ?? 1,
    enterpriseId:
      typeof initial?.enterprise === "string"
        ? initial.enterprise
        : (initial?.enterprise?._id ?? ""),
    participants: (initial?.participants ?? [])
      .map((participant) =>
        typeof participant === "string" ? participant : participant._id,
      )
      .filter(Boolean),
    photoFile: null as File | null,
    photo: initial?.photo ?? "",
    description: initial?.description ?? "",
    skills: createFormSkills(initial?.skills),
    status: initial?.status ?? "active",
  });

  const {
    submitting,
    onSubmit,
    onPickImage: onPickPhoto,
  } = useEntityForm({
    endpoint: "/api/programs",
    initialId: initial?._id,
    imageFile: toRef(form, "photoFile"),
    imageUrl: toRef(form, "photo"),
    buildPayload: () => buildProgramPayload(form),
    onSubmitted,
  });

  return {
    form,
    schema,
    submitting,
    onSubmit,
    onPickPhoto,
    enterpriseOptions,
    loadingEnterprises,
    loadEnterprises,
    memberOptions,
    loadingMembers,
    loadMembers,
  };
};
