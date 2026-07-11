#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PPT Master - NotebookLM Document Parser

Converts Google NotebookLM exports (FAQs, Study Guides, Briefings) 
into highly structured, slide-ready Markdown aligned with the
"Consulting Box" grid and double-column card patterns.

Usage:
    python3 skills/ppt-master/scripts/source_to_md/notebooklm_to_md.py <input_file> -o <output_file>

Examples:
    python3 skills/ppt-master/scripts/source_to_md/notebooklm_to_md.py study_guide.md -o processed_source.md
"""

import sys
import argparse
import re
from pathlib import Path
from typing import Optional, Tuple, List


def parse_notebooklm(content: str) -> Tuple[List[Tuple[str, str]], List[Tuple[str, str]], List[Tuple[str, str]]]:
    """Parse NotebookLM Study Guide and FAQ formats into structured data.
    
    Returns:
        (faqs, key_terms, essay_questions)
    """
    lines = content.splitlines()
    faqs: List[Tuple[str, str]] = []
    key_terms: List[Tuple[str, str]] = []
    essay_questions: List[Tuple[str, str]] = []
    
    current_q: Optional[str] = None
    current_a_lines: List[str] = []
    current_section = "general"
    
    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        # Detect sections
        lower_line = line_str.lower()
        if "key terms" in lower_line:
            current_section = "key_terms"
            if current_q and current_a_lines:
                faqs.append((current_q, "\n".join(current_a_lines).strip()))
                current_q = None
                current_a_lines = []
            continue
        elif "essay questions" in lower_line or "essay question" in lower_line:
            current_section = "essay_questions"
            if current_q and current_a_lines:
                faqs.append((current_q, "\n".join(current_a_lines).strip()))
                current_q = None
                current_a_lines = []
            continue
        elif "faq" in lower_line or "frequently asked questions" in lower_line:
            current_section = "faq"
            if current_q and current_a_lines:
                faqs.append((current_q, "\n".join(current_a_lines).strip()))
                current_q = None
                current_a_lines = []
            continue
            
        # 1. Look for FAQ question/answer
        q_match = re.match(r'^(?:\*\*(?:Question|Q):\*\*|\*\*(?:Question|Q)\*\*|Question:|Q:)\s*(.*)', line_str, re.IGNORECASE)
        if q_match:
            if current_q and current_a_lines:
                if current_section == "faq":
                    faqs.append((current_q, "\n".join(current_a_lines).strip()))
                elif current_section == "essay_questions":
                    essay_questions.append((current_q, "\n".join(current_a_lines).strip()))
                else:
                    faqs.append((current_q, "\n".join(current_a_lines).strip()))
                current_q = None
                current_a_lines = []
            current_q = q_match.group(1).strip()
            current_section = "faq"
            continue
            
        a_match = re.match(r'^(?:\*\*(?:Answer|A):\*\*|\*\*(?:Answer|A)\*\*|Answer:|A:)\s*(.*)', line_str, re.IGNORECASE)
        if a_match:
            if current_q:
                current_a_lines.append(a_match.group(1).strip())
            continue
            
        # 2. Look for Key Terms: e.g., * **Term**: Definition or **Term**: Definition
        term_match = re.match(r'^(?:\*\s*)?\*\*(.*?)\*\*:\s*(.*)', line_str)
        if term_match:
            term = term_match.group(1).strip()
            def_text = term_match.group(2).strip()
            key_terms.append((term, def_text))
            continue
            
        # 3. Look for Essay Questions: e.g., 1. **Question** or * **Question**
        essay_match = re.match(r'^(?:\d+\.\s+|\*\s+)?\*\*(.*?)\*\*\??$', line_str)
        if essay_match and current_section == "essay_questions":
            if current_q and current_a_lines:
                essay_questions.append((current_q, "\n".join(current_a_lines).strip()))
                current_q = None
                current_a_lines = []
            current_q = essay_match.group(1).strip()
            if not current_q.endswith('?'):
                current_q += '?'
            continue
            
        # Fallback / continuation of answer
        if current_q:
            current_a_lines.append(line_str)
            
    # Flush remaining
    if current_q and current_a_lines:
        if current_section == "faq":
            faqs.append((current_q, "\n".join(current_a_lines).strip()))
        elif current_section == "essay_questions":
            essay_questions.append((current_q, "\n".join(current_a_lines).strip()))
        else:
            faqs.append((current_q, "\n".join(current_a_lines).strip()))

    return faqs, key_terms, essay_questions


def format_to_consulting_cards(
    faqs: List[Tuple[str, str]],
    key_terms: List[Tuple[str, str]],
    essay_questions: List[Tuple[str, str]],
    title_hint: str = "NotebookLM Overview"
) -> str:
    """Format parsed NotebookLM data into high-fidelity slide Markdown following 'Consulting Box Style'."""
    md_slides = []
    slide_num = 1
    
    # Slide 1: Cover
    md_slides.append(
        f"# 01 Cover: {title_hint}\n\n"
        f"<!-- Style: Consulting Box, Layout: Cover -->\n"
        f"Key insights and structured briefing synthesized from NotebookLM.\n\n"
        f"- Subtitle: Strategic FAQ, Key Concepts and Analytical Breakdown\n"
        f"- Meta: Structured Slide Deck • PPT Master Automation\n"
    )
    slide_num += 1
    
    # Slide 2: Key Terms (Grid Layout)
    if key_terms:
        # We slice key terms into batches of 4 terms per slide
        terms_per_slide = 4
        for i in range(0, len(key_terms), terms_per_slide):
            batch = key_terms[i:i+terms_per_slide]
            slide_idx = (i // terms_per_slide) + 1
            md_slides.append(
                f"# {slide_num:02d} Core Glossary & Key Terms (Part {slide_idx})\n\n"
                f"<!-- Style: Consulting Box, Layout: 2x2 Grid Card -->\n"
                f"Understanding the core vocabulary and strategic foundations:\n\n"
            )
            for idx, (term, definition) in enumerate(batch):
                md_slides.append(
                    f"### Card {idx + 1}: {term}\n"
                    f"- **Concept**: {term}\n"
                    f"- **Definition**: {definition}\n"
                    f"- **Strategic Value**: High impact term for project alignment.\n\n"
                )
            slide_num += 1
                
    # Slide 3: FAQs (Double column / Grid cards)
    if faqs:
        # Group FAQs into pairs of 2 per slide (double column consulting card layout)
        faqs_per_slide = 2
        for i in range(0, len(faqs), faqs_per_slide):
            batch = faqs[i:i+faqs_per_slide]
            slide_idx = (i // faqs_per_slide) + 1
            md_slides.append(
                f"# {slide_num:02d} Frequently Asked Questions (Part {slide_idx})\n\n"
                f"<!-- Style: Consulting Box, Layout: Double Column Card -->\n"
                f"Clarifying critical queries and practical implications:\n\n"
            )
            for idx, (q, a) in enumerate(batch):
                md_slides.append(
                    f"### Card {idx + 1}: {q}\n"
                    f"- **Question**: {q}\n"
                    f"- **Detailed Answer**: {a}\n\n"
                )
            slide_num += 1
                
    # Slide 4: Essay Questions (Focus Q&A layout)
    if essay_questions:
        for idx, (q, a) in enumerate(essay_questions):
            md_slides.append(
                f"# {slide_num:02d} Analytical Breakdown: {q}\n\n"
                f"<!-- Style: Consulting Box, Layout: Split Editorial Card -->\n"
                f"In-depth analysis and strategic response to core structural questions:\n\n"
                f"### Core Query\n"
                f"{q}\n\n"
                f"### Strategic Answer & Analysis\n"
                f"{a}\n\n"
                f"- **Key Takeaway**: Critical strategic insight derived from detailed response.\n"
            )
            slide_num += 1
            
    # Fallback Slide if nothing was parsed
    if not key_terms and not faqs and not essay_questions:
        md_slides.append(
            f"# {slide_num:02d} Document Overview: {title_hint}\n\n"
            f"<!-- Style: Consulting Box, Layout: Text Card -->\n"
            f"Unable to parse specific Study Guide or FAQ formats. Showing raw text summary:\n\n"
            f"- **Notice**: Please check if the source document contains standard NotebookLM Study Guide or FAQ Markdown formats.\n"
        )
        
    return "\n---\n\n".join(md_slides)


def main(argv: Optional[List[str]] = None) -> int:
    """Run the NotebookLM document parser CLI."""
    parser = argparse.ArgumentParser(
        description="NotebookLM to PPT Master Markdown Converter",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("input", help="Path to raw NotebookLM export Markdown file")
    parser.add_argument("-o", "--output", required=True, help="Path to save slide-ready Markdown file")
    parser.add_argument("-t", "--title", default="NotebookLM Structured Briefing", help="Main title of the slide deck")
    
    args = parser.parse_args(argv)
    
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file '{args.input}' does not exist.", file=sys.stderr)
        return 1
        
    try:
        content = input_path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        print(f"Error: Unable to read file '{args.input}': {e}", file=sys.stderr)
        return 1
        
    print(f"Parsing NotebookLM document: {input_path.name}...", file=sys.stderr)
    faqs, key_terms, essay_questions = parse_notebooklm(content)
    
    print(f"Parsed: {len(key_terms)} Key Terms, {len(faqs)} FAQs, {len(essay_questions)} Essay Questions", file=sys.stderr)
    
    processed_md = format_to_consulting_cards(faqs, key_terms, essay_questions, title_hint=args.title)
    
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        output_path.write_text(processed_md, encoding="utf-8")
        print(f"Slide-ready Markdown saved successfully to: {output_path}", file=sys.stderr)
    except Exception as e:
        print(f"Error: Unable to write processed markdown to '{args.output}': {e}", file=sys.stderr)
        return 1
        
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
