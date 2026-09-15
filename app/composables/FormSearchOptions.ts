interface SelectOption {
  label: string;
  value: string;
}

export const useFormSearchOptions = <T>(
  endpoint: "/api/members/search" | "/api/enterprises/search",
  toOption: (record: T) => SelectOption,
) => {
  const options = ref<SelectOption[]>([]);
  const { loading, run } = useLatestRequest();

  const load = async (term = "") => {
    const results = await run(() =>
      $fetch<T[]>(endpoint, {
        params: { q: term, status: "active", limit: 20 },
      }),
    );
    if (results) options.value = results.map(toOption);
  };

  return { options, loading, load };
};
