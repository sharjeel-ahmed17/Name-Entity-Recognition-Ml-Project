export type EntityLabel = "PERSON" | "GPE" | "ORG" | string;

export interface Entity {
  text: string;
  label: EntityLabel;
  start: number;
  end: number;
  score?: number;
}

export interface RecognizeResponse {
  text: string;
  entities: Entity[];
  count?: number;
  processing_time?: number;
}

export interface BatchResponse {
  results: RecognizeResponse[];
}

export interface HealthResponse {
  status: string;
  model?: string;
  version?: string;
}

export interface LabelsResponse {
  labels: string[];
}

export interface HistoryItem {
  id: string;
  text: string;
  entities: Entity[];
  timestamp: number;
}
