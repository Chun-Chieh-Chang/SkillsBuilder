---
name: office-processor
description: Extracts text/data from and generates properly formatted office documents including Excel (.xlsx), Word (.docx), PDF (.pdf), and PowerPoint (.pptx).
---

# Office Document Processor (辦公文件處理)

This skill enables the agent to parse, scrape, process, and generate professional documents and spreadsheets using system libraries, adhering to strict layout rules.

## Trigger Keywords
- "處理Excel", "讀取Excel", "寫入Word", "解析PDF", "轉化PPT", "office document processing", "excel parser"

## Prerequisites
- Node.js or Python installed on the host.
- Python packages: `pandas`, `openpyxl`, `python-docx`, `python-pptx`, `pypdf`
- OR Node.js packages: `xlsx`, `docx`, `pdf-parse`, `pptxgenjs`

## Anti-Hallucination Guardrails
- **DO NOT** attempt to edit files in-place without backup. Always create a backup file or output to a new file path.
- **DO NOT** discard formatting, styling, or existing headers unless explicitly requested.
- **DO NOT** write large dataset files to stdout. Direct all large parsed outputs to structured files (CSV, JSON, Markdown).

## Multi-Phase Workflow

### Phase 1: Discovery
1. Check the target file path and type (Excel, Word, PDF, PPT).
2. Check available runtimes (Python or Node) and install dependencies if missing.
3. Establish a schema target (what fields need to be extracted or generated).

### Phase 2: Execution
1. Create a script (Python/JS) under the `scratch/` folder to load and parse/generate the document.
2. Execute the script via command line.
3. Save the result to the workspace or target output folder.

### Phase 3: Verification
1. Validate output file structure (columns, tables, sheets).
2. Check for corruption by reading the output file back in a test script.
3. Present the result or summary to the user.

### Phase 4: Archive (Wiki Synthesis)
1. Clean up scratch scripts.
2. Log the execution metrics (file size, rows processed, runtime).
3. If new data structures or template formulas are discovered, document them in the project wiki.

## Verification Loop
1. Verify document integrity before change -> verify: Target file can be read and parsed without error.
2. Run conversion/processing script -> verify: Script finishes with exit code 0 and outputs file.
3. Validate output file -> verify: Read back of output file matches the target schema and size is >0 bytes.
