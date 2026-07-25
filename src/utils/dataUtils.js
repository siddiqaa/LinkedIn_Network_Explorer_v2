export function normalizeData(rows) {
  return rows.map(r => {
    const raw = (r["Position"] || "").trim();
    return {
      ...r,
      "Position_raw": raw,
      "Position": raw,
    };
  });
}

export function parseDate(str = "") {
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

export function generateSample() {
  // Define weighted company tiers across 2-digit NAICS sectors to produce realistic network clustering:
  // Tier 1: Major Network Anchors (32-45 contacts each)
  const tier1Companies = [
    "Alphabet / Google", "Deloitte", "JPMorgan Chase", "Boeing", "Mayo Clinic"
  ];
  // Tier 2: Strategic Enterprise Partners (15-22 contacts each)
  const tier2Companies = [
    "McKinsey & Company", "Microsoft", "ExxonMobil", "FedEx", "General Motors", "Pfizer", 
    "Johns Hopkins University", "Marriott International", "CBRE Group"
  ];
  // Tier 3: Mid-Size Regional & Sector Hubs (7-12 contacts each)
  const tier3Companies = [
    "Cargill", "Bechtel", "Goldman Sachs", "Procter & Gamble", "UPS", "Walt Disney Company", 
    "Kaiser Permanente", "Sysco Corporation", "Accenture", "UnitedHealth Group"
  ];
  // Tier 4: Boutique & Specialized Partners (3-6 contacts each)
  const tier4Companies = [
    "Tyson Foods", "Schlumberger", "Duke Energy", "Skanska", "3M", "Costco Wholesale", 
    "Delta Air Lines", "Sony", "Morgan Stanley", "Live Nation Entertainment", "American Red Cross", "NASA"
  ];

  const titlesByDept = [
    // Executive & General Management
    "Chief Executive Officer", "Chief Operating Officer", "President & Founder", "Managing Director", "Chief of Staff", "General Manager",
    // Engineering & Technology
    "Chief Technology Officer", "VP of Engineering", "Director of Software Engineering", "Engineering Manager", "Senior Software Engineer", "Systems Architect", "Mechanical Engineer", "DevOps Specialist", "Engineering Intern",
    // Finance & Accounting
    "Chief Financial Officer", "Vice President of Finance", "Director of Accounting", "Accounting Manager", "Senior Financial Analyst", "Corporate Comptroller", "Junior Accountant", "Auditor",
    // Sales & Business Development
    "Chief Revenue Officer", "VP of Global Sales", "Regional Director of Sales", "Business Development Lead", "Account Executive", "Senior Sales Associate", "Enterprise Account Manager",
    // Marketing & Communications
    "Chief Marketing Officer", "VP Marketing & Communications", "Director of Brand Strategy", "Product Marketing Manager", "Senior Brand Specialist", "PR & Communications Coordinator", "Marketing Assistant",
    // Operations & Logistics
    "VP Supply Chain & Logistics", "Director of Operations", "Plant Manager", "Supply Chain Lead", "Logistics Planner", "Warehouse Operations Director", "Logistics Coordinator",
    // People, HR & Recruiting
    "Chief People Officer", "VP Human Resources", "Director of Talent Acquisition", "HR Business Partner", "Recruitment Manager", "Talent Acquisition Specialist", "HR Assistant",
    // Product & Design
    "VP Product Management", "Director of Product", "Senior Product Manager", "UX/UI Design Lead", "Product Owner", "Industrial Designer", "User Researcher",
    // Legal, Risk & Compliance
    "Chief Legal Officer", "General Counsel", "Director of Risk & Compliance", "Corporate Attorney", "Compliance Officer", "Legal Counsel",
    // Customer Success & Support
    "VP Customer Experience", "Director of Customer Success", "Customer Success Manager", "Client Support Lead", "Customer Support Representative",
    // Consulting & Advisory
    "Senior Partner", "Managing Director of Advisory", "Principal Consultant", "Strategy Advisor", "Management Consultant", "Senior Advisory Board Member"
  ];

  const firstNames = [
    "Alex", "Jordan", "Morgan", "Casey", "Riley", "Quinn", "Avery", "Taylor", "Sam", "Drew",
    "Blake", "Reese", "Skyler", "Cameron", "Dakota", "Elena", "Marcus", "Priya", "Dmitri", "Aisha",
    "Carlos", "Mei-Ling", "Tariq", "Sven", "Fatima", "Hiroshi", "Chloe", "Mateo", "Khadija", "Liam",
    "Sofia", "Noah", "Aria", "Lucas", "Maya", "Ethan", "Layla", "Gabriel", "Nora", "Sebastian",
    "Oliver", "Emma", "Benjamin", "Ava", "Henry", "Charlotte", "Alexander", "Amelia", "Daniel", "Harper"
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Moore",
    "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Martinez", "Robinson",
    "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright",
    "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez"
  ];

  // Build target quota mapping for realistic Pareto distribution totaling ~500 contacts across 36 companies
  const companyQuotas = [];
  tier1Companies.forEach(c => companyQuotas.push({ company: c, count: Math.floor(35 + Math.random() * 8) })); // 35-42 each (~190 total)
  tier2Companies.forEach(c => companyQuotas.push({ company: c, count: Math.floor(16 + Math.random() * 7) })); // 16-22 each (~170 total)
  tier3Companies.forEach(c => companyQuotas.push({ company: c, count: Math.floor(8 + Math.random() * 5) }));   // 8-12 each  (~100 total)
  tier4Companies.forEach(c => companyQuotas.push({ company: c, count: Math.floor(3 + Math.random() * 3) }));   // 3-5 each   (~45 total)

  const rows = [];
  const now = new Date();
  let contactId = 100;

  companyQuotas.forEach(({ company, count }) => {
    for (let j = 0; j < count; j++) {
      contactId++;
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const title = titlesByDept[Math.floor(Math.random() * titlesByDept.length)];
      
      // Spread dates over 8 years (2920 days)
      const daysAgo = Math.floor(Math.random() ** 1.3 * 2920);
      const connDate = new Date(now - daysAgo * 86400000);
      const domain = company.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "company";
      const email = Math.random() > 0.2 ? `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}.com` : "";

      rows.push({
        "First Name": fn,
        "Last Name": ln,
        "URL": `https://www.linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}-${contactId}`,
        "Email Address": email,
        "Company": company,
        "Position": title,
        "Connected On": connDate.toISOString().split("T")[0],
      });
    }
  });

  return rows;
}
