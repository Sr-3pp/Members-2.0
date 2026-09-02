import type { Enterprise } from "~~/shared/types/entities";

export const useEnterprise = () => {
  const getEnterprises = () =>
    useAsyncData("enterprises", () =>
      $fetch<Enterprise[]>("/api/enterprises"),
    );

  const deleteEnterprise = (id: string) =>
    $fetch(`/api/enterprises/${id}`, {
      method: "DELETE",
    });

  const getEnterprise = (id: string) =>
    useAsyncData(`enterprise-${id}`, () =>
      $fetch<Enterprise>(`/api/enterprises/${id}`),
    );

  return {
    getEnterprises,
    getEnterprise,
    deleteEnterprise,
  };
};
