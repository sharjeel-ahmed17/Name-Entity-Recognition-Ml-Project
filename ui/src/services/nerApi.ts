import axios, { AxiosInstance } from "axios";
import type { BatchResponse, HealthResponse, LabelsResponse, RecognizeResponse } from "@/types/ner";

let client: AxiosInstance | null = null;
let currentBaseURL = "";

export function getClient(baseURL: string): AxiosInstance {
  if (!client || baseURL !== currentBaseURL) {
    currentBaseURL = baseURL;
    client = axios.create({
      baseURL,
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    });
  }
  return client;
}

export async function checkHealth(baseURL: string): Promise<HealthResponse> {
  const { data } = await getClient(baseURL).get<HealthResponse>("/health");
  return data;
}

export async function fetchLabels(baseURL: string): Promise<LabelsResponse> {
  const { data } = await getClient(baseURL).get<LabelsResponse>("/labels");
  // Some backends return array directly
  if (Array.isArray(data)) return { labels: data as unknown as string[] };
  return data;
}

export async function recognize(
  baseURL: string,
  text: string,
  include_scores = true
): Promise<RecognizeResponse> {
  const { data } = await getClient(baseURL).post<RecognizeResponse>("/recognize", {
    text,
    include_scores,
  });
  return data;
}

export async function recognizeBatch(
  baseURL: string,
  texts: string[]
): Promise<BatchResponse> {
  const { data } = await getClient(baseURL).post<BatchResponse | RecognizeResponse[]>(
    "/recognize/batch",
    texts
  );
  if (Array.isArray(data)) return { results: data };
  return data;
}
