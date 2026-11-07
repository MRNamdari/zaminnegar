import { queryOptions } from "@tanstack/react-query";
import { toPromise } from "@/app/features/map-editor";
import { fetchFeatures } from "./api";

export const featuresQueryKey = ["features"] as const;

export const featuresQueryOptions = () =>
  queryOptions({
    queryKey: featuresQueryKey,
    queryFn: ({ signal }) => toPromise(fetchFeatures(signal)),
  });
