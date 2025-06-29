# Data Alchemist: AI-Powered Resource Configurator

A Next.js + TypeScript web application that brings order and intelligence to resource management by enabling users to upload, validate, and configure data with AI assistance.

## Features

- Upload and parse CSV/XLSX files (clients, workers, tasks)
- Auto-map misnamed columns using AI
- Display editable data grids for each entity
- Validate data with real-time feedback and error highlights
- Support natural language search and corrections
- Allow rule creation via UI or plain English
- Enable users to set priority weights via sliders, ranking, or presets
- Export cleaned data + rules.json for downstream use

## Data Entities

- **clients.csv**: ClientID, ClientName, PriorityLevel (1-5), RequestedTaskIDs, GroupTag, AttributesJSON
- **workers.csv**: WorkerID, Skills, AvailableSlots [1,2], MaxLoadPerPhase, WorkerGroup, QualificationLevel
- **tasks.csv**: TaskID, Duration, RequiredSkills, PreferredPhases (e.g. [1,2]), MaxConcurrent

## Core Validations

- Missing required columns
- Duplicate IDs
- Malformed lists (non-numeric slots)
- Out-of-range values (e.g. PriorityLevel > 5)
- Broken JSON in AttributesJSON
- Unknown references (e.g. bad RequestedTaskIDs)
- Circular co-run groups (A→B→C→A)
- Conflicting rules or constraints

## AI Features

- AI Header Mapping: Detect & correct misnamed/missing columns
- Natural Language Search: e.g., "Tasks > 1 phase in Phase 2"
- Smart Suggestions: Recommend fixes for validation errors
- Natural Language Rule Creation: e.g., "T1 must run with T2"
- AI Rule Hints: e.g., "Sales team overloaded, add limit?"

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.