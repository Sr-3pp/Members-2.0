/**
 * Guards an input-driven request: while one is in flight a newer one can start,
 * and the slower response must not overwrite the fresher result.
 */
export const useLatestRequest = () => {
  const loading = ref(false);
  let latest = 0;

  /** Resolves to `null` when a newer call superseded this one. */
  const run = async <T>(task: () => Promise<T>): Promise<T | null> => {
    const request = ++latest;
    loading.value = true;
    try {
      const result = await task();
      return request === latest ? result : null;
    } finally {
      if (request === latest) loading.value = false;
    }
  };

  return { loading, run };
};
