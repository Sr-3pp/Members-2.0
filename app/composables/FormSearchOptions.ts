interface SelectOption {
  label: string;
  value: string;
}

export const useFormSearchOptions = <T>(
  endpoint: Exclude<EntitySearchEndpoint, "/api/programs/search">,
  toOption: (record: T) => SelectOption,
) => {
  const options = ref<SelectOption[]>([]);
  const { loading, run } = useLatestRequest();

  const load = async (term = "") => {
    const page = await run(() =>
      fetchEntitySearch<T>(endpoint, { name: term, status: "active", limit: 20 }),
    );
    if (page) options.value = page.items.map(toOption);
  };

  return { options, loading, load };
};
