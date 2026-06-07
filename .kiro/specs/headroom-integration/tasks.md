# Implementation Plan: Headroom Integration

## Overview

This implementation plan covers the integration of Headroom (browser tab management tool) into SkillsBuilder. The plan includes 6 new skills in the `skills/dev/` directory, comprehensive documentation, and integration with existingINSTALL.ps1 and verify.ps1 scripts. Each task builds on previous steps to ensure incremental progress and early validation.

## Tasks

### Task Group 1: Project Setup and Infrastructure

- [x] 1.1 Create headroom-sync skill directory structure
  - Create `skills/dev/headroom-sync/` directory
  - Create `skills/dev/headroom-sync/.data/` directory for cached data
  - Create `skills/dev/headroom-sync/SKILL.md` with YAML frontmatter
  - _Requirements: 1.1, 6.5_

- [x] 1.2 Create headroom-api skill directory structure
  - Create `skills/dev/headroom-api/` directory
  - Create `skills/dev/headroom-api/api-reference.md` with endpoint documentation
  - Create `skills/dev/headroom-api/SKILL.md` with YAML frontmatter
  - _Requirements: 2.1, 2.7_

- [x] 1.3 Create headroom-auto-close skill directory structure
  - Create `skills/dev/headroom-auto-close/` directory
  - Create `skills/dev/headroom-auto-close/auto-close-rules.md` with default rules
  - Create `skills/dev/headroom-auto-close/SKILL.md` with YAML frontmatter
  - _Requirements: 3.1_

- [x] 1.4 Create headroom-search skill directory structure
  - Create `skills/dev/headroom-search/` directory
  - Create `skills/dev/headroom-search/SKILL.md` with YAML frontmatter
  - _Requirements: 4.1_

- [x] 1.5 Create headroom-local-edit skill directory structure
  - Create `skills/dev/headroom-local-edit/` directory
  - Create `skills/dev/headroom-local-edit/.config.json` with default configuration
  - Create `skills/dev/headroom-local-edit/SKILL.md` with YAML frontmatter
  - _Requirements: 5.1_

- [x] 1.6 Create headroom-config skill directory structure
  - Create `skills/dev/headroom-config/` directory
  - Create `skills/dev/headroom-config/config.json` with default configuration
  - Create `skills/dev/headroom-config/SKILL.md` with YAML frontmatter
  - _Requirements: N/A (setup only)_

### Task Group 2: Core Sync Engine Implementation

- [x] 2.1 Implement sync engine with API client
  - Implement API client with timeout handling (30s)
  - Implement retry logic for 429 responses (30s intervals, max 5 retries)
  - Handle 5xx errors with detailed error messages
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 2.2 Implement tab data fetching and validation
  - Fetch all tabs from `/tabs` endpoint
  - Validate and normalize tab data structure
  - Parse lastAccessed timestamps to ISO 8601 format
  - _Requirements: 1.1_

- [x] 2.3 Implement cloud sync integration
  - Call `/sync/pull` when `cloudSync: true`
  - Merge cloud and local tab data
  - Resolve conflicts using lastAccessed timestamp
  - _Requirements: 1.5_

- [x] 2.4 Implement local cache storage
  - Save tabs to `.data/tabs.json`
  - Save sync status to `.data/sync-status.json`
  - Include all required metadata fields
  - _Requirements: 1.1_

- [x] 2.5 Implement sync summary generation
  - Calculate total, active, and inactive tab counts
  - Format lastSync timestamp as ISO 8601
  - Generate human-readable summary report
  - _Requirements: 1.2_

- [ ]* 2.6 Write property test for sync integrity
  - **Property 1: Sync preserves all tabs**
  - **Validates: Requirements 1.1**

- [ ]* 2.7 Write property test for sync summary accuracy
  - **Property 2: Sync summary accuracy**
  - **Validates: Requirements 1.2**

### Task Group 3: API Integration Implementation

- [x] 3.1 Implement API client for close operations
  - Implement `/tabs/close` endpoint call
  - Support both `tab_ids` and `group` parameters
  - Parse response for closedCount and failedTabIds
  - _Requirements: 2.2_

- [x] 3.2 Implement API client for group operations
  - Implement `/groups` endpoint call
  - Support moving tabs to target group
  - Parse response for movedCount and targetGroup
  - _Requirements: 2.3_

- [x] 3.3 Implement API client for tag operations
  - Implement tag add/remove functionality
  - Support batch tag operations
  - Parse response for updatedCount and operation type
  - _Requirements: 2.4_

- [x] 3.4 Implement parameter validation
  - Validate required parameters for each action type
  - Return descriptive error messages for invalid input
  - Include parameter format examples in errors
  - _Requirements: 2.5_

- [x] 3.5 Implement error response handling
  - Map HTTP status codes to error types
  - Parse error response bodies
  - Generate actionable error messages
  - _Requirements: 2.6_

- [ ]* 3.6 Write property test for idempotent close
  - **Property 7: API close operation is idempotent**
  - **Validates: Requirements 2.2**

- [ ]* 3.7 Write property test for parameter validation
  - **Property 8: API parameter validation rejects invalid input**
  - **Validates: Requirements 2.5**

### Task Group 4: Auto-Close Engine Implementation

- [x] 4.1 Implement rule parsing and validation
  - Parse `auto-close-rules.md` configuration
  - Validate rule structure
  - Fall back to defaults if config missing/invalid
  - _Requirements: 3.6_

- [x] 4.2 Implement tab filtering logic
  - Filter by inactive threshold (default 15 minutes)
  - Filter by usage frequency (default 1 per hour)
  - Apply group priority rules
  - _Requirements: 3.2_

- [x] 4.3 Implement private tab exclusion
  - Check tab titles for "private" or "secret" keywords
  - Exclude matching tabs when `savePrivateTabs: true`
  - Case-insensitive matching
  - _Requirements: 3.4_

- [x] 4.4 Implement exclusive locking mechanism
  - Create `.lock` file when starting auto-close
  - Check for existing lock before proceeding
  - Implement lock timeout (optional)
  - _Requirements: 3.5_

- [x] 4.5 Implement close execution
  - Call `/tabs/close` endpoint for filtered tabs
  - Track success/failure for each tab
  - Generate comprehensive summary report
  - _Requirements: 3.2_

- [ ]* 4.6 Write property test for rule filtering
  - **Property 9: Auto-close rules filter correctly**
  - **Validates: Requirements 3.2, 3.4**

- [ ]* 4.7 Write property test for exclusive lock
  - **Property 10: Exclusive lock prevents concurrent execution**
  - **Validates: Requirements 3.5**

### Task Group 5: Search Engine Implementation

- [ ] 5.1 Implement keyword search
  - Search in tab titles and URLs
  - Case-insensitive matching
  - Support pagination with limit/offset
  - _Requirements: 4.2_

- [ ] 5.2 Implement group filtering
  - Filter by groupId or groupName
  - Sort by lastAccessed (descending)
  - Support pagination
  - _Requirements: 4.3_

- [ ] 5.3 Implement state filtering
  - Filter by active/inactive state
  - Calculate state based on lastAccessed timestamp
  - Generate statistics summary
  - _Requirements: 4.4_

- [ ] 5.4 Implement combined AND search
  - Apply all filters simultaneously
  - Return tabs matching ALL criteria
  - Maintain proper pagination
  - _Requirements: 4.5_

- [ ] 5.5 Implement cache refresh logic
  - Check cache timestamp
  - Auto-trigger sync if cache stale (>30 minutes)
  - Update cache before searching
  - _Requirements: 4.6_

- [ ]* 5.6 Write property test for AND search logic
  - **Property 12: Search AND logic combines filters**
  - **Validates: Requirements 4.5**

- [ ]* 5.7 Write property test for cache refresh
  - **Property 13: Search cache refreshes when stale**
  - **Validates: Requirements 4.6**

### Task Group 6: Local Edit Implementation

- [ ] 6.1 Implement tab update functionality
  - Update tab title or group
  - Validate tab_id exists
  - Generate change summary
  - _Requirements: 5.2_

- [ ] 6.2 Implement tab delete functionality
  - Remove tab by ID
  - Validate tab_id exists
  - Update total count
  - _Requirements: 5.3_

- [ ] 6.3 Implement patch file generation
  - Create `.patch` file with all changes
  - Include timestamp, action type, and changes
  - Maintain patch history limit
  - _Requirements: 5.5_

- [ ] 6.4 Implement config-based auto-sync
  - Check `autoSyncOnClose` configuration
  - Trigger sync after edit if enabled
  - Log sync result
  - _Requirements: 5.6_

- [ ]* 6.5 Write property test for patch generation
  - **Property 14: Local edit generates patch record**
  - **Validates: Requirements 5.5**

### Task Group 7: Configuration Management

- [ ] 7.1 Implement configuration loader
  - Load configuration from `.config.json`
  - Apply environment variable overrides
  - Validate configuration structure
  - _Requirements: N/A (setup only)_

- [ ] 7.2 Implement API key validation
  - Validate API key format (8-64 alphanumeric)
  - Check environment variable `HEADROOM_API_KEY`
  - Generate appropriate warnings
  - _Requirements: 6.6_

### Task Group 8: Documentation - wiki and README

- [ ] 8.1 Create headroom-integration.md in wiki
  - Document core concepts (sync, auto-close, local management)
  - List all 6 new headroom skills with descriptions
  - Include usage examples for each skill
  - _Requirements: 7.1_

- [ ] 8.2 Update README.md skills table
  - Add headroom-sync row
  - Add headroom-api row
  - Add headroom-auto-close row
  - Add headroom-search row
  - Add headroom-local-edit row
  - Add headroom-config row
  - Update total skill count
  - _Requirements: 7.2_

### Task Group 9: Documentation - instructions.html

- [ ] 9.1 Verify instructions.html includes headroom skills
  - Test search for headroom skill names
  - Verify skill cards display correctly
  - Ensure all 4 required fields present (name, type, trigger, description)
  - _Requirements: 7.3_

### Task Group 10: Documentation - docs

- [ ] 10.1 Create headroom-integration-guide.md
  - Include "Headroom Skill Mapping" section with table
  - Include "Auto_Close_Rule Configuration Guide" with example
  - Include "Headroom API Key Setup Tutorial" with steps
  - Include troubleshooting section
  - _Requirements: 7.4_

- [ ] 10.2 Create hooks configuration examples
  - Create `hooks/headroom-auto-sync.json` example
  - Document browser startup trigger
  - Document project switch trigger
  - Include configuration parameters
  - _Requirements: 7.6_

### Task Group 11: Integration with INSTALL.ps1

- [ ] 11.1 Update INSTALL.ps1 to scan headroom skills
  - Add logic to scan `skills/dev/` for headroom-* skills
  - Sync headroom-sync to global skill pool
  - Sync headroom-api to global skill pool
  - Sync headroom-auto-close to global skill pool
  - Sync headroom-search to global skill pool
  - Sync headroom-local-edit to global skill pool
  - Sync headroom-config to global skill pool
  - _Requirements: 6.1_

- [ ] 11.2 Update INSTALL.ps1 output format
  - Add separate "Headroom Integration Skills" section
  - Format: `[已�?步] {skill-name}` or `[?��?] {skill-name}（目?��?存在）`
  - Display summary: "?��?�?N / 6 ??Headroom ?�??"
  - _Requirements: 6.2_

- [ ] 11.3 Update INSTALL.ps1 error handling
  - Mark missing skills as `[?��?]` without error
  - Continue syncing existing skills
  - Exit with code 0
  - _Requirements: 6.3_

### Task Group 12: Integration with verify.ps1

- [ ] 12.1 Update verify.ps1 to validate headroom skills
  - Check `SKILL.md` exists for each headroom skill
  - Verify YAML frontmatter contains `name` field
  - Verify YAML frontmatter contains `description` field
  - _Requirements: 6.4_

- [ ] 12.2 Update verify.ps1 output format
  - Add "Headroom Skill Format Validation" section
  - Format: `[?��?] {skill-name}` or `[失�?: {reason}]`
  - Display summary of passed/failed skills
  - _Requirements: 6.4_

- [ ]* 12.3 Write integration tests for INSTALL.ps1 and verify.ps1
  - Test INSTALL.ps1 with all headroom skills present
  - Test INSTALL.ps1 with some headroom skills missing
  - Test verify.ps1 with valid headroom skills
  - Test verify.ps1 with malformed headroom skills
  - _Requirements: 6.3, 6.4_

### Task Group 13: Final Integration and Testing

- [ ] 13.1 Verify all 6 headroom skills created
  - Verify directory structure
  - Verify SKILL.md with proper frontmatter
  - Verify all required files present
  - _Requirements: 1-5_

- [ ] 13.2 Test end-to-end sync flow
  - Test sync with Headroom API
  - Test cloud sync integration
  - Verify local cache updated correctly
  - _Requirements: 1.1, 1.5_

- [ ] 13.3 Test auto-close workflow
  - Test rule configuration
  - Test tab filtering
  - Test close execution
  - Verify summary output
  - _Requirements: 3.2, 3.4, 3.5_

- [ ] 13.4 Test search and filter functionality
  - Test keyword search
  - Test group filtering
  - Test combined filters
  - Verify pagination
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ] 13.5 Test local edit and patch generation
  - Test tab updates
  - Test tab deletion
  - Verify patch file generated
  - _Requirements: 5.2, 5.3, 5.5_

- [ ] 13.6 Run verification script
  - Execute `verify.ps1`
  - Fix any validation errors
  - Ensure zero warnings and errors
  - _Requirements: N/A (verification only)_

- [ ] 13.7 Final checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all property tests
  - Run all integration tests
  - Ensure all documentation is complete
  - Ask the user if questions arise.
  - _Requirements: N/A (checkpoint only)_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Core implementation tasks (not marked with `*`) should be completed first
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- Documentation tasks are essential for user adoption
- The 6 headroom skills are: headroom-sync, headroom-api, headroom-auto-close, headroom-search, headroom-local-edit, headroom-config
- All skills follow the same directory structure and documentation pattern
- INSTALL.ps1 and verify.ps1 integration ensures proper deployment and validation