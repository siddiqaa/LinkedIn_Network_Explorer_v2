// ── Title normalizer lookup map ─────────────────────────────────────────────
// Raw job title strings -> Standardized Canonical Job Titles & Seniority
export const TITLE_MAP = {
  "ceo": {
    "canonicalTitle": "CEO",
    "seniority": "C-Suite / Founder"
  },
  "chief executive officer": {
    "canonicalTitle": "CEO",
    "seniority": "C-Suite / Founder"
  },
  "chief executive": {
    "canonicalTitle": "CEO",
    "seniority": "C-Suite / Founder"
  },
  "cto": {
    "canonicalTitle": "CTO",
    "seniority": "C-Suite / Founder"
  },
  "chief technology officer": {
    "canonicalTitle": "CTO",
    "seniority": "C-Suite / Founder"
  },
  "chief technical officer": {
    "canonicalTitle": "CTO",
    "seniority": "C-Suite / Founder"
  },
  "coo": {
    "canonicalTitle": "COO",
    "seniority": "C-Suite / Founder"
  },
  "chief operating officer": {
    "canonicalTitle": "COO",
    "seniority": "C-Suite / Founder"
  },
  "chief operations officer": {
    "canonicalTitle": "COO",
    "seniority": "C-Suite / Founder"
  },
  "cfo": {
    "canonicalTitle": "CFO",
    "seniority": "C-Suite / Founder"
  },
  "chief financial officer": {
    "canonicalTitle": "CFO",
    "seniority": "C-Suite / Founder"
  },
  "cpo": {
    "canonicalTitle": "CPO",
    "seniority": "C-Suite / Founder"
  },
  "chief product officer": {
    "canonicalTitle": "CPO",
    "seniority": "C-Suite / Founder"
  },
  "chief people officer": {
    "canonicalTitle": "CPO",
    "seniority": "C-Suite / Founder"
  },
  "founder": {
    "canonicalTitle": "Founder",
    "seniority": "C-Suite / Founder"
  },
  "co-founder": {
    "canonicalTitle": "Co-Founder",
    "seniority": "C-Suite / Founder"
  },
  "cofounder": {
    "canonicalTitle": "Co-Founder",
    "seniority": "C-Suite / Founder"
  },
  "co founder": {
    "canonicalTitle": "Co-Founder",
    "seniority": "C-Suite / Founder"
  },
  "founder & ceo": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "founder and ceo": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "vp engineering": {
    "canonicalTitle": "VP Engineering",
    "seniority": "VP / Director"
  },
  "vp of engineering": {
    "canonicalTitle": "VP Engineering",
    "seniority": "VP / Director"
  },
  "vice president engineering": {
    "canonicalTitle": "VP Engineering",
    "seniority": "VP / Director"
  },
  "vice president of engineering": {
    "canonicalTitle": "VP Engineering",
    "seniority": "VP / Director"
  },
  "vp product": {
    "canonicalTitle": "VP Product",
    "seniority": "VP / Director"
  },
  "vp of product": {
    "canonicalTitle": "VP Product",
    "seniority": "VP / Director"
  },
  "vice president of product": {
    "canonicalTitle": "VP Product",
    "seniority": "VP / Director"
  },
  "director of engineering": {
    "canonicalTitle": "Director of Engineering",
    "seniority": "VP / Director"
  },
  "director, engineering": {
    "canonicalTitle": "Director of Engineering",
    "seniority": "VP / Director"
  },
  "engineering director": {
    "canonicalTitle": "Director of Engineering",
    "seniority": "VP / Director"
  },
  "director of product": {
    "canonicalTitle": "Director of Product",
    "seniority": "VP / Director"
  },
  "director, product": {
    "canonicalTitle": "Director of Product",
    "seniority": "VP / Director"
  },
  "product director": {
    "canonicalTitle": "Director of Product",
    "seniority": "VP / Director"
  },
  "director of product management": {
    "canonicalTitle": "Director of Product",
    "seniority": "VP / Director"
  },
  "engineering manager": {
    "canonicalTitle": "Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "eng manager": {
    "canonicalTitle": "Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "manager, engineering": {
    "canonicalTitle": "Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "em": {
    "canonicalTitle": "Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "software engineer": {
    "canonicalTitle": "Software Engineer",
    "seniority": "Senior / Mid"
  },
  "software developer": {
    "canonicalTitle": "Software Engineer",
    "seniority": "Senior / Mid"
  },
  "swe": {
    "canonicalTitle": "Software Engineer",
    "seniority": "Senior / Mid"
  },
  "software engineering": {
    "canonicalTitle": "Software Engineer",
    "seniority": "Senior / Mid"
  },
  "senior software engineer": {
    "canonicalTitle": "Senior Software Engineer",
    "seniority": "Senior / Mid"
  },
  "sr. software engineer": {
    "canonicalTitle": "Senior Software Engineer",
    "seniority": "Senior / Mid"
  },
  "sr software engineer": {
    "canonicalTitle": "Senior Software Engineer",
    "seniority": "Senior / Mid"
  },
  "senior swe": {
    "canonicalTitle": "Senior Software Engineer",
    "seniority": "Senior / Mid"
  },
  "sr. swe": {
    "canonicalTitle": "Senior Software Engineer",
    "seniority": "Senior / Mid"
  },
  "senior software developer": {
    "canonicalTitle": "Senior Software Engineer",
    "seniority": "Senior / Mid"
  },
  "staff engineer": {
    "canonicalTitle": "Staff Engineer",
    "seniority": "Manager / Lead"
  },
  "staff software engineer": {
    "canonicalTitle": "Staff Engineer",
    "seniority": "Manager / Lead"
  },
  "staff swe": {
    "canonicalTitle": "Staff Engineer",
    "seniority": "Manager / Lead"
  },
  "principal engineer": {
    "canonicalTitle": "Principal Engineer",
    "seniority": "Manager / Lead"
  },
  "principal software engineer": {
    "canonicalTitle": "Principal Engineer",
    "seniority": "Manager / Lead"
  },
  "product manager": {
    "canonicalTitle": "Product Manager",
    "seniority": "Manager / Lead"
  },
  "pm": {
    "canonicalTitle": "Product Manager",
    "seniority": "Manager / Lead"
  },
  "product management": {
    "canonicalTitle": "Product Manager",
    "seniority": "Manager / Lead"
  },
  "senior product manager": {
    "canonicalTitle": "Senior Product Manager",
    "seniority": "Manager / Lead"
  },
  "sr. product manager": {
    "canonicalTitle": "Senior Product Manager",
    "seniority": "Manager / Lead"
  },
  "sr product manager": {
    "canonicalTitle": "Senior Product Manager",
    "seniority": "Manager / Lead"
  },
  "senior pm": {
    "canonicalTitle": "Senior Product Manager",
    "seniority": "Manager / Lead"
  },
  "sr. pm": {
    "canonicalTitle": "Senior Product Manager",
    "seniority": "Manager / Lead"
  },
  "product designer": {
    "canonicalTitle": "Product Designer",
    "seniority": "Senior / Mid"
  },
  "ux designer": {
    "canonicalTitle": "Product Designer",
    "seniority": "Senior / Mid"
  },
  "ui/ux designer": {
    "canonicalTitle": "Product Designer",
    "seniority": "Senior / Mid"
  },
  "ui ux designer": {
    "canonicalTitle": "Product Designer",
    "seniority": "Senior / Mid"
  },
  "ux/ui designer": {
    "canonicalTitle": "Product Designer",
    "seniority": "Senior / Mid"
  },
  "senior product designer": {
    "canonicalTitle": "Senior Product Designer",
    "seniority": "Senior / Mid"
  },
  "sr. product designer": {
    "canonicalTitle": "Senior Product Designer",
    "seniority": "Senior / Mid"
  },
  "senior ux designer": {
    "canonicalTitle": "Senior Product Designer",
    "seniority": "Senior / Mid"
  },
  "data scientist": {
    "canonicalTitle": "Data Scientist",
    "seniority": "Senior / Mid"
  },
  "data science": {
    "canonicalTitle": "Data Scientist",
    "seniority": "Senior / Mid"
  },
  "senior data scientist": {
    "canonicalTitle": "Senior Data Scientist",
    "seniority": "Senior / Mid"
  },
  "sr. data scientist": {
    "canonicalTitle": "Senior Data Scientist",
    "seniority": "Senior / Mid"
  },
  "sr data scientist": {
    "canonicalTitle": "Senior Data Scientist",
    "seniority": "Senior / Mid"
  },
  "data engineer": {
    "canonicalTitle": "Data Engineer",
    "seniority": "Senior / Mid"
  },
  "data engineering": {
    "canonicalTitle": "Data Engineer",
    "seniority": "Senior / Mid"
  },
  "ml engineer": {
    "canonicalTitle": "ML Engineer",
    "seniority": "Senior / Mid"
  },
  "machine learning engineer": {
    "canonicalTitle": "ML Engineer",
    "seniority": "Senior / Mid"
  },
  "ai/ml engineer": {
    "canonicalTitle": "ML Engineer",
    "seniority": "Senior / Mid"
  },
  "ml/ai engineer": {
    "canonicalTitle": "ML Engineer",
    "seniority": "Senior / Mid"
  },
  "devops engineer": {
    "canonicalTitle": "DevOps Engineer",
    "seniority": "Senior / Mid"
  },
  "devops": {
    "canonicalTitle": "DevOps Engineer",
    "seniority": "Senior / Mid"
  },
  "dev ops engineer": {
    "canonicalTitle": "DevOps Engineer",
    "seniority": "Senior / Mid"
  },
  "account executive": {
    "canonicalTitle": "Account Executive",
    "seniority": "Unknown / Other"
  },
  "ae": {
    "canonicalTitle": "Account Executive",
    "seniority": "Unknown / Other"
  },
  "senior account executive": {
    "canonicalTitle": "Senior Account Executive",
    "seniority": "Senior / Mid"
  },
  "sr. account executive": {
    "canonicalTitle": "Senior Account Executive",
    "seniority": "Senior / Mid"
  },
  "recruiter": {
    "canonicalTitle": "Recruiter",
    "seniority": "Unknown / Other"
  },
  "technical recruiter": {
    "canonicalTitle": "Technical Recruiter",
    "seniority": "Unknown / Other"
  },
  "tech recruiter": {
    "canonicalTitle": "Technical Recruiter",
    "seniority": "Unknown / Other"
  },
  "talent acquisition": {
    "canonicalTitle": "Recruiter",
    "seniority": "Unknown / Other"
  },
  "talent acquisition specialist": {
    "canonicalTitle": "Recruiter",
    "seniority": "Unknown / Other"
  },
  "marketing manager": {
    "canonicalTitle": "Marketing Manager",
    "seniority": "Manager / Lead"
  },
  "digital marketing manager": {
    "canonicalTitle": "Marketing Manager",
    "seniority": "Manager / Lead"
  },
  "growth marketing manager": {
    "canonicalTitle": "Marketing Manager",
    "seniority": "Manager / Lead"
  },
  "consultant": {
    "canonicalTitle": "Consultant",
    "seniority": "Senior / Mid"
  },
  "senior consultant": {
    "canonicalTitle": "Senior Consultant",
    "seniority": "Senior / Mid"
  },
  "associate consultant": {
    "canonicalTitle": "Associate Consultant",
    "seniority": "Senior / Mid"
  },
  "analyst": {
    "canonicalTitle": "Analyst",
    "seniority": "Junior / Associate"
  },
  "business analyst": {
    "canonicalTitle": "Business Analyst",
    "seniority": "Junior / Associate"
  },
  "financial analyst": {
    "canonicalTitle": "Financial Analyst",
    "seniority": "Junior / Associate"
  },
  "data analyst": {
    "canonicalTitle": "Data Analyst",
    "seniority": "Junior / Associate"
  },
  "senior analyst": {
    "canonicalTitle": "Senior Analyst",
    "seniority": "Senior / Mid"
  },
  "sr. analyst": {
    "canonicalTitle": "Senior Analyst",
    "seniority": "Senior / Mid"
  },
  "intern": {
    "canonicalTitle": "Intern",
    "seniority": "Junior / Associate"
  },
  "software engineering intern": {
    "canonicalTitle": "Engineering Intern",
    "seniority": "Junior / Associate"
  },
  "swe intern": {
    "canonicalTitle": "Engineering Intern",
    "seniority": "Junior / Associate"
  },
  "product management intern": {
    "canonicalTitle": "Product Intern",
    "seniority": "Junior / Associate"
  },
  "pm intern": {
    "canonicalTitle": "Product Intern",
    "seniority": "Junior / Associate"
  },
  "general manager": {
    "canonicalTitle": "General Manager",
    "seniority": "VP / Director"
  },
  "president": {
    "canonicalTitle": "President",
    "seniority": "C-Suite / Founder"
  },
  "owner": {
    "canonicalTitle": "Owner",
    "seniority": "C-Suite / Founder"
  },
  "managing director": {
    "canonicalTitle": "Managing Director",
    "seniority": "VP / Director"
  },
  "partner": {
    "canonicalTitle": "Partner",
    "seniority": "C-Suite / Founder"
  },
  "managing partner": {
    "canonicalTitle": "Managing Partner",
    "seniority": "C-Suite / Founder"
  },
  "executive director": {
    "canonicalTitle": "Executive Director",
    "seniority": "VP / Director"
  },
  "board member": {
    "canonicalTitle": "Board Member",
    "seniority": "Unknown / Other"
  },
  "operating partner": {
    "canonicalTitle": "Operating Partner",
    "seniority": "C-Suite / Founder"
  },
  "founding partner": {
    "canonicalTitle": "Founding Partner",
    "seniority": "C-Suite / Founder"
  },
  "general partner": {
    "canonicalTitle": "General Partner",
    "seniority": "C-Suite / Founder"
  },
  "senior partner": {
    "canonicalTitle": "Senior Partner",
    "seniority": "C-Suite / Founder"
  },
  "project manager": {
    "canonicalTitle": "Project Manager",
    "seniority": "Manager / Lead"
  },
  "senior project manager": {
    "canonicalTitle": "Senior Project Manager",
    "seniority": "Manager / Lead"
  },
  "sr. project manager": {
    "canonicalTitle": "Senior Project Manager",
    "seniority": "Manager / Lead"
  },
  "project director": {
    "canonicalTitle": "Project Director",
    "seniority": "VP / Director"
  },
  "senior project director": {
    "canonicalTitle": "Senior Project Director",
    "seniority": "VP / Director"
  },
  "project controls manager": {
    "canonicalTitle": "Project Controls Manager",
    "seniority": "Manager / Lead"
  },
  "senior program manager": {
    "canonicalTitle": "Senior Program Manager",
    "seniority": "Manager / Lead"
  },
  "program manager": {
    "canonicalTitle": "Program Manager",
    "seniority": "Manager / Lead"
  },
  "technical program manager": {
    "canonicalTitle": "Technical Program Manager",
    "seniority": "Manager / Lead"
  },
  "project management consultant": {
    "canonicalTitle": "Project Management Consultant",
    "seniority": "Senior / Mid"
  },
  "director": {
    "canonicalTitle": "Director",
    "seniority": "VP / Director"
  },
  "senior director": {
    "canonicalTitle": "Senior Director",
    "seniority": "VP / Director"
  },
  "director of operations": {
    "canonicalTitle": "Director of Operations",
    "seniority": "VP / Director"
  },
  "director of finance": {
    "canonicalTitle": "Director of Finance",
    "seniority": "VP / Director"
  },
  "director of business development": {
    "canonicalTitle": "Director of Business Development",
    "seniority": "VP / Director"
  },
  "sales director": {
    "canonicalTitle": "Sales Director",
    "seniority": "VP / Director"
  },
  "regional sales director": {
    "canonicalTitle": "Regional Sales Director",
    "seniority": "VP / Director"
  },
  "enterprise sales director": {
    "canonicalTitle": "Enterprise Sales Director",
    "seniority": "VP / Director"
  },
  "chief marketing officer": {
    "canonicalTitle": "CMO",
    "seniority": "C-Suite / Founder"
  },
  "vice president": {
    "canonicalTitle": "VP",
    "seniority": "VP / Director"
  },
  "vice president operations": {
    "canonicalTitle": "VP Operations",
    "seniority": "VP / Director"
  },
  "vice president of product management": {
    "canonicalTitle": "VP Product",
    "seniority": "VP / Director"
  },
  "senior vice president": {
    "canonicalTitle": "SVP",
    "seniority": "VP / Director"
  },
  "svp": {
    "canonicalTitle": "SVP",
    "seniority": "VP / Director"
  },
  "executive vice president": {
    "canonicalTitle": "EVP",
    "seniority": "VP / Director"
  },
  "sales manager": {
    "canonicalTitle": "Sales Manager",
    "seniority": "Manager / Lead"
  },
  "general sales manager": {
    "canonicalTitle": "General Sales Manager",
    "seniority": "Manager / Lead"
  },
  "regional sales manager": {
    "canonicalTitle": "Regional Sales Manager",
    "seniority": "Manager / Lead"
  },
  "enterprise account executive": {
    "canonicalTitle": "Enterprise Account Executive",
    "seniority": "Unknown / Other"
  },
  "business development manager": {
    "canonicalTitle": "Business Development Manager",
    "seniority": "Manager / Lead"
  },
  "account manager": {
    "canonicalTitle": "Account Manager",
    "seniority": "Manager / Lead"
  },
  "senior account manager": {
    "canonicalTitle": "Senior Account Manager",
    "seniority": "Manager / Lead"
  },
  "principal": {
    "canonicalTitle": "Principal",
    "seniority": "Manager / Lead"
  },
  "principal consultant": {
    "canonicalTitle": "Principal Consultant",
    "seniority": "Manager / Lead"
  },
  "independent consultant": {
    "canonicalTitle": "Independent Consultant",
    "seniority": "Senior / Mid"
  },
  "management consultant": {
    "canonicalTitle": "Management Consultant",
    "seniority": "Senior / Mid"
  },
  "business owner": {
    "canonicalTitle": "Business Owner",
    "seniority": "C-Suite / Founder"
  },
  "small business owner": {
    "canonicalTitle": "Business Owner",
    "seniority": "C-Suite / Founder"
  },
  "company owner": {
    "canonicalTitle": "Business Owner",
    "seniority": "C-Suite / Founder"
  },
  "owner & ceo": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "principal owner": {
    "canonicalTitle": "Owner",
    "seniority": "C-Suite / Founder"
  },
  "co-founder & ceo": {
    "canonicalTitle": "Co-Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "ceo and founder": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "founder/ceo": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "founder, ceo": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "founder ceo": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "ceo/founder": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "ceo / founder": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "ceo & co-founder": {
    "canonicalTitle": "Co-Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "ceo and co-founder": {
    "canonicalTitle": "Co-Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "co-founder and ceo": {
    "canonicalTitle": "Co-Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "ceo + founder": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "president & ceo": {
    "canonicalTitle": "President & CEO",
    "seniority": "C-Suite / Founder"
  },
  "president and ceo": {
    "canonicalTitle": "President & CEO",
    "seniority": "C-Suite / Founder"
  },
  "president/ceo": {
    "canonicalTitle": "President & CEO",
    "seniority": "C-Suite / Founder"
  },
  "president & owner": {
    "canonicalTitle": "President & Owner",
    "seniority": "C-Suite / Founder"
  },
  "chief revenue officer": {
    "canonicalTitle": "CRO",
    "seniority": "C-Suite / Founder"
  },
  "chief revenue officer (cro)": {
    "canonicalTitle": "CRO",
    "seniority": "C-Suite / Founder"
  },
  "chief commercial officer (cco)": {
    "canonicalTitle": "CCO",
    "seniority": "C-Suite / Founder"
  },
  "chief commercial officer": {
    "canonicalTitle": "CCO",
    "seniority": "C-Suite / Founder"
  },
  "operations manager": {
    "canonicalTitle": "Operations Manager",
    "seniority": "Manager / Lead"
  },
  "senior recruiter": {
    "canonicalTitle": "Senior Recruiter",
    "seniority": "Senior / Mid"
  },
  "senior technical recruiter": {
    "canonicalTitle": "Senior Technical Recruiter",
    "seniority": "Senior / Mid"
  },
  "senior talent acquisition specialist": {
    "canonicalTitle": "Senior Recruiter",
    "seniority": "Senior / Mid"
  },
  "talent acquisition partner": {
    "canonicalTitle": "Talent Acquisition Partner",
    "seniority": "Unknown / Other"
  },
  "sr. recruiter": {
    "canonicalTitle": "Senior Recruiter",
    "seniority": "Senior / Mid"
  },
  "professor": {
    "canonicalTitle": "Professor",
    "seniority": "Senior / Mid"
  },
  "assistant professor": {
    "canonicalTitle": "Assistant Professor",
    "seniority": "Senior / Mid"
  },
  "associate professor": {
    "canonicalTitle": "Associate Professor",
    "seniority": "Senior / Mid"
  },
  "adjunct professor": {
    "canonicalTitle": "Adjunct Professor",
    "seniority": "Senior / Mid"
  },
  "postdoctoral researcher": {
    "canonicalTitle": "Postdoctoral Researcher",
    "seniority": "Unknown / Other"
  },
  "attorney": {
    "canonicalTitle": "Attorney",
    "seniority": "Senior / Mid"
  },
  "general counsel": {
    "canonicalTitle": "General Counsel",
    "seniority": "Unknown / Other"
  },
  "retired": {
    "canonicalTitle": "Retired",
    "seniority": "Unknown / Other"
  },
  "semi retired": {
    "canonicalTitle": "Retired",
    "seniority": "Unknown / Other"
  },
  "self employed": {
    "canonicalTitle": "Freelancer",
    "seniority": "Unknown / Other"
  },
  "technical lead": {
    "canonicalTitle": "Tech Lead",
    "seniority": "Manager / Lead"
  },
  "head of product": {
    "canonicalTitle": "Head of Product",
    "seniority": "VP / Director"
  },
  "head of sales": {
    "canonicalTitle": "Head of Sales",
    "seniority": "VP / Director"
  },
  "head of growth": {
    "canonicalTitle": "Head of Growth",
    "seniority": "VP / Director"
  },
  "head of ai": {
    "canonicalTitle": "Head of AI",
    "seniority": "VP / Director"
  },
  "head of operations": {
    "canonicalTitle": "Head of Operations",
    "seniority": "VP / Director"
  },
  "head of marketing": {
    "canonicalTitle": "Head of Marketing",
    "seniority": "VP / Director"
  },
  "head of people": {
    "canonicalTitle": "Head of People",
    "seniority": "VP / Director"
  },
  "head of talent": {
    "canonicalTitle": "Head of Talent",
    "seniority": "VP / Director"
  },
  "senior process engineer": {
    "canonicalTitle": "Senior Process Engineer",
    "seniority": "Senior / Mid"
  },
  "real estate broker": {
    "canonicalTitle": "Real Estate Broker",
    "seniority": "Unknown / Other"
  },
  "licensed realtor": {
    "canonicalTitle": "Realtor",
    "seniority": "Unknown / Other"
  },
  "realtor": {
    "canonicalTitle": "Realtor",
    "seniority": "Unknown / Other"
  },
  "realtor associate": {
    "canonicalTitle": "Realtor",
    "seniority": "Unknown / Other"
  },
  "real estate agent": {
    "canonicalTitle": "Real Estate Agent",
    "seniority": "Unknown / Other"
  },
  "senior director of engineering": {
    "canonicalTitle": "Senior Director of Engineering",
    "seniority": "VP / Director"
  },
  "director of software engineering": {
    "canonicalTitle": "Director of Engineering",
    "seniority": "VP / Director"
  },
  "construction manager": {
    "canonicalTitle": "Construction Manager",
    "seniority": "Manager / Lead"
  },
  "talent acquisition manager": {
    "canonicalTitle": "Talent Acquisition Manager",
    "seniority": "Manager / Lead"
  },
  "director of talent acquisition": {
    "canonicalTitle": "Director of Talent Acquisition",
    "seniority": "VP / Director"
  },
  "director, talent acquisition": {
    "canonicalTitle": "Director of Talent Acquisition",
    "seniority": "VP / Director"
  },
  "director of recruiting": {
    "canonicalTitle": "Director of Recruiting",
    "seniority": "VP / Director"
  },
  "director of sales": {
    "canonicalTitle": "Director of Sales",
    "seniority": "VP / Director"
  },
  "director of marketing": {
    "canonicalTitle": "Director of Marketing",
    "seniority": "VP / Director"
  },
  "director of sales development": {
    "canonicalTitle": "Director of Sales Development",
    "seniority": "VP / Director"
  },
  "director of corporate sales": {
    "canonicalTitle": "Director of Sales",
    "seniority": "VP / Director"
  },
  "principal recruiter": {
    "canonicalTitle": "Principal Recruiter",
    "seniority": "Manager / Lead"
  },
  "recruiting manager": {
    "canonicalTitle": "Recruiting Manager",
    "seniority": "Manager / Lead"
  },
  "finance manager": {
    "canonicalTitle": "Finance Manager",
    "seniority": "Manager / Lead"
  },
  "regional director": {
    "canonicalTitle": "Regional Director",
    "seniority": "VP / Director"
  },
  "executive assistant": {
    "canonicalTitle": "Executive Assistant",
    "seniority": "Junior / Associate"
  },
  "research assistant": {
    "canonicalTitle": "Research Assistant",
    "seniority": "Junior / Associate"
  },
  "advisor": {
    "canonicalTitle": "Advisor",
    "seniority": "Senior / Mid"
  },
  "strategic advisor": {
    "canonicalTitle": "Strategic Advisor",
    "seniority": "Senior / Mid"
  },
  "sr. solutions engineer": {
    "canonicalTitle": "Senior Solutions Engineer",
    "seniority": "Senior / Mid"
  },
  "senior solutions architect": {
    "canonicalTitle": "Senior Solutions Architect",
    "seniority": "Senior / Mid"
  },
  "principal solutions architect": {
    "canonicalTitle": "Principal Solutions Architect",
    "seniority": "Manager / Lead"
  },
  "solutions architect": {
    "canonicalTitle": "Solutions Architect",
    "seniority": "Senior / Mid"
  },
  "vice president of business development": {
    "canonicalTitle": "VP Business Development",
    "seniority": "VP / Director"
  },
  "vice president marketing": {
    "canonicalTitle": "VP Marketing",
    "seniority": "VP / Director"
  },
  "vice president strategic partnerships": {
    "canonicalTitle": "VP Strategic Partnerships",
    "seniority": "VP / Director"
  },
  "vp of sales": {
    "canonicalTitle": "VP Sales",
    "seniority": "VP / Director"
  },
  "sr. vice president": {
    "canonicalTitle": "SVP",
    "seniority": "VP / Director"
  },
  "managing attorney": {
    "canonicalTitle": "Managing Attorney",
    "seniority": "Senior / Mid"
  },
  "of counsel": {
    "canonicalTitle": "Of Counsel",
    "seniority": "Unknown / Other"
  },
  "geologist": {
    "canonicalTitle": "Geologist",
    "seniority": "Unknown / Other"
  },
  "engineer": {
    "canonicalTitle": "Engineer",
    "seniority": "Senior / Mid"
  },
  "process engineer": {
    "canonicalTitle": "Process Engineer",
    "seniority": "Senior / Mid"
  },
  "senior project engineer": {
    "canonicalTitle": "Senior Project Engineer",
    "seniority": "Senior / Mid"
  },
  "commercial director": {
    "canonicalTitle": "Commercial Director",
    "seniority": "VP / Director"
  },
  "contract manager": {
    "canonicalTitle": "Contract Manager",
    "seniority": "Manager / Lead"
  },
  "plant manager": {
    "canonicalTitle": "Plant Manager",
    "seniority": "Manager / Lead"
  },
  "member board of directors": {
    "canonicalTitle": "Board Member",
    "seniority": "Unknown / Other"
  },
  "technical manager": {
    "canonicalTitle": "Technical Manager",
    "seniority": "Manager / Lead"
  },
  "sales coach": {
    "canonicalTitle": "Sales Coach",
    "seniority": "Unknown / Other"
  },
  "executive coach": {
    "canonicalTitle": "Executive Coach",
    "seniority": "Unknown / Other"
  },
  "co-founder & coo": {
    "canonicalTitle": "Co-Founder & COO",
    "seniority": "C-Suite / Founder"
  },
  "co-founder and coo": {
    "canonicalTitle": "Co-Founder & COO",
    "seniority": "C-Suite / Founder"
  },
  "co-founder & president": {
    "canonicalTitle": "Co-Founder & President",
    "seniority": "C-Suite / Founder"
  },
  "co-founder & managing partner": {
    "canonicalTitle": "Co-Founder & Managing Partner",
    "seniority": "C-Suite / Founder"
  },
  "co-founder & cto": {
    "canonicalTitle": "Co-Founder & CTO",
    "seniority": "C-Suite / Founder"
  },
  "ceo & founder": {
    "canonicalTitle": "Founder & CEO",
    "seniority": "C-Suite / Founder"
  },
  "senior technical product manager": {
    "canonicalTitle": "Senior Product Manager",
    "seniority": "Manager / Lead"
  },
  "manager": {
    "canonicalTitle": "Manager",
    "seniority": "Manager / Lead"
  },
  "software engineering manager": {
    "canonicalTitle": "Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "sr. engineering manager": {
    "canonicalTitle": "Senior Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "senior engineering manager": {
    "canonicalTitle": "Senior Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "principal engineering manager": {
    "canonicalTitle": "Principal Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "lead software engineer": {
    "canonicalTitle": "Lead Software Engineer",
    "seniority": "Manager / Lead"
  },
  "software engineer ii": {
    "canonicalTitle": "Software Engineer",
    "seniority": "Senior / Mid"
  },
  "research engineer": {
    "canonicalTitle": "Research Engineer",
    "seniority": "Senior / Mid"
  },
  "senior machine learning engineer": {
    "canonicalTitle": "Senior ML Engineer",
    "seniority": "Senior / Mid"
  },
  "head of ai engineering": {
    "canonicalTitle": "Head of AI Engineering",
    "seniority": "VP / Director"
  },
  "digital sales manager": {
    "canonicalTitle": "Sales Manager",
    "seniority": "Manager / Lead"
  },
  "senior marketing manager": {
    "canonicalTitle": "Senior Marketing Manager",
    "seniority": "Manager / Lead"
  },
  "marketing director": {
    "canonicalTitle": "Director of Marketing",
    "seniority": "VP / Director"
  },
  "brand ambassador": {
    "canonicalTitle": "Brand Ambassador",
    "seniority": "Unknown / Other"
  },
  "marketing specialist": {
    "canonicalTitle": "Marketing Specialist",
    "seniority": "Senior / Mid"
  },
  "digital strategist": {
    "canonicalTitle": "Digital Strategist",
    "seniority": "Unknown / Other"
  },
  "f&i manager": {
    "canonicalTitle": "Finance & Insurance Manager",
    "seniority": "Manager / Lead"
  },
  "business development specialist": {
    "canonicalTitle": "Business Development Specialist",
    "seniority": "Senior / Mid"
  },
  "business development executive": {
    "canonicalTitle": "Business Development Executive",
    "seniority": "Unknown / Other"
  },
  "business manager": {
    "canonicalTitle": "Business Manager",
    "seniority": "Manager / Lead"
  },
  "financial services professional": {
    "canonicalTitle": "Financial Services",
    "seniority": "Unknown / Other"
  },
  "ai researcher": {
    "canonicalTitle": "AI Researcher",
    "seniority": "Unknown / Other"
  },
  "business intelligence manager": {
    "canonicalTitle": "Business Intelligence Manager",
    "seniority": "Manager / Lead"
  },
  "senior economist": {
    "canonicalTitle": "Senior Economist",
    "seniority": "Senior / Mid"
  },
  "investor": {
    "canonicalTitle": "Investor",
    "seniority": "Unknown / Other"
  },
  "global key account manager": {
    "canonicalTitle": "Key Account Manager",
    "seniority": "Manager / Lead"
  },
  "procurement manager": {
    "canonicalTitle": "Procurement Manager",
    "seniority": "Manager / Lead"
  },
  "phd student": {
    "canonicalTitle": "PhD Student",
    "seniority": "Junior / Associate"
  },
  "graduate research and teaching assistant": {
    "canonicalTitle": "Graduate Research Assistant",
    "seniority": "Junior / Associate"
  },
  "chief digital officer": {
    "canonicalTitle": "Chief Digital Officer",
    "seniority": "C-Suite / Founder"
  },
  "chief ai officer": {
    "canonicalTitle": "Chief AI Officer",
    "seniority": "C-Suite / Founder"
  },
  "chief product & technology officer": {
    "canonicalTitle": "CPO/CTO",
    "seniority": "C-Suite / Founder"
  },
  "senior principal": {
    "canonicalTitle": "Senior Principal",
    "seniority": "Manager / Lead"
  },
  "senior research scientist": {
    "canonicalTitle": "Senior Research Scientist",
    "seniority": "Senior / Mid"
  },
  "customer success manager": {
    "canonicalTitle": "Customer Success Manager",
    "seniority": "Manager / Lead"
  },
  "president & founder": {
    "canonicalTitle": "Founder & President",
    "seniority": "C-Suite / Founder"
  },
  "president and founder": {
    "canonicalTitle": "Founder & President",
    "seniority": "C-Suite / Founder"
  },
  "founder, president": {
    "canonicalTitle": "Founder & President",
    "seniority": "C-Suite / Founder"
  },
  "sales representative": {
    "canonicalTitle": "Sales Representative",
    "seniority": "Unknown / Other"
  },
  "sales professional": {
    "canonicalTitle": "Sales",
    "seniority": "Unknown / Other"
  },
  "sales": {
    "canonicalTitle": "Sales",
    "seniority": "Unknown / Other"
  },
  "sales and marketing": {
    "canonicalTitle": "Sales & Marketing",
    "seniority": "Unknown / Other"
  },
  "sales specialist": {
    "canonicalTitle": "Sales Specialist",
    "seniority": "Senior / Mid"
  },
  "executive sales consultant": {
    "canonicalTitle": "Sales Consultant",
    "seniority": "Senior / Mid"
  },
  "new car sales manager": {
    "canonicalTitle": "Sales Manager",
    "seniority": "Manager / Lead"
  },
  "sr. sales leader": {
    "canonicalTitle": "Senior Sales Leader",
    "seniority": "Senior / Mid"
  },
  "strategic account executive": {
    "canonicalTitle": "Strategic Account Executive",
    "seniority": "Unknown / Other"
  },
  "senior it project manager": {
    "canonicalTitle": "Senior Project Manager",
    "seniority": "Manager / Lead"
  },
  "engineering project manager": {
    "canonicalTitle": "Project Manager",
    "seniority": "Manager / Lead"
  },
  "project development manager": {
    "canonicalTitle": "Project Manager",
    "seniority": "Manager / Lead"
  },
  "project coordinator": {
    "canonicalTitle": "Project Coordinator",
    "seniority": "Junior / Associate"
  },
  "project leader": {
    "canonicalTitle": "Project Manager",
    "seniority": "Manager / Lead"
  },
  "principal data scientist": {
    "canonicalTitle": "Principal Data Scientist",
    "seniority": "Manager / Lead"
  },
  "staff product manager": {
    "canonicalTitle": "Staff Product Manager",
    "seniority": "Manager / Lead"
  },
  "account director": {
    "canonicalTitle": "Account Director",
    "seniority": "VP / Director"
  },
  "associate director": {
    "canonicalTitle": "Associate Director",
    "seniority": "VP / Director"
  },
  "software development manager": {
    "canonicalTitle": "Engineering Manager",
    "seniority": "Manager / Lead"
  },
  "operating director": {
    "canonicalTitle": "Operations Director",
    "seniority": "VP / Director"
  },
  "president and chief operating officer": {
    "canonicalTitle": "President & COO",
    "seniority": "C-Suite / Founder"
  },
  "president & coo": {
    "canonicalTitle": "President & COO",
    "seniority": "C-Suite / Founder"
  },
  "principal engineering advisor": {
    "canonicalTitle": "Principal Engineer",
    "seniority": "Manager / Lead"
  },
  "estimator": {
    "canonicalTitle": "Estimator",
    "seniority": "Unknown / Other"
  },
  "project engineering manager": {
    "canonicalTitle": "Project Manager",
    "seniority": "Manager / Lead"
  },
  "senior manager": {
    "canonicalTitle": "Senior Manager",
    "seniority": "Manager / Lead"
  },
  "office manager": {
    "canonicalTitle": "Office Manager",
    "seniority": "Manager / Lead"
  },
  "management consulting manager": {
    "canonicalTitle": "Management Consultant",
    "seniority": "Senior / Mid"
  },
  "senior talent acquisition consultant": {
    "canonicalTitle": "Senior Recruiter",
    "seniority": "Senior / Mid"
  },
  "senior manager, talent acquisition": {
    "canonicalTitle": "Talent Acquisition Manager",
    "seniority": "Manager / Lead"
  },
  "head of enablement": {
    "canonicalTitle": "Head of Enablement",
    "seniority": "VP / Director"
  },
  "author": {
    "canonicalTitle": "Author",
    "seniority": "Unknown / Other"
  },
  "technical recruiter, product management": {
    "canonicalTitle": "Technical Recruiter",
    "seniority": "Unknown / Other"
  },
  "senior solutions consultant": {
    "canonicalTitle": "Senior Solutions Consultant",
    "seniority": "Senior / Mid"
  },
  "dealer consultant": {
    "canonicalTitle": "Consultant",
    "seniority": "Senior / Mid"
  },
  "student": {
    "canonicalTitle": "Student",
    "seniority": "Junior / Associate"
  },
  "vice president, ticket sales & service": {
    "canonicalTitle": "VP Sales",
    "seniority": "VP / Director"
  },
  
"Founder": {
"canonicalTitle": "Founder",
"seniority": "C-Suite / Founder"
},
"Retired": {
"canonicalTitle": "Retired",
"seniority": "Unknown / Other"
},
"Chief Operating Officer": {
"canonicalTitle": "Chief Operating Officer",
"seniority": "C-Suite / Founder"
},
"General Manager": {
"canonicalTitle": "General Manager",
"seniority": "Manager / Lead"
},
"Chief Executive Officer": {
"canonicalTitle": "Chief Executive Officer",
"seniority": "C-Suite / Founder"
},
"President": {
"canonicalTitle": "President",
"seniority": "C-Suite / Founder"
},
"Owner": {
"canonicalTitle": "Owner",
"seniority": "C-Suite / Founder"
},
"Managing Director": {
"canonicalTitle": "Managing Director",
"seniority": "VP / Director"
},
"Partner": {
"canonicalTitle": "Partner",
"seniority": "VP / Director"
},
"Founder & CEO": {
"canonicalTitle": "CEO & Founder",
"seniority": "C-Suite / Founder"
},
"Project Manager": {
"canonicalTitle": "Project Manager",
"seniority": "Manager / Lead"
},
"CEO": {
"canonicalTitle": "Chief Executive Officer",
"seniority": "C-Suite / Founder"
},
"Co-Founder": {
"canonicalTitle": "Co-Founder",
"seniority": "C-Suite / Founder"
},
"Managing Partner": {
"canonicalTitle": "Managing Partner",
"seniority": "C-Suite / Founder"
},
"Director": {
"canonicalTitle": "Director",
"seniority": "VP / Director"
},
"Vice President": {
"canonicalTitle": "Vice President",
"seniority": "VP / Director"
},
"Sales Manager": {
"canonicalTitle": "Sales Manager",
"seniority": "Manager / Lead"
},
"General Sales Manager": {
"canonicalTitle": "Sales Manager",
"seniority": "Manager / Lead"
},
"Senior Project Manager": {
"canonicalTitle": "Senior Project Manager",
"seniority": "Manager / Lead"
},
"Principal": {
"canonicalTitle": "Principal",
"seniority": "Senior / Mid"
},
"Senior Software Engineer": {
"canonicalTitle": "Senior Software Engineer",
"seniority": "Senior / Mid"
},
"Software Engineer": {
"canonicalTitle": "Software Engineer",
"seniority": "Senior / Mid"
},
"Chief Technology Officer": {
"canonicalTitle": "Chief Technology Officer",
"seniority": "C-Suite / Founder"
},
"Account Executive": {
"canonicalTitle": "Account Executive",
"seniority": "Senior / Mid"
},
"Product Manager": {
"canonicalTitle": "Product Manager",
"seniority": "Manager / Lead"
},
"Senior Product Manager": {
"canonicalTitle": "Senior Product Manager",
"seniority": "Manager / Lead"
},
"Consultant": {
"canonicalTitle": "Consultant",
"seniority": "Senior / Mid"
},
"Senior Consultant": {
"canonicalTitle": "Senior Consultant",
"seniority": "Senior / Mid"
},
"Founder and CEO": {
"canonicalTitle": "CEO & Founder",
"seniority": "C-Suite / Founder"
},
"Executive Director": {
"canonicalTitle": "Executive Director",
"seniority": "VP / Director"
},
"Business Development Manager": {
"canonicalTitle": "Business Development Manager",
"seniority": "Manager / Lead"
},
"Board Member": {
"canonicalTitle": "Board Member",
"seniority": "C-Suite / Founder"
},
"Principal Consultant": {
"canonicalTitle": "Principal Consultant",
"seniority": "Senior / Mid"
},
"Co-Founder & CEO": {
"canonicalTitle": "CEO & Co-Founder",
"seniority": "C-Suite / Founder"
},
"Account Manager": {
"canonicalTitle": "Account Manager",
"seniority": "Manager / Lead"
},
"Project Director": {
"canonicalTitle": "Project Director",
"seniority": "VP / Director"
},
"Director of Operations": {
"canonicalTitle": "Director of Operations",
"seniority": "VP / Director"
},
"CEO and Founder": {
"canonicalTitle": "CEO & Founder",
"seniority": "C-Suite / Founder"
},
"Senior Recruiter": {
"canonicalTitle": "Senior Recruiter",
"seniority": "Senior / Mid"
},
"Chief Operations Officer": {
"canonicalTitle": "Chief Operating Officer",
"seniority": "C-Suite / Founder"
},
"Chief Marketing Officer": {
"canonicalTitle": "Chief Marketing Officer",
"seniority": "C-Suite / Founder"
},
"Chief Product Officer": {
"canonicalTitle": "Chief Product Officer",
"seniority": "C-Suite / Founder"
},
"Sales Director": {
"canonicalTitle": "Sales Director",
"seniority": "VP / Director"
},
"Data Scientist": {
"canonicalTitle": "Data Scientist",
"seniority": "Senior / Mid"
},
"Attorney": {
"canonicalTitle": "Attorney",
"seniority": "Senior / Mid"
},
"Business Owner": {
"canonicalTitle": "Business Owner",
"seniority": "C-Suite / Founder"
},
"Machine Learning Engineer": {
"canonicalTitle": "Machine Learning Engineer",
"seniority": "Senior / Mid"
},
"Project Management Consultant": {
"canonicalTitle": "Project Management Consultant",
"seniority": "Senior / Mid"
},
"Senior Director": {
"canonicalTitle": "Senior Director",
"seniority": "VP / Director"
},
"Recruiter": {
"canonicalTitle": "Recruiter",
"seniority": "Senior / Mid"
},
"Chief Revenue Officer": {
"canonicalTitle": "Chief Revenue Officer",
"seniority": "C-Suite / Founder"
},
"Enterprise Account Executive": {
"canonicalTitle": "Enterprise Account Executive",
"seniority": "Senior / Mid"
},
"Regional Sales Manager": {
"canonicalTitle": "Regional Sales Manager",
"seniority": "Manager / Lead"
},
"CTO": {
"canonicalTitle": "Chief Technology Officer",
"seniority": "C-Suite / Founder"
},
"Engineering Manager": {
"canonicalTitle": "Engineering Manager",
"seniority": "Manager / Lead"
},
"Chief Revenue Officer (CRO)": {
"canonicalTitle": "Chief Revenue Officer",
"seniority": "C-Suite / Founder"
},
"Senior Talent Acquisition Specialist": {
"canonicalTitle": "Senior Talent Acquisition Specialist",
"seniority": "Senior / Mid"
},
"Senior Vice President": {
"canonicalTitle": "Senior Vice President",
"seniority": "VP / Director"
},
"Director of Business Development": {
"canonicalTitle": "Director of Business Development",
"seniority": "VP / Director"
},
"Founding Partner": {
"canonicalTitle": "Founding Partner",
"seniority": "C-Suite / Founder"
},
"Independent Consultant": {
"canonicalTitle": "Independent Consultant",
"seniority": "Senior / Mid"
},
"Vice President Operations": {
"canonicalTitle": "VP of Operations",
"seniority": "VP / Director"
},
"Operations Manager": {
"canonicalTitle": "Operations Manager",
"seniority": "Manager / Lead"
},
"President & CEO": {
"canonicalTitle": "President & CEO",
"seniority": "C-Suite / Founder"
},
"Chief Commercial Officer (CCO)": {
"canonicalTitle": "Chief Commercial Officer",
"seniority": "C-Suite / Founder"
},
"Assistant Professor": {
"canonicalTitle": "Assistant Professor",
"seniority": "Senior / Mid"
},
"Associate Professor": {
"canonicalTitle": "Associate Professor",
"seniority": "Senior / Mid"
},
"Regional Sales Director": {
"canonicalTitle": "Regional Sales Director",
"seniority": "VP / Director"
},
"Senior Technical Recruiter": {
"canonicalTitle": "Senior Technical Recruiter",
"seniority": "Senior / Mid"
},
"CEO and Co-founder": {
"canonicalTitle": "CEO & Co-Founder",
"seniority": "C-Suite / Founder"
},
"CEO & Co-Founder": {
"canonicalTitle": "CEO & Co-Founder",
"seniority": "C-Suite / Founder"
},
"Postdoctoral Researcher": {
"canonicalTitle": "Postdoctoral Researcher",
"seniority": "Junior / Associate"
},
"Director of Finance": {
"canonicalTitle": "Director of Finance",
"seniority": "VP / Director"
},
"Talent Acquisition Partner": {
"canonicalTitle": "Talent Acquisition Partner",
"seniority": "Senior / Mid"
},
"Project Controls Manager": {
"canonicalTitle": "Project Controls Manager",
"seniority": "Manager / Lead"
},
"Operating Partner": {
"canonicalTitle": "Operating Partner",
"seniority": "VP / Director"
},
"Vice President of Product Management": {
"canonicalTitle": "VP of Product Management",
"seniority": "VP / Director"
},
"Senior Program Manager": {
"canonicalTitle": "Senior Program Manager",
"seniority": "Manager / Lead"
},
"Sr. Recruiter": {
"canonicalTitle": "Senior Recruiter",
"seniority": "Senior / Mid"
},
"Adjunct Professor": {
"canonicalTitle": "Adjunct Professor",
"seniority": "Unknown / Other"
},
"Senior Process Engineer": {
"canonicalTitle": "Senior Process Engineer",
"seniority": "Senior / Mid"
},
"Founder/CEO": {
"canonicalTitle": "CEO & Founder",
"seniority": "C-Suite / Founder"
},
"Technical Program Manager": {
"canonicalTitle": "Technical Program Manager",
"seniority": "Manager / Lead"
},
"Sr. Project Manager": {
"canonicalTitle": "Senior Project Manager",
"seniority": "Manager / Lead"
},
"Real Estate Broker": {
"canonicalTitle": "Real Estate Broker",
"seniority": "Senior / Mid"
},
"Senior Director of Engineering": {
"canonicalTitle": "Senior Director of Engineering",
"seniority": "VP / Director"
},
"Director of Software Engineering": {
"canonicalTitle": "Director of Software Engineering",
"seniority": "VP / Director"
},
"Construction Manager": {
"canonicalTitle": "Construction Manager",
"seniority": "Manager / Lead"
},
"Chief Financial Officer": {
"canonicalTitle": "Chief Financial Officer",
"seniority": "C-Suite / Founder"
},
"Senior Project Director": {
"canonicalTitle": "Senior Project Director",
"seniority": "VP / Director"
},
"Technical Lead": {
"canonicalTitle": "Technical Lead",
"seniority": "Manager / Lead"
},
"Head of Product": {
"canonicalTitle": "Head of Product",
"seniority": "VP / Director"
},
"Talent Acquisition Manager": {
"canonicalTitle": "Talent Acquisition Manager",
"seniority": "Manager / Lead"
},
"Principal Recruiter": {
"canonicalTitle": "Principal Recruiter",
"seniority": "Senior / Mid"
},
"Founder, CEO": {
"canonicalTitle": "CEO & Founder",
"seniority": "C-Suite / Founder"
},
"Finance Manager": {
"canonicalTitle": "Finance Manager",
"seniority": "Manager / Lead"
},
"Sales Professional": {
"canonicalTitle": "Sales Professional",
"seniority": "Senior / Mid"
},
"Company Owner": {
"canonicalTitle": "Business Owner",
"seniority": "C-Suite / Founder"
},
"Regional Director": {
"canonicalTitle": "Regional Director",
"seniority": "VP / Director"
},
"Director of Recruiting": {
"canonicalTitle": "Director of Recruiting",
"seniority": "VP / Director"
},

"UX Researcher": {
"canonicalTitle": "UX Researcher",
"seniority": "Senior / Mid"
},
"Software Engineer": {
"canonicalTitle": "Software Engineer",
"seniority": "Senior / Mid"
},
"COO": {
"canonicalTitle": "COO",
"seniority": "C-Suite / Founder"
},
"Chief of Staff": {
"canonicalTitle": "Chief of Staff",
"seniority": "VP / Director"
},
"Recruiter": {
"canonicalTitle": "Recruiter",
"seniority": "Senior / Mid"
},
"Designer": {
"canonicalTitle": "Designer",
"seniority": "Senior / Mid"

},
"Career Break – Parental Leave": {
"canonicalTitle": "Career Break",
"seniority": "Unknown / Other"
},
"Lean Six Sigma Master Black Belt": {
"canonicalTitle": "Process Engineer",
"seniority": "Senior / Mid"
},
"No position at the moment": {
"canonicalTitle": "Unemployed",
"seniority": "Unknown / Other"
},
"Especialista en ventas": {
"canonicalTitle": "Sales Specialist",
"seniority": "Senior / Mid"
},
"Board Observer": {
"canonicalTitle": "Board Observer",
"seniority": "VP / Director"
},
"Afdelingsleder": {
"canonicalTitle": "Department Manager",
"seniority": "Manager / Lead"
},
"Estimator": {
"canonicalTitle": "Estimator",
"seniority": "Senior / Mid"
},
"Experienced Exploration Geoscientist": {
"canonicalTitle": "Senior Geoscientist",
"seniority": "Senior / Mid"
},
"Group TPM, Foundation Model and ML Infra": {
"canonicalTitle": "Technical Program Manager",
"seniority": "Manager / Lead"
},
"Speech Language Pathologist, PRN": {
"canonicalTitle": "Speech Language Pathologist",
"seniority": "Senior / Mid"
},
"Group Subsurface Manager": {
"canonicalTitle": "Subsurface Manager",
"seniority": "Manager / Lead"
},
"Compensation Mgr": {
"canonicalTitle": "Compensation Manager",
"seniority": "Manager / Lead"
},
"Podcast Host": {
"canonicalTitle": "Podcast Host",
"seniority": "Senior / Mid"
},
"Ecosystem Engagement Lead": {
"canonicalTitle": "Engagement Lead",
"seniority": "Manager / Lead"
},
"Facilities Coordinator - GWS @ NVIDIA": {
"canonicalTitle": "Facilities Coordinator",
"seniority": "Junior / Associate"
},
"Transformation and Integration Strategy": {
"canonicalTitle": "Strategy Specialist",
"seniority": "Senior / Mid"
},
"IoT Program Manager - Lighting Solutions": {
"canonicalTitle": "Program Manager",
"seniority": "Manager / Lead"
},
"Senior Territory Account Specialist - Ultra Rare Renal": {
"canonicalTitle": "Senior Account Specialist",
"seniority": "Senior / Mid"
},
"CCS Subsurface Manager": {
"canonicalTitle": "Subsurface Manager",
"seniority": "Manager / Lead"
},
"Pipeline Control Center & Ops Support Mgr": {
"canonicalTitle": "Operations Support Manager",
"seniority": "Manager / Lead"
},
"Seeking New Opportunities": {
"canonicalTitle": "Unemployed",
"seniority": "Unknown / Other"
}
};
