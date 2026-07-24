# AGENTS.md

## Overview & Architecture

This repository contains the **LinkedIn Connections Analytics & Seniority Classifier** application built with **React**, **Vite**, and **Tailwind CSS**.

The app processes LinkedIn `Connections.csv` exports to visualize connection trends, top companies, monthly activity heatmaps, and AI-powered seniority classification.

### Core Features
- **Semantic Seniority Classifier (`src/lib/embeddingClassifier.js`)**: Uses `@xenova/transformers` (`all-MiniLM-L6-v2`) to compute semantic embeddings for job titles and classify them into 6 seniority levels:
  - Executive / C-Suite
  - VP / Senior Leadership
  - Director
  - Manager / Lead
  - Individual Contributor
  - Entry / Intern
- **Prototype Vector Map (`src/data/titleMap.js`)**: Maintains prototype vectors derived from 1,800+ title mappings for semantic cosine similarity matching.
- **Connections Table (`src/components/connections/ConnectionsTable.jsx`)**: Searchable, sortable, and paginated table with filter badges by Seniority classification.
- **Job Search Tooling (`src/components/jobSearch/JobSearch.jsx`)**: Target company, keyword, and location searching with direct query generators.

---

## Project Conventions & Guidelines

1. **Title Prototypes**:
   - Always preserve raw title variants from `titleMap.js` as prototype vectors to ensure high classification accuracy across diverse role titles.

2. **State Updates & React Performance**:
   - Avoid calling state updates synchronously inside rendering functions or unmemoized callback hooks.
   - Pre-compute and memoize classified data in table components using `useMemo`.

3. **Classification Strategy**:
   - Step 1: Direct exact map lookup (`titleMap.js`).
   - Step 2: Keyword-based lookup (`keywordMap.js`).
   - Step 3: Embeddings Cosine Similarity fallback via `@xenova/transformers`.

4. **Styling & Theme**:
   - Theme variables are centralized in `src/constants/theme.js`.
   - Maintain a dark, high-contrast, modern UI layout.
