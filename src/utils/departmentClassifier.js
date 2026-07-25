import { DIRECT_DEPARTMENT_MAP, classifyDepartmentByKeyword } from "../data/departmentMap";
import { TITLE_MAP } from "../data/titleMap";

/**
 * Classifies a raw job title into a Functional Department.
 * Priority:
 * 1. ML / LLM override results
 * 2. TITLE_MAP entry with department attribute
 * 3. DIRECT_DEPARTMENT_MAP entry
 * 4. Keyword pattern matching (classifyDepartmentByKeyword)
 * 5. Fallback: "Other / Unknown"
 *
 * @param {string} title - Raw job title string
 * @param {Object|null} mlResults - Map of title -> { department, seniority, override, ... }
 * @returns {string} - Functional department name
 */
export function classifyDepartment(title = "", mlResults = null) {
  if (!title || !title.trim()) return "Other / Unknown";

  const t = title.trim();

  // 1. Check ML / LLM override results
  if (mlResults) {
    if (mlResults[t]?.department) {
      return mlResults[t].department;
    }
    const lowerKey = t.toLowerCase();
    for (const k in mlResults) {
      if (k.toLowerCase() === lowerKey && mlResults[k]?.department) {
        return mlResults[k].department;
      }
    }
  }

  // 2. Check TITLE_MAP entry
  if (TITLE_MAP[t] && typeof TITLE_MAP[t] === "object" && TITLE_MAP[t].department) {
    return TITLE_MAP[t].department;
  }
  const lowerT = t.toLowerCase();
  for (const k in TITLE_MAP) {
    if (k.toLowerCase() === lowerT) {
      const val = TITLE_MAP[k];
      if (typeof val === "object" && val.department) return val.department;
    }
  }

  // 3. Check DIRECT_DEPARTMENT_MAP
  if (DIRECT_DEPARTMENT_MAP[t]) {
    return DIRECT_DEPARTMENT_MAP[t];
  }
  for (const k in DIRECT_DEPARTMENT_MAP) {
    if (k.toLowerCase() === lowerT) {
      return DIRECT_DEPARTMENT_MAP[k];
    }
  }

  // 4. Keyword fallback
  const kwResult = classifyDepartmentByKeyword(t);
  if (kwResult?.department) return kwResult.department;

  return "Other / Unknown";
}
