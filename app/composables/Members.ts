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

  return {
    getMember,
    getMembers,
    deleteMember,
    searchByCategory,
  };
};
