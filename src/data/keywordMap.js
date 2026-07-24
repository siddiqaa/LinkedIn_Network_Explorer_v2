/**
 * Keyword mapping for Seniority fallback classification.
 * Used when embedding confidence is < 50% or when direct titleMap lookup fails.
 * You can edit or add new keywords to this array anytime.
 */

export const KEYWORD_MAP = [
  // C-Suite / Founder
  {
    seniority: "C-Suite / Founder",
    keywords: [
      "chief", "ceo", "cto", "cfo", "coo", "cmo", "cro", "cpo", "cio", "ciso", "cdo",
      "founder", "co-founder", "cofounder", "owner", "president", "principal owner", "managing partner"
    ]
  },
  // VP / Director
  {
    seniority: "VP / Director",
    keywords: [
      "vp", "vice president", "svp", "evp", "director", "head of", "head", "board member", "board observer"
    ]
  },
  // Manager / Lead
  {
    seniority: "Manager / Lead",
    keywords: [
      "manager", "mgr", "lead", "leader", "chief of staff", "supervisor", "team lead", "head coach"
    ]
  },
  // Senior / Mid
  {
    seniority: "Senior / Mid",
    keywords: [
      "senior", "sr", "mid", "principal", "staff", "architect", "consultant", "specialist",
      "engineer", "developer", "analyst", "designer", "geoscientist", "strategist", "estimator",
      "pathologist", "host", "officer", "advisor"
    ]
  },
  // Junior / Associate
  {
    seniority: "Junior / Associate",
    keywords: [
      "junior", "jr", "associate", "assistant", "intern", "trainee", "coordinator", "entry level", "apprentice"
    ]
  }
];

/**
 * Classifies a raw title based on keyword matching
 * @param {string} title - Raw job title string
 * @returns {{ seniority: string, keyword: string } | null}
 */
export function classifyByKeyword(title) {
  if (!title || typeof title !== "string") return null;

  const cleanTitle = title.toLowerCase();

  for (const group of KEYWORD_MAP) {
    for (const kw of group.keywords) {
      const escapedKw = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z0-9])${escapedKw}(?:$|[^a-z0-9])`, 'i');
      if (regex.test(cleanTitle)) {
        return {
          seniority: group.seniority,
          keyword: kw
        };
      }
    }
  }

  return null;
}
