import type { Member } from "~~/server/models/Member";

export interface SearchMemberFilters {
  name: string;
  category?: string;
  country?: string;
}

export const useMembers = () => {
  const getMembers = () =>
    useAsyncData("members", async () => $fetch("/api/members"));

  const deleteMember = (id: string) =>
    $fetch(`/api/members/${id}`, {
      method: "DELETE",
    });

  const getMember = (id: string) =>
    useAsyncData(`member-${id}`, async () => {
      const member = await $fetch(`/api/members/${id}`);
      return member;
    });

  const searchByCategory = (category: string) =>
    $fetch(`/api/members/search/${category}`);

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
