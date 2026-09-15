import type { Member } from "~~/shared/types/entities";

export const useMembers = () => {
  const getMembers = () =>
    useAsyncData("members", () => $fetch<Member[]>("/api/members"));

  const deleteMember = (id: string) =>
    $fetch(`/api/members/${id}`, {
      method: "DELETE",
    });

  const getMember = (id: string) =>
    useAsyncData(`member-${id}`, () =>
      $fetch<Member>(`/api/members/${id}`),
    );

  const searchMember = (filters: EntitySearchFilters) =>
    fetchEntitySearch<Member>("/api/members/search", filters);

  return {
    getMember,
    getMembers,
    deleteMember,
    searchMember,
  };
};
