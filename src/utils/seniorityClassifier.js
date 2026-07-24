import { TITLE_MAP } from "../data/titleMap";
import { classifyByKeyword } from "../data/keywordMap";

export function classifySeniority(title = "", mlResults = null) {
  if (!title || !title.trim()) return "Unknown / Other";

  const t = title.trim();

  // Check ML Cosine Embedding results
  if (mlResults) {
    if (mlResults[t]?.seniority) return mlResults[t].seniority;
    const lowerKey = t.toLowerCase();
    for (const k in mlResults) {
      if (k.toLowerCase() === lowerKey && mlResults[k]?.seniority) {
        return mlResults[k].seniority;
      }
    }
  }

  // Check direct TITLE_MAP entry
  if (TITLE_MAP[t]) {
    const val = TITLE_MAP[t];
    if (typeof val === "object" && val.seniority) return val.seniority;
  }
  const lowerT = t.toLowerCase();
  for (const k in TITLE_MAP) {
    if (k.toLowerCase() === lowerT) {
      const val = TITLE_MAP[k];
      if (typeof val === "object" && val.seniority) return val.seniority;
    }
  }

  // Keyword fallback
  const kwResult = classifyByKeyword(t);
  if (kwResult?.seniority) return kwResult.seniority;

  return "Unknown / Other";
}
