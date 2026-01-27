export const useProgram = () => {
  const getPrograms = () =>
    useAsyncData("programs", async () => $fetch("/api/programs"));

  const deleteProgram = (id: string) =>
    $fetch(`/api/programs/${id}`, {
      method: "DELETE",
    });

  const getProgram = (id: string) =>
    useAsyncData(
      `program-${id}`,
      async () => await $fetch(`/api/programs/${id}`),
    );

  return {
    getPrograms,
    getProgram,
    deleteProgram,
  };
};
