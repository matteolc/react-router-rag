import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { FetcherWithComponents } from "react-router";

export type FetcherWithComponentsReset<T> = FetcherWithComponents<T> & {
  reset: () => void;
};

export function useFetcherWithReset<T>({
  key,
}: {
  key: string;
}): FetcherWithComponentsReset<T> {
  const fetcher = useFetcher<T>({ key });
  const [data, setData] = useState(fetcher.data);
  useEffect(() => {
    if (fetcher.state === "idle") {
      setData(fetcher.data);
    }
  }, [fetcher.state, fetcher.data]);
  return {
    ...fetcher,
    data: data as T,
    reset: () => setData(undefined),
  };
}
