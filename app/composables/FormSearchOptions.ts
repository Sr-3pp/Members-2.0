interface SelectOption {
  label: string;
  value: string;
}

export const useFormSearchOptions = <T>(
  endpoint: "/api/members/search" | "/api/enterprises/search",
  toOption: (record: T) => SelectOption,
) => {
  const options = ref<SelectOption[]>([]);
  const loading = ref(false);
  let latestRequest = 0;

  const load = async (term = "") => {
    const request = ++latestRequest;
    loading.value = true;
    try {
      const results = await $fetch<T[]>(endpoint, {
        params: { q: term, status: "active", limit: 20 },
      });
      if (request === latestRequest) options.value = results.map(toOption);
    } finally {
      if (request === latestRequest) loading.value = false;
    }
  };

  return { options, loading, load };
};
