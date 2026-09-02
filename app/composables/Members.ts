import type { Member } from "~~/shared/types/entities";

export interface SearchMemberFilters {
  name: string;
  category?: string;
  country?: string;
}

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

  const searchByCategory = (category: string) =>
    $fetch<Member[]>(`/api/members/search/${category}`);

  const searchMember = (filters: SearchMemberFilters) =>
    $fetch<Member[]>("/api/members/search", {
      query: {
        name: filters.name || undefined,
        category: filters.category,
        country: filters.country,
      },
    });

  return {
    getMember,
    getMembers,
    deleteMember,
    searchByCategory,
    searchMember,
  };
};
