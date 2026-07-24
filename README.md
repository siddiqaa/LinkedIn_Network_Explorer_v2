# LinkedIn Network Explorer

A fast, privacy-first dashboard for exploring and analyzing your LinkedIn network. Upload your LinkedIn `Connections.csv` or load the built-in sample dataset to instantly visualize network growth, company distribution, job seniority, and position trends — 100% client-side with no data leaving your browser.

| | | | |
|---|---|---|---|
| ![Dashboard preview 1](/screenshots/Screenshot%202026-05-16%206.02.59%20PM.png) | ![Dashboard preview 2](/screenshots/Screenshot%202026-05-16%206.03.09%20PM.png) | ![Dashboard preview 3](/screenshots/Screenshot%202026-05-16%206.03.15%20PM.png) | ![Dashboard preview 4](/screenshots/Screenshot%202026-05-16%206.03.20%20PM.png) |

---

## Features

- **Sample Data Demo** — Try out all visual dashboards immediately with a built-in sample dataset without needing your CSV upfront
- **Network Growth Analytics** — Time series and monthly connection heatmaps tracking activity over time
- **Seniority Breakdown** — Automatic classification into Executive, Director, Manager, Senior, Mid, Junior, and Founder levels
- **Company & Title Insights** — Interactive ranking of top employer companies and popular job titles across your network
- **Targeted Jobs Search** — Select companies from your network and jump straight to relevant live job listings
- **Searchable Connections Directory** — Filterable table with keyword search, sorting, pagination, and direct LinkedIn profile links
- **100% Privacy-First** — Parsed entirely in-browser using FileReader & PapaParse. Zero network requests or telemetry on your data

---

## Getting your Connections.csv from LinkedIn

LinkedIn allows you to export your connections history at any time:

### Step 1 — Request your data

1. Sign in to [LinkedIn](https://www.linkedin.com)
2. Click your profile avatar in the top right → **Settings & Privacy**
3. Select **Data Privacy** in the left navigation
4. Click **Get a copy of your data**

### Step 2 — Select Connections

Select **Connections** from the data list and click **Request archive**.

### Step 3 — Download & Extract

1. You will receive an email notification when the file is ready (~10 minutes)
2. Download and unzip the archive
3. Extract `Connections.csv` and drag it into LinkedIn Network Explorer

> **Note:** LinkedIn includes introductory header comments in `Connections.csv`. The explorer automatically strips header notes and parses the data correctly.

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/siddiqaa/linkedin_network_explorer.git
cd linkedin_network_explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or default Vite port) in your browser.

### Building for Production

```bash
npm run build
```

The compiled static bundle will be generated in `dist/`.

---

## Tech Stack

| Component | Library / Tool |
|---|---|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Data Visualization | Recharts |
| CSV Parser | PapaParse |
| Styling | Modern CSS & Custom Variables |

---

## CSV Data Schema

LinkedIn Network Explorer processes standard `Connections.csv` exports containing:

| Column | Description |
|---|---|
| `First Name` | Contact's first name |
| `Last Name` | Contact's last name |
| `URL` | LinkedIn profile link |
| `Email Address` | Shared email address (if visible) |
| `Company` | Employer name at time of export |
| `Position` | Job title |
| `Connected On` | Connection date |

---

## License

MIT — feel free to use and customize as needed.

