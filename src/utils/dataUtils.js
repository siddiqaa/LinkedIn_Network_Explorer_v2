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
  const companies = ["Google","Microsoft","Apple","Meta","Amazon","Stripe","OpenAI","Anthropic","Netflix","Uber","Airbnb","Spotify","Notion","Linear","Figma","Vercel","Cloudflare","Databricks","Snowflake","Palantir","Independent","Freelance"];
  const titles = ["Software Engineer","Senior Engineer","Staff Engineer","Engineering Manager","Product Manager","Senior PM","Director of Engineering","VP Engineering","CTO","CEO","Designer","UX Researcher","Data Scientist","ML Engineer","DevOps Engineer","Marketing Manager","Sales Director","Recruiter","Founder","COO","Chief of Staff","Analyst","Associate","Intern"];
  const firstNames = ["Alex","Jordan","Morgan","Casey","Riley","Quinn","Avery","Taylor","Sam","Drew","Blake","Reese","Skyler","Cameron","Dakota"];
  const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White"];
  const rows = [];
  const now = new Date();
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() ** 1.5 * 2500);
    const d = new Date(now - daysAgo * 86400000);
    rows.push({
      "First Name": firstNames[Math.floor(Math.random()*firstNames.length)],
      "Last Name": lastNames[Math.floor(Math.random()*lastNames.length)],
      "URL": `https://www.linkedin.com/in/user-${i}`,
      "Email Address": Math.random() > 0.75 ? `user${i}@example.com` : "",
      "Company": companies[Math.floor(Math.random()*companies.length)],
      "Position": titles[Math.floor(Math.random()*titles.length)],
      "Connected On": d.toISOString().split("T")[0],
    });
  }
  return rows;
}
