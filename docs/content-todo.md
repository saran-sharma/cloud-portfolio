# Content review list (internal)

This file is not rendered on the website. It records what was taken from the
updated resume, what was deliberately left out, and what still needs a decision.

## What was added from the updated resume

Source: `Resume (1).pdf` (Azure Data Platform Engineer headline, 04/2023 - Present).

- **Experience:** "At Capgemini since April 2023", and ten responsibility themes
  rewritten around the real work: medallion pipelines, incremental ingestion,
  backfills, data quality and reconciliation, Terraform and ARM, CI/CD, AKS,
  access reviews and ISO 27001 evidence, P1/P2 incident response, cost and health
  reporting, Synapse-to-Fabric migration support.
- **FMCP Metrics Platform & Dashboard** and **IDEAs: Dataset Onboarding & Backfills**
  are now featured case studies with real outcomes (reconciliation counts,
  backfill scale) and their own diagrams.
- **Outcomes** added where the resume states one: reporting automation, access
  review and ISO 27001 evidence automation.
- **Storage Modernization:** now says I led the assessment, using Azure CLI,
  AzCopy and PowerShell.
- **AI Incident Intelligence:** now includes executive summaries and is labelled a
  design, as in the resume.
- **Certifications:** AZ-104, AZ-204, DP-700, Databricks Certified Data Engineer
  Associate, and Claude Certified Associate - Foundations (Anthropic, August 2026).
- **Skills:** Serverless SQL, Spark pools, Azure SQL, Azure Data Explorer,
  medallion architecture, incremental ingestion, backfills, a new Data Quality &
  Modelling group, Programming & Querying, Azure Policy, ISO 27001 access reviews,
  Bicep and Helm marked as working exposure.
- **GymFlow AI** added under More engineering work, labelled as an independent
  project outside employment, in pilot validation.

## Left out or generalized on purpose (please approve)

- **Client and project name** ("Microsoft GDC", "Client: Microsoft"): not shown.
- **Internal systems:** SCOPE / Cosmos / ADLA is shown as "an internal big-data
  store"; "M365 usage datasets" as "five usage datasets"; PPE and PROD as
  pre-production and production.
- **Data volumes and counts** (3,499 pairs, 81,131 observations, 964,111 rows,
  about 57B, 6.7B and 51.8B rows) are published as the resume states them. Remove
  any you consider sensitive.
- **Dashboard** is called "the accepted Power BI dashboard" without naming the
  owner.

## Decisions needed

| Item | Resume says | Website says | Decision |
| --- | --- | --- | --- |
| Job title | Senior Cloud & DevOps Engineer | Data Platform Engineer | The resume keeps the Senior title while its headline says Azure Data Platform Engineer. Confirm which title the website should use. |
| Download Resume file | New resume has the data content | [public/resume.pdf](../public/resume.pdf) is still the older resume (Cloud & DevOps, AZ-104 to Databricks list, no data work) | Replace it with the updated resume? Not done, because it names the client and internal figures that the website generalizes. |
| Employment date | 04/2023 - Present | "At Capgemini since April 2023" | Shown at company level only, not as a role start date. |
| Experience years | 3+ years | Not stated | Add "3+ years" if you want it. |
| Skills not shown | AWS working knowledge, Prometheus, Grafana, n8n, Linux, Windows Server | Not shown | Decide whether any belong in the toolkit. |
| Skills on the site, not in the resume | OpenAI, Azure AI Foundry, Copilot Studio, MCP, Jenkins, Ansible | Shown | Add them to the resume or remove them here. |
| Projects on the site, not in the resume | Operational Health & Cost, PIM & Access Review, Copilot Studio + MCP, Data Engineering Platform | Shown | The resume covers the first two only in bullets. Add them if you want them backed. |
| Links | No LinkedIn or GitHub | Both shown | Add them to the resume. |
| Education, contact | Match | Match | Consistent. |

## Details that would still strengthen the case studies

- **Operational Health & Cost:** a sanitized report layout; confirm the Synapse,
  SQL, Python and PowerShell split.
- **AI Incident Intelligence:** what runs today vs. the design; an evaluation if
  one exists. The resume's agent platform name is left out of public text.
- **Storage Modernization:** what was recommended and what was migrated, if
  anything, as a range.
- **PIM & Access Review:** which parts are live; a sanitized runbook excerpt.
- **Copilot Studio + MCP:** which tools work end to end and what is unfinished.
- **GymFlow AI:** a link, screenshots or the pilot's scope, if you want to share it.
- **Hero photo:** [src/assets/profilepic.jpeg](../src/assets/profilepic.jpeg) looks
  heavily stylized. A natural, well-lit photo would feel more personal.
