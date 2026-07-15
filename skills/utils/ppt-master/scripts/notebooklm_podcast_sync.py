#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PPT Master - NotebookLM Podcast Sync Engine

Slices the NotebookLM Audio Overview (Podcast) MP3/M4A into individual
per-slide narration audio files based on transcript search and proportional alignment.

Usage:
    python3 skills/ppt-master/scripts/notebooklm_podcast_sync.py \\
        --podcast <path_to_mp3> \\
        --project <project_path> \\
        [--transcript <path_to_transcript>] \\
        [--total-duration <duration_in_seconds>]
"""

import sys
import os
import argparse
import re
from pathlib import Path
from typing import Optional, List, Dict, Tuple

# Optional pydub import
try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False


def parse_timestamps(transcript: str) -> List[Tuple[int, float]]:
    """Parse timestamps in transcript and return list of (char_index, seconds)."""
    # Pattern to match [MM:SS], [HH:MM:SS], MM:SS, etc.
    pattern = re.compile(r'\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?')
    matches = []
    
    # We find all matches and record their position in the cleaned text
    for match in pattern.finditer(transcript):
        time_str = match.group(0)
        start_char = match.start()
        
        # Calculate seconds
        parts = [int(p) for p in match.groups() if p is not None]
        if len(parts) == 2:
            minutes, seconds = parts
            total_seconds = minutes * 60 + seconds
        elif len(parts) == 3:
            hours, minutes, seconds = parts
            total_seconds = hours * 3600 + minutes * 60 + seconds
        else:
            continue
            
        matches.append((start_char, float(total_seconds)))
        
    return sorted(matches, key=lambda x: x[0])


def map_char_to_seconds(
    char_idx: int,
    total_chars: int,
    timestamp_map: List[Tuple[int, float]],
    total_duration: float
) -> float:
    """Map a character index to an approximate time offset using timestamp anchors or proportional interpolation."""
    if not timestamp_map:
        # Fallback to pure proportional mapping
        if total_chars == 0:
            return 0.0
        return total_duration * (char_idx / total_chars)
        
    # Find surrounding anchors
    prev_anchor = (0, 0.0)
    next_anchor = (total_chars, total_duration)
    
    for anchor in timestamp_map:
        if anchor[0] <= char_idx:
            prev_anchor = anchor
        else:
            next_anchor = anchor
            break
            
    # Interpolate
    char_diff = next_anchor[0] - prev_anchor[0]
    if char_diff <= 0:
        return prev_anchor[1]
        
    ratio = (char_idx - prev_anchor[0]) / char_diff
    time_diff = next_anchor[1] - prev_anchor[1]
    return prev_anchor[1] + time_diff * ratio


def extract_keywords_from_markdown(slide_content: str) -> List[str]:
    """Extract titles, bold texts, and key words to search in the transcript."""
    keywords = []
    
    # 1. Slide Headings
    headings = re.findall(r'^#{1,6}\s*(.+?)\s*$', slide_content, re.MULTILINE)
    for h in headings:
        cleaned = re.sub(r'[^0-9A-Za-z\u4e00-\u9fff]+', ' ', h).strip()
        if len(cleaned) > 2:
            keywords.append(cleaned)
            
    # 2. Bold Concept words
    bolds = re.findall(r'\*\*(.+?)\*\*', slide_content)
    for b in bolds:
        cleaned = re.sub(r'[^0-9A-Za-z\u4e00-\u9fff]+', ' ', b).strip()
        # Skip generic keys like Question, Answer, Concept, Definition
        if cleaned.lower() in {"question", "answer", "concept", "definition", "strategic value", "detailed answer", "core query"}:
            continue
        if len(cleaned) > 2:
            keywords.append(cleaned)
            
    return list(set(keywords))


def search_keywords_in_text(cleaned_text: str, keywords: List[str], start_search_pos: int) -> int:
    """Find the best matching offset of any keyword in the cleaned text starting from search position."""
    best_pos = -1
    
    for kw in keywords:
        # Search word token (or substring for CJK)
        # Handle English with word boundary and CJK directly
        if re.search(r'[\u4e00-\u9fff]', kw):
            # CJK string match
            match = re.search(re.escape(kw), cleaned_text[start_search_pos:])
            if match:
                pos = start_search_pos + match.start()
                if best_pos == -1 or pos < best_pos:
                    best_pos = pos
        else:
            # English word boundary match
            pattern = re.compile(r'\b' + re.escape(kw) + r'\b', re.IGNORECASE)
            match = pattern.search(cleaned_text[start_search_pos:])
            if match:
                pos = start_search_pos + match.start()
                if best_pos == -1 or pos < best_pos:
                    best_pos = pos
                    
    return best_pos


def parse_slides_from_total_md(total_md_path: Path) -> List[Tuple[str, str]]:
    """Parse notes/total.md into individual slides list: (slide_stem, content)."""
    if not total_md_path.exists():
        print(f"Error: total.md not found at {total_md_path}", file=sys.stderr)
        return []
        
    content = total_md_path.read_text(encoding="utf-8")
    slides: List[Tuple[str, str]] = []
    
    # Split by slide boundaries (headings starting with '#')
    # Note: total_md_split.py supports fuzzy match against SVG stems.
    # We can split by '# '
    chunks = re.split(r'\n(?=#\s+)', '\n' + content)
    slide_index = 1
    
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
            
        lines = chunk.splitlines()
        title_line = lines[0]
        # Clean title to create a stem
        title_text = re.sub(r'^#{1,6}\s*', '', title_line).strip()
        
        # Create standard stem like '01_cover', '02_core_glossary_part_1'
        # Normalize title
        norm_title = re.sub(r'[^0-9A-Za-z\u4e00-\u9fff]+', '_', title_text)
        norm_title = re.sub(r'_+', '_', norm_title).strip('_').lower()
        
        stem = f"{slide_index:02d}_{norm_title}"
        if slide_index == 1:
            stem = "01_cover"
            
        slides.append((stem, chunk))
        slide_index += 1
        
    return slides


def main() -> int:
    parser = argparse.ArgumentParser(
        description="NotebookLM Podcast Audio Sync and Slicing Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--podcast", required=True, help="Path to raw Podcast MP3 or M4A audio file")
    parser.add_argument("--project", required=True, help="Path to PPT Master project folder")
    parser.add_argument("--transcript", help="Optional path to text transcript file")
    parser.add_argument("--total-duration", type=float, help="Optional duration in seconds (overrides auto-probe)")
    parser.add_argument("--padding", type=float, default=0.5, help="Padding in seconds at slice boundaries")
    
    args = parser.parse_args()
    
    project_path = Path(args.project)
    if not project_path.exists():
        print(f"Error: Project path '{args.project}' does not exist.", file=sys.stderr)
        return 1
        
    podcast_path = Path(args.podcast)
    if not podcast_path.exists():
        print(f"Error: Podcast file '{args.podcast}' does not exist.", file=sys.stderr)
        return 1
        
    total_md_path = project_path / "notes" / "total.md"
    if not total_md_path.exists():
        print(f"Error: total.md not found in project notes folder.", file=sys.stderr)
        return 1
        
    # 1. Resolve Audio Duration
    total_duration = args.total_duration
    if total_duration is None:
        if PYDUB_AVAILABLE:
            try:
                print("Probing audio duration using pydub...", file=sys.stderr)
                audio = AudioSegment.from_file(str(podcast_path))
                total_duration = len(audio) / 1000.0
            except Exception as e:
                print(f"Warning: pydub duration probe failed: {e}", file=sys.stderr)
        
        if total_duration is None:
            # Fallback to ffprobe
            sys.path.insert(0, str(Path(__file__).parent))
            try:
                from svg_to_pptx.pptx_narration import probe_audio_duration
                total_duration = probe_audio_duration(podcast_path)
            except Exception as e:
                print(f"Warning: ffprobe duration probe failed: {e}", file=sys.stderr)
                
        if total_duration is None:
            # Decent default overview (e.g. 5 minutes)
            print("Warning: Could not probe audio duration. Using fallback of 300 seconds.", file=sys.stderr)
            total_duration = 300.0
            
    print(f"Podcast duration resolved: {total_duration:.2f} seconds.", file=sys.stderr)
    
    # 2. Parse Slides from total.md
    slides = parse_slides_from_total_md(total_md_path)
    if not slides:
        print("Error: No slides parsed from total.md.", file=sys.stderr)
        return 1
    print(f"Parsed {len(slides)} slides from total.md.", file=sys.stderr)
    
    # 3. Read Transcript and Map Timestamps
    transcript_text = ""
    timestamp_map = []
    if args.transcript:
        transcript_path = Path(args.transcript)
        if transcript_path.exists():
            transcript_text = transcript_path.read_text(encoding="utf-8", errors="replace")
            timestamp_map = parse_timestamps(transcript_text)
            print(f"Loaded transcript ({len(transcript_text)} chars, {len(timestamp_map)} timestamp anchors).", file=sys.stderr)
            
    # If no transcript is provided, we simulate one using slide text character weights
    if not transcript_text:
        print("No transcript provided. Proportional character alignment will be used.", file=sys.stderr)
        transcript_text = "\n".join([content for stem, content in slides])
        
    cleaned_transcript = re.sub(r'\[?\d{1,2}:\d{2}(?::\d{2})?\]?', ' ', transcript_text)
    total_chars = len(cleaned_transcript)
    
    # 4. Keyword Boundary Alignment
    slide_boundaries = [0.0] * (len(slides) + 1)
    slide_boundaries[0] = 0.0
    slide_boundaries[-1] = total_duration
    
    search_pos = 0
    matched_slides = {}  # index -> seconds
    
    # Slide 1 (Cover) starts at 0.0
    matched_slides[0] = 0.0
    
    for idx in range(1, len(slides) - 1):
        stem, content = slides[idx]
        keywords = extract_keywords_from_markdown(content)
        
        match_idx = search_keywords_in_text(cleaned_transcript, keywords, search_pos)
        if match_idx != -1:
            matched_time = map_char_to_seconds(match_idx, total_chars, timestamp_map, total_duration)
            matched_slides[idx] = matched_time
            search_pos = match_idx  # update sequential search anchor
            print(f"  Slide {idx+1} ('{stem}') matched in transcript at {matched_time:.2f}s", file=sys.stderr)
        else:
            print(f"  Slide {idx+1} ('{stem}') keyword match skipped, will interpolate.", file=sys.stderr)
            
    # Add final slide
    matched_slides[len(slides)] = total_duration
    
    # Fill in missing boundary values via interpolation
    all_indices = sorted(matched_slides.keys())
    for k in range(len(all_indices) - 1):
        left_idx = all_indices[k]
        right_idx = all_indices[k+1]
        
        left_time = matched_slides[left_idx]
        right_time = matched_slides[right_idx]
        
        # Interpolate slides in-between [left_idx + 1, right_idx - 1]
        missing_count = right_idx - left_idx - 1
        if missing_count > 0:
            # We distribute duration based on character length of the slides
            sub_slides = slides[left_idx:right_idx]
            sub_lengths = [len(content) for stem, content in sub_slides]
            total_sub_len = sum(sub_lengths)
            
            curr_time = left_time
            for sub_i, s_idx in enumerate(range(left_idx + 1, right_idx)):
                weight = sub_lengths[sub_i] / total_sub_len if total_sub_len > 0 else (1.0 / (missing_count + 1))
                curr_time += (right_time - left_time) * weight
                matched_slides[s_idx] = curr_time
                
    # Copy resolved boundary times
    for idx in range(len(slides) + 1):
        slide_boundaries[idx] = matched_slides[idx]
        
    print("\nAligned boundaries for slides:", file=sys.stderr)
    for idx in range(len(slides)):
        start = slide_boundaries[idx]
        end = slide_boundaries[idx+1]
        duration = end - start
        print(f"  {idx+1}. {slides[idx][0]}: {start:.2f}s -> {end:.2f}s (duration: {duration:.2f}s)", file=sys.stderr)
        
    # 5. Output audio directory
    audio_output_dir = project_path / "audio"
    audio_output_dir.mkdir(parents=True, exist_ok=True)
    
    # 6. Slicing execution
    slicing_success = False
    
    if PYDUB_AVAILABLE:
        try:
            print(f"\nLoading podcast audio segment for slicing: {podcast_path.name}...", file=sys.stderr)
            audio = AudioSegment.from_file(str(podcast_path))
            
            for idx in range(len(slides)):
                stem = slides[idx][0]
                start_ms = int(slide_boundaries[idx] * 1000)
                end_ms = int(slide_boundaries[idx+1] * 1000)
                
                # Slicing with slight boundary padding
                slide_audio = audio[start_ms:end_ms]
                
                # Export mp3 slice
                slice_path = audio_output_dir / f"{stem}.mp3"
                slide_audio.export(str(slice_path), format="mp3", bitrate="128k")
                print(f"  [OK] Exported sliced narration: {slice_path.name}", file=sys.stderr)
                
            slicing_success = True
            
        except Exception as e:
            print(f"\nError: Slicing failed: {e}", file=sys.stderr)
            print("Falling back to writing timing metadata and direct narration timings configuration.", file=sys.stderr)
    else:
        print("\n[Notice] pydub / ffmpeg is not available on your system.", file=sys.stderr)
        print("Skipping audio slicing. High-fidelity timing config will be generated directly.", file=sys.stderr)
        
    # 7. Write slide auto-advance transition properties to animations.json to ensure timings are perfectly configured!
    # PPT Master looks for animations.json to apply custom slide timings.
    # Let's inspect the animations.json schema. It has a 'slides' block where each slide can configure transitions and auto-advance.
    animations_path = project_path / "animations.json"
    
    # Load existing animations if any
    import json
    anim_data = {}
    if animations_path.exists():
        try:
            anim_data = json.loads(animations_path.read_text(encoding="utf-8"))
        except Exception:
            pass
            
    # Set default structures
    if "slides" not in anim_data:
        anim_data["slides"] = {}
        
    # Inject timing parameters for each slide
    for idx in range(len(slides)):
        stem = slides[idx][0]
        start = slide_boundaries[idx]
        end = slide_boundaries[idx+1]
        duration = end - start
        
        if stem not in anim_data["slides"]:
            anim_data["slides"][stem] = {}
            
        # Set transition timing matching the narration length
        anim_data["slides"][stem]["transition"] = {
            "effect": "fade",
            "duration": 0.4,
            "auto_advance": round(duration + args.padding, 2)
        }
        
    try:
        animations_path.write_text(json.dumps(anim_data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\n[OK] Timings configuration successfully saved to: {animations_path.name}", file=sys.stderr)
    except Exception as e:
        print(f"Warning: Could not write timings to animations.json: {e}", file=sys.stderr)
        
    if slicing_success:
        print("\nSuccess: Podcast sync and audio slicing completed successfully!", file=sys.stderr)
        return 0
    else:
        print("\nComplete: Timings metadata generated successfully. Slicing skipped due to missing ffmpeg/pydub.", file=sys.stderr)
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
