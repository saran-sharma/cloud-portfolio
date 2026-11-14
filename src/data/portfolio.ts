export type VisualId = "cost" | "incident" | "storage" | "pim" | "data" | "mcp" | "medallion" | "onboarding";

export type Project = {
  id: string;
  title: string;
  category: string;
  workType: string;
  tier: "featured" | "additional";
  summary: string;
  myPart: string;
  highlight?: string;
  what: string;
  why?: string;
  role: string;
  tools: string[];
  visual?: VisualId;
  visualCaption?: string;
  challenges?: string[];
  outcomes?: string[];
};

export const projects: Project[] = [
  {
    id: "fmcp-dashboard",
    title: "FMCP Metrics Platform & Dashboard",
    category: "Data platform / Analytics",
    workType: "Data engineering and reporting",
    tier: "featured",
    summary: "PySpark and Delta Lake pipelines on Azure Synapse that feed a governed, seven-domain metrics layer behind a Power BI dashboard, reconciled to the accepted numbers.",
    myPart: "Medallion pipelines, incremental ingestion, data quality gates, reconciliation and the metrics layer.",
    highlight: "3,499 date and metric pairs reconciled to the accepted dashboard.",
    what: "An end-to-end data pipeline and metrics layer on Azure Synapse, Data Factory and ADLS Gen2. PySpark and Delta Lake pipelines run across Bronze, Silver and Gold layers, Data Factory orchestrates them, and Serverless SQL views feed the reporting dashboard.",
    why: "A dashboard is only useful if its numbers can be trusted. The platform brings pipeline, incident, Fabric capacity, cost, data quality, data asset and data source metrics into one governed layer, so the dashboard reads from a single source.",
    role: "I built the PySpark and Delta Lake pipelines and the Data Factory orchestration, implemented watermark-based incremental ingestion with Delta MERGE and replaceWhere loads, and designed the seven-domain metrics layer with a versioned metric registry and governed SQL datasets. I also hardened data quality, ran the reconciliation, and automated twice-daily Fabric capacity metrics with Semantic Link and DAX extraction.",
    tools: ["Azure Synapse Analytics", "Azure Data Factory", "ADLS Gen2", "Delta Lake", "PySpark", "Microsoft Fabric", "Serverless SQL", "Power BI"],
    visual: "medallion",
    visualCaption: "Reference architecture of the metrics platform. Internal systems and names are omitted.",
    challenges: [
      "Making first runs and reruns idempotent: a watermark bootstrap defect was fixed with a one-day lookback fallback.",
      "Keeping data quality honest: deduplication priority was corrected and a 1% quarantine threshold added, with audit columns for traceability.",
      "Proving the numbers: every date and metric pair had to match the accepted dashboard, and gap days needed a historical backfill.",
    ],
    outcomes: [
      "All 3,499 date and metric pairs, December 2025 to September 2026, were reconciled against the accepted Power BI dashboard.",
      "81,131 missing Bronze pipeline-run observations were recovered across gap days through historical backfill.",
      "Validation was re-run successfully over 964,111 rows after the data quality fixes.",
      "Fabric capacity metrics are extracted twice daily and exposed through serverless SQL views.",
    ],
  },
  {
    id: "ideas",
    title: "IDEAs: Dataset Onboarding & Backfills",
    category: "Data platform / Engineering",
    workType: "Data engineering",
    tier: "featured",
    summary: "A config-driven framework that onboards datasets from an internal big-data store into ADLS Gen2 Delta tables, and the large backfills and restatements run through it.",
    myPart: "Dataset onboarding, large backfills, schema drift handling and production repairs.",
    highlight: "A dataset of about 57 billion rows promoted to production.",
    what: "A dataset onboarding and backfill workstream. A config-driven framework with parameter groups and CHECK and DEPLOY modes ingests datasets from an internal big-data store into ADLS Gen2 Delta tables, using PySpark transformations and reusable executors.",
    why: "Onboarding many datasets by hand does not scale. A configuration-driven approach makes each onboarding repeatable and lets it be checked before it is deployed.",
    role: "I onboarded datasets through the framework and ran the large historical backfills and restatements, promoting each from pre-production to production. I diagnosed schema drift, handled schema evolution and deduplication, and carried out production repairs with root cause analysis.",
    tools: ["PySpark", "Delta Lake", "ADLS Gen2"],
    visual: "onboarding",
    visualCaption: "Onboarding and promotion flow. Source systems and environment names are omitted.",
    challenges: [
      "Schema drift: a source moved from 45 to 51 columns, so schema evolution and deduplication had to keep downstream Delta tables consistent.",
      "Production repairs: NULL snapshot dates from a stale production script, duplicate loads, trigger failures and ADLS 403 AuthorizationPermissionMismatch errors each needed root cause analysis.",
      "Scale: moving billions of rows between environments while keeping the data checkable against the source.",
    ],
    outcomes: [
      "A dataset of about 57 billion rows across 570 snapshots was backfilled, with a SnapshotDate column added, and promoted from pre-production to production.",
      "An 18-month sales backfill and a 69-date reload of about 6.7 billion rows in the EU production environment were completed.",
      "About 51.8 billion rows across five usage datasets were restated, validated and reconciled against source counts.",
    ],
  },
  {
    id: "operational-health",
    title: "Operational Health & Cost Intelligence",
    category: "Platform analytics / FinOps",
    workType: "Reporting automation",
    tier: "featured",
    summary: "Automated cost and operational health reporting for a data platform, built on SQL and Synapse reporting with subscription- and resource-level cost mapping.",
    myPart: "Reporting automation, SQL analysis, occupancy configuration and cost mapping.",
    highlight: "Monthly cost and weekly health reports run on automation.",
    what: "A reporting workstream covering operational health metrics, platform resource reporting and subscription- and resource-level cost analysis. Reports are produced by automation built with Python, PowerShell and Azure services, with SQL-based reporting on Synapse.",
    why: "A platform team needs to see how the platform is running and what it costs in the same place, with cost traced back to the resources and configuration behind it.",
    role: "I automated the monthly cost and weekly health reporting, wrote the SQL-based analysis, and worked on the occupancy configuration and cost-mapping logic that links resource cost to its allocation.",
    tools: ["Azure Synapse Analytics", "SQL", "Python", "PowerShell", "Azure Cost Analysis", "Dashboards"],
    visual: "cost",
    visualCaption: "Reporting architecture from source data to dashboards. Internal systems, names and figures are omitted.",
    challenges: [
      "Keeping cost-mapping and allocation rules consistent as resources and configuration change.",
      "Treating a discrepancy in a report as something to investigate, not as a saving that has been realized.",
      "Keeping subscription identifiers, resource names and financial figures out of anything public.",
    ],
    outcomes: ["Monthly Azure cost reporting and weekly operational health reporting run on automation, reducing recurring manual effort."],
  },
  {
    id: "incident-intelligence",
    title: "AI Incident Intelligence",
    category: "AI engineering / Intelligent operations",
    workType: "AI initiative / design",
    tier: "featured",
    summary: "A design that pairs KQL analysis with GPT-based agents to speed up incident investigation and root cause correlation, with an engineer validating every conclusion.",
    myPart: "The investigation workflow design: KQL analysis and GPT-based agents.",
    what: "An AI-assisted incident workflow that combines operational telemetry, KQL-based pattern analysis and GPT-based agents. Its aim is faster pattern analysis, root cause correlation and executive summaries.",
    why: "Investigating an incident means connecting signals across logs, alerts and recurring patterns. The workflow aims to shorten that search while keeping the evidence in front of the engineer.",
    role: "I designed the workflow: KQL analysis that surfaces patterns in telemetry, and agents that summarize the evidence, correlate likely causes and draft executive summaries for an engineer to review.",
    tools: ["KQL", "Log Analytics", "GPT-based agents", "OpenAI"],
    visual: "incident",
    visualCaption: "Conceptual investigation flow. It describes the design, not a measured production result.",
    challenges: [
      "Telling correlation apart from cause, so that suggestions stay tied to the telemetry.",
      "Keeping an engineer's decision between an AI suggestion and any operational action.",
      "Working with incident data without exposing internal identifiers.",
    ],
  },
  {
    id: "storage-modernization",
    title: "Azure Storage Modernization",
    category: "Azure architecture / Governance",
    workType: "Assessment and planning",
    tier: "featured",
    summary: "Discovery and dependency analysis across Azure subscriptions to plan the move from Gen1 storage to StorageV2 and ADLS Gen2, with lifecycle and tiering recommendations.",
    myPart: "I led the assessment: discovery, dependency analysis, migration planning, tiering and diagnostics review.",
    what: "An assessment of Azure storage accounts across subscriptions: discovering and auditing accounts, analysing their usage, and planning modernization from Gen1 to StorageV2 and ADLS Gen2.",
    why: "Whether and how to modernize an account depends on what actually uses it, not only on its type.",
    role: "I led the assessment. Using Azure CLI, AzCopy and PowerShell, I ran the discovery and auditing, analysed usage, traced references from Data Factory, Synapse and Databricks, planned the migration approach and automated the repetitive steps. I also reviewed diagnostic settings for compliance and prepared lifecycle and Hot, Cool and Archive tiering recommendations.",
    tools: ["Azure CLI", "AzCopy", "PowerShell", "Azure Storage", "ADLS Gen2", "Azure Data Factory", "Azure Synapse Analytics", "Azure Databricks"],
    visual: "storage",
    visualCaption: "Assessment decision flow. It shows how each account was evaluated, not a claim that every account was migrated.",
    challenges: [
      "Finding every dependency on an account, across pipelines, workspaces and notebooks, before recommending a change.",
      "Choosing tiers: Hot, Cool and Archive trade storage cost against access cost and latency.",
      "Gen1 and StorageV2 modernization follow different paths, so each account needs its own assessment.",
    ],
  },
  {
    id: "access-review",
    title: "PIM & Access Review Automation",
    category: "Cloud security / Automation",
    workType: "Automation and runbooks",
    tier: "featured",
    summary: "PowerShell runbooks on Azure Automation, authenticated with Managed Identity, that discover PIM eligible assignments and automate access review reporting and ISO 27001 audit evidence.",
    myPart: "PowerShell automation, Managed Identity authentication, CSV reporting and SOPs.",
    highlight: "Access reviews and ISO 27001 audit evidence automated.",
    what: "Automation for privileged access governance: Azure Automation runbooks in PowerShell that discover PIM eligible assignments, support role activation workflows and automate User Access Review reporting and ISO 27001 audit evidence.",
    why: "Access reviews and PIM activity are repetitive and need to be consistent and auditable. Runbooks make the process repeatable and its output reviewable.",
    role: "I wrote the PowerShell runbooks, set up Managed Identity authentication with least-privilege RBAC, built the PIM eligible-assignment discovery and User Access Review reporting, produced the CSV output and documented the operating procedure as SOPs.",
    tools: ["PowerShell", "Azure CLI", "Python", "Azure Automation", "Managed Identity", "Azure Key Vault", "Microsoft Entra ID", "Privileged Identity Management"],
    visual: "pim",
    visualCaption: "Automation workflow. Privileged activation stays subject to each user's own PIM eligibility and policy.",
    challenges: [
      "Giving the automation only the permissions it needs, kept separate from a user's own PIM eligibility.",
      "Keeping activation inside policy: approval and justification requirements still apply.",
      "Running operational automation under enterprise authentication and policy constraints.",
    ],
    outcomes: ["User Access Review reporting and ISO 27001 audit evidence generation run through automation rather than manual collection."],
  },
  {
    id: "data-platform",
    title: "Azure Data Engineering Platform",
    category: "Data engineering / Cloud data platforms",
    workType: "Hands-on platform experience",
    tier: "additional",
    summary: "How ingestion, lake storage, Spark processing, governance and consumption fit together on Azure and Microsoft Fabric, drawn from my own workloads.",
    myPart: "Building and operating pipelines and Spark processing, and supporting the Synapse-to-Fabric migration.",
    what: "How Azure Data Factory, ADLS Gen2, Synapse, Databricks, PySpark, Delta Lake, Microsoft Fabric, OneLake and Purview fit into an enterprise data platform, drawn from practical experience across different workloads.",
    why: "Each service has a job: moving data in, storing it, transforming it, governing it and serving it. Knowing where each one fits is what keeps a platform dependable.",
    role: "I work with these services in my platform engineering role: building and operating pipelines, running Spark processing, and looking after the storage, SQL and governance layers around them. I also supported Synapse-to-Microsoft Fabric migration activities: assessment, validation and CI/CD integration.",
    tools: ["Azure Data Factory", "ADLS Gen2", "Azure Synapse Analytics", "Azure Databricks", "PySpark", "Delta Lake", "Microsoft Fabric", "OneLake", "Microsoft Purview", "SQL"],
    visual: "data",
    visualCaption: "Reference pattern drawn from separate workloads. It is not a single deployed stack.",
    challenges: [
      "Choosing the right layer for each job: pipeline orchestration, Spark transformation or SQL serving.",
      "Keeping governance and lineage in view across separate workloads.",
      "Making failures easy to find and fix when pipelines are operated, not only built.",
    ],
  },
  {
    id: "copilot-mcp",
    title: "Copilot Studio + MCP Integration",
    category: "AI integrations / Enterprise automation",
    workType: "Integration exploration",
    tier: "additional",
    summary: "Connecting Copilot Studio to enterprise APIs through an MCP server on Azure Functions, secured with Microsoft Entra ID.",
    myPart: "The Azure Functions tool host, app registration, authentication and API connections.",
    what: "An integration exploration using Microsoft Copilot Studio and the Model Context Protocol, with tools hosted on Azure Functions and secured through a Microsoft Entra app registration.",
    why: "An assistant is more useful when it can call real enterprise APIs, but each tool call needs authentication and authorization.",
    role: "I worked on the integration: the Azure Functions tool host, the app registration, authentication and authorization, and the API connections.",
    tools: ["Microsoft Copilot Studio", "Model Context Protocol", "Azure Functions", "Microsoft Entra ID", "API integrations"],
    visual: "mcp",
    visualCaption: "Conceptual integration flow. Keys, secrets and internal endpoints are never part of the design shown.",
    challenges: [
      "Authenticating the agent and authorizing each tool call, not only reaching the API.",
      "Keeping keys, secrets and internal endpoints out of code and out of anything public.",
    ],
  },
  {
    id: "gymflow-ai",
    title: "GymFlow AI",
    category: "Independent project",
    workType: "Personal project, outside my employment",
    tier: "additional",
    summary: "A gym-operations SaaS, with a mobile app and an API, that I built on my own time. It is now in pilot validation.",
    myPart: "The mobile app, the API and the delivery pipeline.",
    what: "A gym-operations SaaS made up of a mobile app and an API. It is an independent project, not part of my employment, and it is currently in pilot validation.",
    role: "I built the mobile app and the API on my own time, outside my job at Capgemini.",
    tools: ["React Native", "Expo", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "GitHub Actions"],
  },
];

export const portfolio = {
  profile: {
    name: "Saran S.",
    title: "Data Platform Engineer | AI & Cloud",
    location: "Chennai, India",
    email: "saransivakumar.work@gmail.com",
    phone: "+91 80560 15473",
    linkedin: "https://www.linkedin.com/in/saransharmamech/",
    github: "https://github.com/saran-sharma",
    resumeUrl: "/resume.pdf",
  },
  about: {
    paragraphs: [
      "I'm a Data Platform Engineer at Capgemini in Chennai. I started on the Azure platform side and moved into data engineering more recently. Today I build and operate PySpark and Delta Lake pipelines on Azure Synapse, Data Factory and ADLS Gen2, and I take care of the parts that make data trustworthy: backfills, quality gates, reconciliation and a governed metrics layer.",
      "The platform side hasn't gone away. I run production Azure operations, resolve incidents through log analysis and root cause analysis, and automate repeated work with Terraform, Azure DevOps, GitHub Actions, PowerShell and Python.",
      "I'm also exploring how AI can help with operational work, such as pairing GPT-based agents with KQL analysis for incident investigation, with an engineer validating what the agent suggests.",
    ],
    principles: [
      { title: "Understand before changing", text: "Read the logs, the pipeline and the dependencies first. Most fixes get smaller once the cause is clear." },
      { title: "Prove the numbers", text: "Reconcile against the source before anyone relies on a dashboard." },
      { title: "Automate the repeatable", text: "If a task happens more than twice, it becomes a script or a pipeline." },
      { title: "Leave it documented", text: "Runbooks and SOPs, so someone else can operate it too." },
    ],
    journey: [
      { when: "2018 - 2022", title: "B.E. in Mechanical Engineering", detail: "SRM Valliammai Engineering College" },
      { when: "April 2023 - now", title: "Capgemini, Chennai", detail: "Azure platform engineering, now focused on data engineering" },
      { when: "2025 - 2027", title: "M.Tech in Cloud Computing", detail: "BITS Pilani WILP, in progress" },
    ],
  },
  experience: [
    {
      company: "Capgemini",
      role: "Data Platform Engineer",
      location: "Chennai, India",
      since: "At Capgemini since April 2023",
      intro: "Building, automating and operating Azure cloud infrastructure and enterprise data platforms.",
      themes: [
        { title: "Data platform engineering", text: "PySpark and Delta Lake pipelines on Azure Synapse across a Bronze, Silver and Gold layout on ADLS Gen2, orchestrated with Data Factory and served through Serverless SQL views." },
        { title: "Ingestion and backfills", text: "Watermark-based incremental ingestion, Delta MERGE and replaceWhere loads, and large historical backfills and restatements promoted from pre-production to production." },
        { title: "Data quality and reconciliation", text: "Validation and quarantine rules, audit columns, and reconciliation against source counts and the accepted dashboard." },
        { title: "Azure cloud and infrastructure", text: "Standardizing Azure infrastructure across subscriptions with Terraform and ARM templates, and running production operations across compute, storage, networking, identity and monitoring." },
        { title: "DevOps and automation", text: "Azure DevOps YAML and GitHub Actions pipelines with validation gates and controlled production releases, plus Docker and Kubernetes workloads on AKS." },
        { title: "Identity, access and compliance", text: "Least-privilege RBAC, Key Vault and Managed Identity, with access reviews and ISO 27001 audit evidence automated using PowerShell, Azure CLI and Python." },
        { title: "Monitoring and incident response", text: "Azure Monitor, Log Analytics and KQL. P1 and P2 incidents resolved through log analysis, root cause analysis and change management." },
        { title: "Cost and operational reporting", text: "Monthly Azure cost reporting and weekly operational health reporting, automated to cut recurring manual effort." },
        { title: "Modernization and migration", text: "Supporting Synapse-to-Microsoft Fabric migration activities, and leading the ADLS Gen1-to-Gen2 modernization assessment." },
        { title: "AI-enabled automation", text: "Exploring GPT-based agents, Copilot Studio and the Model Context Protocol for operational workflows." },
      ],
    },
  ],
  education: [
    { school: "BITS Pilani WILP", degree: "M.Tech in Cloud Computing", period: "2025 - 2027" },
    { school: "SRM Valliammai Engineering College", degree: "B.E. in Mechanical Engineering", period: "2018 - 2022" },
  ],
  skills: [
    {
      category: "Data Engineering",
      purpose: "From ingestion to governed, usable data.",
      items: ["Azure Synapse Analytics", "Serverless SQL", "Spark pools", "Azure Data Factory", "ADLS Gen2", "Azure Databricks", "Apache Spark", "PySpark", "Delta Lake", "Microsoft Fabric", "OneLake", "Azure SQL", "Azure Data Explorer", "Medallion architecture", "Incremental ingestion", "Backfills"],
      projectId: "fmcp-dashboard",
    },
    {
      category: "Data Quality & Modelling",
      purpose: "Data you can check and explain.",
      items: ["Validation and quarantine rules", "Reconciliation", "Audit and provenance columns", "Bridge-table modelling", "Versioned metric registry", "Governed datasets"],
      projectId: "fmcp-dashboard",
    },
    {
      category: "Programming & Querying",
      purpose: "The languages behind the pipelines and automation.",
      items: ["Python", "SQL", "KQL", "PowerShell", "Bash"],
      projectId: "ideas",
    },
    {
      category: "Cloud & Platform Engineering",
      purpose: "Infrastructure that is observable and operable.",
      items: ["Microsoft Azure", "Azure Resource Management", "Azure Storage", "Virtual Machines", "Azure Networking", "Key Vault", "Azure Monitor", "Log Analytics", "Application Insights"],
      projectId: "storage-modernization",
    },
    {
      category: "DevOps & Infrastructure Automation",
      purpose: "Repeatable changes and less operational toil.",
      items: ["Terraform", "ARM Templates", "Bicep (working exposure)", "Azure DevOps Pipelines", "GitHub Actions", "YAML", "Git", "Azure CLI", "Docker", "Kubernetes / AKS", "Helm (working exposure)", "Jenkins", "Ansible"],
      projectId: "access-review",
    },
    {
      category: "Identity & Security",
      purpose: "Access boundaries and accountable governance.",
      items: ["Microsoft Entra ID", "Azure RBAC", "Managed Identities", "Service Principals", "PIM", "Azure Key Vault", "Azure Policy", "ISO 27001 access reviews", "Microsoft Purview"],
      projectId: "access-review",
    },
    {
      category: "AI & Automation",
      purpose: "Intelligent assistance with an engineer in the loop.",
      items: ["OpenAI", "Azure AI Foundry", "Copilot Studio", "Model Context Protocol", "GPT-based Agents", "AI-assisted Incident Intelligence"],
      projectId: "incident-intelligence",
    },
    {
      category: "Monitoring, Operations & Reporting",
      purpose: "Turning operational signals into useful context.",
      items: ["KQL", "Azure Monitor", "Log Analytics", "Application Insights", "Alerting", "Incident triage and RCA", "Runbooks", "Azure Automation", "Power BI", "Cost Analysis", "Operational Reporting"],
      projectId: "operational-health",
    },
  ],
  projects,
  certifications: [
    { name: "Microsoft Certified: Azure Administrator Associate (AZ-104)", issuer: "Microsoft" },
    { name: "Microsoft Certified: Azure Developer Associate (AZ-204)", issuer: "Microsoft" },
    { name: "Microsoft Certified: Fabric Data Engineer Associate (DP-700)", issuer: "Microsoft" },
    { name: "Databricks Certified Data Engineer Associate", issuer: "Databricks" },
    { name: "Claude Certified Associate - Foundations", issuer: "Anthropic", date: "August 2026" },
  ],
};

export type Portfolio = typeof portfolio;
