---
name: deep-research
description: Conducts multi-stage, comprehensive research on complex topics by expanding queries, querying web search engines, crawling deep pages, and compiling reports with citations.
---

# Deep Research (深度多輪研究)

This skill enables the agent to act as a research analyst, systematically breaking down complex questions, collecting information from multiple web sources, compiling a synthesized report, and saving discoveries to the project wiki.

## Trigger Keywords
- "深度研究", "多階段調查", "系統性分析", "deep research", "compile research report", "investigate topic"

## Prerequisites
- Tavily CLI installed: `tvly`
- Or access to internet search APIs.

## Anti-Hallucination Guardrails
- **NEVER** invent facts or synthesize claims that are not backed by retrieved page sources.
- **NEVER** ignore opposing viewpoints. Report all consensus and alternative perspectives found in the sources.
- **ALWAYS** include explicit source links (citations) next to facts.

## Multi-Phase Workflow

### Phase 1: Discovery
1. Analyze the core research question.
2. Break it down into at least 3 distinct search sub-queries to cover different angles (background, implementation details, competitors, or technical details).
3. Identify the target format (e.g., Markdown Report, Comparative Table, Timeline).

### Phase 2: Execution
1. Run Tavily/web searches for all sub-queries.
2. Filter the top 5-10 high-relevance URLs.
3. Use `read_url_content` or `curl` to fetch the markdown/text content of key target pages.
4. Extract relevant quotes, figures, and definitions.

### Phase 3: Verification
1. Cross-reference data between different sources to identify contradictions or updates.
2. Draft the research report including:
   - Executive Summary
   - Background Details
   - Technical Evaluation / Findings
   - Comparison Matrix (if applicable)
   - Citations & Sources List
3. Validate that every cited claim matches the source text.

### Phase 4: Archive (Wiki Synthesis)
1. Write the final report into the `docs/` folder or save it as a markdown artifact.
2. Create/update corresponding files in `wiki/entities/` or `wiki/concepts/` to ingest the newly acquired technical knowledge.
3. Update `wiki/index.md` and log the ingestion in `wiki/log.md`.

## Verification Loop
1. Query Expansion -> verify: Deconstruct original prompt into 3 distinct keyword queries.
2. Multi-source Search -> verify: Retrieve top 5+ URLs with high semantic relevance.
3. Artifact Synthesis -> verify: Document compiled with clear sections, tables, and clickable citations.
