import type { Program } from "~~/shared/types/entities";

export const useProgram = () => {
  const getPrograms = () =>
    useAsyncData("programs", () => $fetch<Program[]>("/api/programs"));

  const deleteProgram = (id: string) =>
    $fetch(`/api/programs/${id}`, {
      method: "DELETE",
    });

  const getProgram = (id: string) =>
    useAsyncData(`program-${id}`, () =>
      $fetch<Program>(`/api/programs/${id}`),
    );

  // `name` matches the program title; `country` resolves through its enterprise.
  const searchProgram = (filters: EntitySearchFilters) =>
    fetchEntitySearch<Program>("/api/programs/search", filters);

  return {
    getPrograms,
    getProgram,
    deleteProgram,
    searchProgram,
  };
};
