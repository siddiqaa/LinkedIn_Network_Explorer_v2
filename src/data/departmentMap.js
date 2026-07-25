/**
 * Functional Department Mapping and Keyword Classifier
 * Mirrors seniority classification architecture for functional domain categorization.
 */

export const DEPARTMENT_CATEGORIES = [
  "Engineering & Technology",
  "Product & Design",
  "Sales & Business Development",
  "Marketing & Communications",
  "Finance & Accounting",
  "People, HR & Recruiting",
  "Operations & Logistics",
  "Legal, Risk & Compliance",
  "Customer Success & Support",
  "Executive & General Management",
  "Consulting & Advisory",
  "Other / Unknown"
];

export const DEPARTMENT_KEYWORDS = [
  {
    department: "Executive & General Management",
    keywords: [
      "chief executive", "ceo", "president", "founder", "co-founder", "cofounder",
      "owner", "managing director", "general manager", "gm ", "chief of staff",
      "managing partner", "board member", "managing member"
    ]
  },
  {
    department: "Engineering & Technology",
    keywords: [
      "engineer", "engineering", "developer", "software", "frontend", "backend",
      "fullstack", "full-stack", "full stack", "devops", "site reliability", "sre",
      "cto", "architect", "data scientist", "data engineer", "machine learning", "ai ",
      "qa ", "test engineer", "infrastructure", "systems", "network", "cybersecurity",
      "security engineer", "cloud", "firmware", "embedded", "technical lead", "tech lead",
      "web developer", "mobile developer", "ios", "android", "scrum master"
    ]
  },
  {
    department: "Product & Design",
    keywords: [
      "product manager", "product lead", "product owner", "cpo", "head of product",
      "ux ", "ui ", "ux/ui", "user experience", "product designer", "graphic designer",
      "creative director", "design lead", "visual designer", "interaction designer",
      "brand designer", "industrial designer", "art director"
    ]
  },
  {
    department: "Sales & Business Development",
    keywords: [
      "sales", "account executive", "account manager", "business development", "bizdev",
      "cro", "head of sales", "sales manager", "sales director", "bdr", "sdr",
      "sales engineer", "solutions architect", "commercial", "revenue", "partnerships",
      "partner manager", "client executive", "channel manager"
    ]
  },
  {
    department: "Marketing & Communications",
    keywords: [
      "marketing", "cmo", "growth", "brand", "communications", "pr", "public relations",
      "content", "copywriter", "social media", "digital marketing", "seo", "sem",
      "event manager", "demand generation", "field marketing", "product marketing"
    ]
  },
  {
    department: "Finance & Accounting",
    keywords: [
      "finance", "cfo", "financial", "accounting", "accountant", "controller",
      "auditor", "treasurer", "tax", "fp&a", "payroll", "investment", "analyst",
      "actuary", "bookkeeper", "wealth manager", "portfolio manager", "venture", "capitalist", "vc"
    ]
  },
  {
    department: "People, HR & Recruiting",
    keywords: [
      "hr", "human resources", "people", "recruiter", "recruiting", "talent",
      "talent acquisition", "people ops", "culture", "headhunter", "compensation"
    ]
  },
  {
    department: "Operations & Logistics",
    keywords: [
      "operations", "coo", "supply chain", "logistics", "procurement", "buyer",
      "inventory", "warehouse", "facility", "facilities", "program manager",
      "project manager", "scrum", "pmo", "delivery manager", "operations manager"
    ]
  },
  {
    department: "Legal, Risk & Compliance",
    keywords: [
      "legal", "counsel", "attorney", "lawyer", "paralegal", "compliance",
      "privacy", "regulatory", "risk", "contracts", "general counsel"
    ]
  },
  {
    department: "Customer Success & Support",
    keywords: [
      "customer success", "csm", "customer support", "technical support",
      "client success", "implementation", "onboarding", "customer service",
      "helpdesk", "service desk", "client services"
    ]
  },
  {
    department: "Consulting & Advisory",
    keywords: [
      "consultant", "advisory", "advisor", "strategy", "management consultant",
      "principal consultant", "solution consultant"
    ]
  }
];

/**
 * Common direct job title to department mappings
 */
export const DIRECT_DEPARTMENT_MAP = {
  "Software Engineer": "Engineering & Technology",
  "Senior Software Engineer": "Engineering & Technology",
  "Staff Software Engineer": "Engineering & Technology",
  "Principal Engineer": "Engineering & Technology",
  "Engineering Manager": "Engineering & Technology",
  "VP of Engineering": "Engineering & Technology",
  "Chief Technology Officer": "Engineering & Technology",
  "CTO": "Engineering & Technology",
  "Data Scientist": "Engineering & Technology",
  "Product Manager": "Product & Design",
  "Senior Product Manager": "Product & Design",
  "Director of Product": "Product & Design",
  "Product Designer": "Product & Design",
  "UX Designer": "Product & Design",
  "Account Executive": "Sales & Business Development",
  "Sales Manager": "Sales & Business Development",
  "Business Development Manager": "Sales & Business Development",
  "VP of Sales": "Sales & Business Development",
  "Chief Revenue Officer": "Sales & Business Development",
  "Marketing Manager": "Marketing & Communications",
  "Chief Marketing Officer": "Marketing & Communications",
  "CMO": "Marketing & Communications",
  "Financial Analyst": "Finance & Accounting",
  "Chief Financial Officer": "Finance & Accounting",
  "CFO": "Finance & Accounting",
  "Recruiter": "People, HR & Recruiting",
  "HR Manager": "People, HR & Recruiting",
  "Chief People Officer": "People, HR & Recruiting",
  "Operations Manager": "Operations & Logistics",
  "Project Manager": "Operations & Logistics",
  "Chief Operating Officer": "Operations & Logistics",
  "COO": "Operations & Logistics",
  "Chief Executive Officer": "Executive & General Management",
  "CEO": "Executive & General Management",
  "Founder": "Executive & General Management",
  "Co-Founder": "Executive & General Management",
  "President": "Executive & General Management",
  "Customer Success Manager": "Customer Success & Support",
  "General Counsel": "Legal, Risk & Compliance"
};

/**
 * Classifies a job title into a Department using Keyword & Direct Mapping
 * @param {string} title
 * @returns {{ department: string, keyword?: string, directMatch?: boolean }}
 */
export function classifyDepartmentByKeyword(title) {
  if (!title || typeof title !== "string") {
    return { department: "Other / Unknown" };
  }

  const cleanTitle = title.trim();
  const lowerTitle = cleanTitle.toLowerCase();

  // 1. Direct Map Check
  if (DIRECT_DEPARTMENT_MAP[cleanTitle]) {
    return { department: DIRECT_DEPARTMENT_MAP[cleanTitle], directMatch: true };
  }

  // Case-insensitive Direct Map check
  for (const [key, dept] of Object.entries(DIRECT_DEPARTMENT_MAP)) {
    if (key.toLowerCase() === lowerTitle) {
      return { department: dept, directMatch: true };
    }
  }

  // 2. Keyword Matching (Word boundary aware where possible)
  for (const item of DEPARTMENT_KEYWORDS) {
    for (const kw of item.keywords) {
      const cleanKw = kw.trim().toLowerCase();
      if (lowerTitle.includes(cleanKw)) {
        return { department: item.department, keyword: kw };
      }
    }
  }

  return { department: "Other / Unknown" };
}
