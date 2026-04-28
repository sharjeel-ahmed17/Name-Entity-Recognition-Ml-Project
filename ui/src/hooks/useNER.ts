import { useQuery, useMutation } from "@tanstack/react-query";
import { checkHealth, fetchLabels, recognize, recognizeBatch } from "@/services/nerApi";
import { useAppStore } from "@/stores/useAppStore";

export function useConnection() {
  const apiUrl = useAppStore((s) => s.apiUrl);
  return useQuery({
    queryKey: ["health", apiUrl],
    queryFn: () => checkHealth(apiUrl),
    refetchInterval: 15000,
    retry: 1,
    staleTime: 10000,
  });
}

export function useLabels() {
  const apiUrl = useAppStore((s) => s.apiUrl);
  return useQuery({
    queryKey: ["labels", apiUrl],
    queryFn: () => fetchLabels(apiUrl),
    retry: 1,
    staleTime: 60000,
  });
}

export function useRecognize() {
  const apiUrl = useAppStore((s) => s.apiUrl);
  return useMutation({
    mutationFn: ({ text, include_scores = true }: { text: string; include_scores?: boolean }) =>
      recognize(apiUrl, text, include_scores),
  });
}

export function useRecognizeBatch() {
  const apiUrl = useAppStore((s) => s.apiUrl);
  return useMutation({
    mutationFn: (texts: string[]) => recognizeBatch(apiUrl, texts),
  });
}
