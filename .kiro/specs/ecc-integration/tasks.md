# Implementation Plan: ECC Integration

## Overview

This implementation plan breaks down the ECC Integration feature into discrete coding tasks. The feature adds 15 new skills to `skills/dev/` directory, including language-specific Reviewers (6), Resolvers (4), AgentShield, Hooks Enhancer, Harness Optimizer, ECC Migrator, and Loop Operator. This plan covers component implementation, PowerShell script updates, documentation, and testing.

---

## Tasks

- [x] 1. Set up project structure for ECC skills
  - [x] Create directory structure under `skills/dev/` for all 15 new skills
  - [x] Create template `SKILL.md` files with required YAML frontmatter fields
  - [x] Create `hook-examples/` subdirectory under `agent-shield/`
  - [x] Create `hooks/` subdirectory under `hooks-enhancer/`
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1_

- [x] 2. Implement Language Reviewer Agents (6 skills)
  - [x] 2.1 Create `typescript-reviewer/SKILL.md` with full content
    - Implement TypeScript-specific code review logic
    - Integrate `tsc` and `eslint` availability detection
    - Output structured review report with 4 sections
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 2.2 Create `python-reviewer/SKILL.md` with full content
    - Implement Python-specific code review logic
    - Integrate `pylint` and `mypy` availability detection
    - Output structured review report with 4 sections
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 2.3 Create `go-reviewer/SKILL.md` with full content
    - Implement Go-specific code review logic
    - Integrate `gofmt` and `go vet` availability detection
    - Output structured review report with 4 sections
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 2.4 Create `rust-reviewer/SKILL.md` with full content
    - Implement Rust-specific code review logic
    - Integrate `rustc` and `clippy` availability detection
    - Output structured review report with 4 sections
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 2.5 Create `django-reviewer/SKILL.md` with full content
    - Implement Django-specific code review logic
    - Integrate `flake8` and `django-lint` availability detection
    - Output structured review report with 4 sections
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 2.6 Create `kotlin-reviewer/SKILL.md` with full content
    - Implement Kotlin-specific code review logic
    - Integrate `kotlinc` and `detekt` availability detection
    - Output structured review report with 4 sections
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 2.7 Write unit tests for Language Reviewers
    - Test availability detection for all 6 languages
    - Test semantic review mode fallback
    - Test output format validation
    - _Requirements: 1.2, 1.3, 1.5, 1.6_

- [x] 3. Implement Language Resolver Agents (4 skills)
  - [x] 3.1 Create `typescript-build-resolver/SKILL.md` with full content
    - Implement TypeScript build error parsing
    - Output 3-section response: Diagnosis, Fix, Prevention
    - Handle package version conflict detection
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.2 Create `python-build-resolver/SKILL.md` with full content
    - Implement Python build error parsing
    - Output 3-section response: Diagnosis, Fix, Prevention
    - Handle package version conflict detection
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.3 Create `go-build-resolver/SKILL.md` with full content
    - Implement Go build error parsing
    - Output 3-section response: Diagnosis, Fix, Prevention
    - Handle package version conflict detection
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.4 Create `rust-build-resolver/SKILL.md` with full content
    - Implement Rust build error parsing
    - Output 3-section response: Diagnosis, Fix, Prevention
    - Handle package version conflict detection
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 3.5 Write unit tests for Language Resolvers
    - Test error message parsing for all 4 languages
    - Test package version conflict detection
    - Test malformed error handling
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement AgentShield Security Scanner
  - [x] 4.1 Create `agent-shield/SKILL.md` with full content
    - Implement 4 scanning modules (secrets, dynamic execution, dependencies, injection)
    - Implement severity classification (Critical/Warning)
    - Implement timeout handling (120s)
    - Output structured security report
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [x] 4.2 Create hook configuration examples in `hook-examples/`
    - Create `kiro-hook.json` for Kiro preToolUse
    - Create `claude-code-hook.json` for Claude Code
    - Include usage instructions
    - _Requirements: 3.6_
  
  - [ ]* 4.3 Write unit tests for AgentShield
    - Test hardcoded secret detection patterns
    - Test eval/exec detection
    - Test dependency vulnerability scanning
    - Test injection pattern detection
    - Test timeout behavior
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.7, 3.8_

- [x] 5. Implement Hooks Enhancer
  - [x] 5.1 Create `hooks-enhancer/SKILL.md` with full content
    - Implement 4 hook templates (formatter, type-check, console-log, import-validator)
    - Implement IDE-specific output formats (Kiro, Claude Code, Cursor)
    - Implement tool availability error handling
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ] 5.2 Create hook configuration templates in `hooks/`
    - Create template files for 4 hook types
    - Include examples for each IDE format
    - _Requirements: 4.2_
  
  - [ ]* 5.3 Write unit tests for Hooks Enhancer
    - Test IDE schema compliance (Kiro, Claude Code, Cursor)
    - Test tool-unavailable handling
    - Test output format validation
    - _Requirements: 4.2, 4.3, 4.5_

- [x] 6. Implement Harness Optimizer
  - [x] 6.1 Create `harness-optimizer/SKILL.md` with full content
    - Implement 3-block report output (token usage, remaining, strategy)
    - Implement 80% threshold detection and graphify suggestion
    - Implement dependency depth analysis for batch scheduling
    - Implement cost tracking mode (opt-in)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 6.2 Write unit tests for Harness Optimizer
    - Test token estimation calculations
    - Test 80% threshold detection
    - Test dependency depth analysis
    - Test cost tracking mode output
    - _Requirements: 5.2, 5.3, 5.5, 5.6_

- [x] 7. Implement ECC Skills Bridge (ecc-migrator)
  - [x] 7.1 Create `ecc-migrator/SKILL.md` with full content
    - Implement YAML/Markdown format detection
    - Implement SKILL.md generation with frontmatter
    - Implement `[REVIEW NEEDED]` annotation system
    - Add Cross-IDE Triggering Guide section
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [x] 7.2 Create `ecc-compatibility-matrix.md`
    - Create Table 1: Verified migratable ECC skills
    - Create Table 2: Known incompatible skills
    - Include example entries
    - _Requirements: 6.6_
  
  - [ ]* 7.3 Write property test for ecc-migrator round-trip conversion
    - **Property 1: ECC Skills Format Round-Trip Conversion**
    - **Validates: Requirements 6.2, 6.3**
    - Generate random ECC skill content and verify internal representation equivalence
    - _Requirements: 6.2, 6.3_
  
  - [ ]* 7.4 Write unit tests for ecc-migrator
    - Test YAML format parsing
    - Test Markdown format parsing
    - Test annotation insertion
    - Test Cross-IDE Triggering Guide generation
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 8. Implement Loop Operator
  - [x] 8.1 Create `loop-operator/SKILL.md` with full content
    - Implement consecutive call detection algorithm (>3 calls, <5% similarity)
    - Implement 3 intervention options output
    - Implement autonomous mode activation for specific skills
    - Implement silence timeout (10 minutes)
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 8.2 Write property test for loop detection algorithm
    - **Property 2: Loop Detection Algorithm Correctness**
    - **Validates: Requirement 7.2**
    - Test consecutive calls detection and warning output
    - _Requirements: 7.2_
  
  - [ ]* 8.3 Write property test for silence timeout
    - **Property 3: Loop Operator Silence Timeout**
    - **Validates: Requirement 7.5**
    - Test 10-minute threshold detection
    - _Requirements: 7.5_
  
  - [ ]* 8.4 Write unit tests for Loop Operator
    - Test similarity calculation (5% boundary, 1% example)
    - Test intervention options output
    - Test autonomous mode activation
    - Test silence timeout warning
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Update INSTALL.ps1 and verify.ps1
  - [x] 9.1 Update INSTALL.ps1 for 15 new ECC skills
    - Add "ECC 整合技能" section to output summary
    - Implement synchronization logic for all 15 skills
    - Output `[已同步]` or `[略過]` status per skill
    - Add "共同 N / 15 個 ECC 技能" final summary
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 9.2 Update verify.ps1 for ECC skills validation
    - Add "ECC 技能格式驗證" section
    - Validate SKILL.md exists with name and description fields
    - Output `[通過]` or `[失敗: 原因]` per skill
    - _Requirements: 8.4_
  
  - [ ]* 9.3 Write PowerShell integration tests
    - Test INSTALL.ps1 synchronization for 15 skills
    - Test missing directory handling (output `[略過]`)
    - Test verify.ps1 SKILL.md validation
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Update Documentation
  - [x] 10.1 Create `wiki/entities/ecc-integration.md`
    - Write ECC framework overview (Skills, Subagents, Hooks, AgentShield)
    - List all 15 new skills with one-line descriptions
    - _Requirements: 9.1_
  
  - [x] 10.2 Update `README.md` skill count
    - Update skill count from 42 to 57
    - Add 15 new skills to skill table
    - Format consistent with existing entries
    - _Requirements: 9.2_
  
  - [x] 10.3 Update `instructions.html` search index
    - Add 15 new skills to search results
    - Include 4 fields: skill name (code format), category (dev), trigger method, use case
    - _Requirements: 9.3>
  
  - [x] 10.4 Create `docs/ecc-integration-guide.md`
    - Write "ECC 能力對應表" section with full mapping table
    - Write "AgentShield 啟用指南" section with hook configuration code block
    - Write "hooks-enhancer 配置教學" section with formatter installation and hook configs
    - _Requirements: 9.4>
  
  - [ ]* 10.5 Write documentation validation tests
    - Test README.md skill count update (42 → 57)
    - Test instructions.html search result display
    - Test ecc-integration.md file creation and content
    - Test ecc-integration-guide.md sections
    - _Requirements: 9.1, 9.2, 9.3, 9.4>

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Integration and final validation
  - [ ] 12.1 Verify git hook integration
    - Test AgentShield triggers on git push
    - Test hooks-enhancer triggers on file save
    - _Requirements: 3.8, 4.4>
  
  - [ ] 12.2 Verify tool availability detection
    - Test static analysis tool detection for all 6 languages
    - Test fallback to semantic review mode
    - _Requirements: 1.5, 1.6>
  
  - [ ] 12.3 Verify full INSTALL.ps1 flow
    - Test synchronization to global skills directory
    - Test symlink creation (fallback to copy on admin failure)
    - _Requirements: 8.1, 8.3>
  
  - [ ] 12.4 Final comprehensive test run
    - Run full test suite for all 15 skills
    - Verify all acceptance criteria met
    - _Requirements: All>

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties for ecc-migrator and loop-operator
- Unit tests validate specific examples and edge cases for all components
- PowerShell scripts (INSTALL.ps1, verify.ps1) are updated to handle ECC integration
- Documentation updates cover wiki, README, instructions.html, and new guide document

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "9.1", "10.1", "10.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "3.1", "3.2", "3.3", "4.1", "5.1", "6.1", "7.1", "8.1", "10.3", "10.4"] },
    { "id": 2, "tasks": ["2.4", "2.5", "2.6", "3.4", "4.2", "5.2", "7.2", "9.2"] },
    { "id": 3, "tasks": ["2.7", "3.5", "4.3", "5.3", "6.2", "7.3", "7.4", "8.2", "8.3", "8.4", "9.3", "10.5"] },
    { "id": 4, "tasks": ["11", "12.1", "12.2", "12.3", "12.4"] },
    { "id": 5, "tasks": ["13"] }
  ]
}
```
