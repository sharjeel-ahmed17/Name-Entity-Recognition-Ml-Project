import type { EntityLabel } from "@/types/ner";

export interface EntityStyle {
  bg: string;
  fg: string;
  ring: string;
  label: string;
  description: string;
}

export function getEntityStyle(label: EntityLabel): EntityStyle {
  const key = (label || "").toUpperCase();
  switch (key) {
    case "PERSON":
      return {
        bg: "bg-entity-person-bg",
        fg: "text-entity-person-fg",
        ring: "ring-entity-person-fg/30",
        label: "Person",
        description: "Names of people",
      };
    case "GPE":
    case "LOC":
      return {
        bg: "bg-entity-gpe-bg",
        fg: "text-entity-gpe-fg",
        ring: "ring-entity-gpe-fg/30",
        label: "Location",
        description: "Countries, cities, places",
      };
    case "ORG":
      return {
        bg: "bg-entity-org-bg",
        fg: "text-entity-org-fg",
        ring: "ring-entity-org-fg/30",
        label: "Organization",
        description: "Companies, agencies, institutions",
      };
    default:
      return {
        bg: "bg-entity-unknown-bg",
        fg: "text-entity-unknown-fg",
        ring: "ring-entity-unknown-fg/30",
        label: key || "Entity",
        description: "Recognized entity",
      };
  }
}

export const ENTITY_LABELS = ["PERSON", "GPE", "ORG"] as const;
