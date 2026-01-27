export const usePrograms = () => {
  const getPrograms = () =>
    useAsyncData("programs", async () => $fetch("/api/programs"));

  const getProgram = (id: string) =>
    useAsyncData(`program-${id}`, async () => {
      const program = await $fetch(`/api/programs/${id}`);
      return program;
    });

  return {
    getPrograms,
    getProgram,
  };
};
