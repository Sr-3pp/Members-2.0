export const useEnterprise = () => {
  const getEnterprises = () =>
    useAsyncData("enterprises", async () => $fetch("/api/enterprises"));

  const deleteEnterprise = (id: string) =>
    $fetch(`/api/enterprises/${id}`, {
      method: "DELETE",
    });

  const getEnterprise = (id: string) =>
    useAsyncData(
      `enterprise-${id}`,
      async () => await $fetch(`/api/enterprises/${id}`),
    );

  return {
    getEnterprises,
    getEnterprise,
    deleteEnterprise,
  };
};
