# Linear Setup Implementation Plan - v1.0

## Phase 1: Core Workspace Setup (30 mins)

**Objective**: Establish foundation

### 1. Create Linear Workspace

- [ ] Sign up/create new workspace
- [ ] Name it appropriately
- [ ] Set basic workspace settings

### 2. Create User Accounts

- [ ] Generate and save API token for your account

### 3. Create Team

- [ ] Create single team "Engineering" (or preferred name)
- [ ] Set team identifier (e.g., "ENG")

## Phase 2: Custom Fields (15 mins)

**Objective**: Enable Product and Functional Area tracking

### 4. Create Product Field

- [ ] Add custom field type: Single-select
- [ ] Name: "Product"
- [ ] Add options: ChatableFW, EatGPT, AIDevOps
- [ ] Make workspace-wide

### 5. Create Functional Area Field

- [ ] Add custom field type: Single-select
- [ ] Name: "Functional Area"
- [ ] Add options: ChatUI, File Management, Nutrition History, Authentication, etc.
- [ ] Make workspace-wide

## Phase 3: Workflow States (45 mins)

**Objective**: Implement 13-state workflow
_This is the most click-intensive part_

### 6. Delete Default States

- [ ] Remove all default states except any you're keeping

### 7. Create Backlog States

- [ ] **Triage** (type: backlog)
- [ ] **Grooming** (type: backlog)
- [ ] **Needs Clarification** (type: backlog)
- [ ] **Deferred** (type: backlog)

### 8. Create Active States

- [ ] **Ready for Tasking** (type: unstarted)
- [ ] **Tasking** (type: started) - Add description: "Agent"
- [ ] **Tasking Blocked** (type: started)
- [ ] **Ready for Delivery** (type: started)
- [ ] **Delivering** (type: started) - Add description: "Agent"
- [ ] **Delivery Blocked** (type: started)
- [ ] **Smoke Testing** (type: started) - Add description: "Agent"
- [ ] **Smoke Test Failed** (type: started)
- [ ] **Final Review** (type: started)

### 9. Create Completed States

- [ ] **Done** (type: completed)
- [ ] **Duplicate** (type: canceled)
- [ ] **Out of Scope** (type: canceled)

### 10. Configure State Transitions

- [ ] Set allowed transitions per workflow rules (if Linear allows)
- [ ] Note: Linear might default to any-to-any, which is acceptable

## Phase 4: Templates (20 mins)

**Objective**: Standardize Epic and Story creation

### 11. Create Epic Template

- [ ] Name: "Epic Template"
- [ ] Add sections:

  ```markdown
  ## Vision

  [What future state does this enable?]

  ## Problem/Opportunity

  [What problem does this solve or opportunity does it capture?]

  ## Success Criteria

  [How will we know this epic is complete?]

  ## Context

  - Related docs: [links]
  - Dependencies: [other epics/systems]
  - Product: [dropdown]
  - Functional Area: [dropdown]
  ```

- [ ] Set as default for parent issues (if possible)

### 12. Create Story Template

- [ ] Name: "Story Template"
- [ ] Add sections:

  ```markdown
  ## Acceptance Criteria

  - [ ] Specific, testable criterion 1
  - [ ] Specific, testable criterion 2
  - [ ] Specific, testable criterion 3

  ## Technical Context

  [Implementation notes, API details, etc.]

  ## Test Cases

  - Case 1: [input] → [expected output]
  - Case 2: [input] → [expected output]

  ## References

  - Parent Epic: [auto-linked]
  - Design: [if applicable]
  ```

- [ ] Set as default for child issues (if possible)

## Phase 5: Validation (15 mins)

**Objective**: Verify setup works correctly

### 13. Test Workflow

- [ ] Create test Epic using template
- [ ] Create test Story as child
- [ ] Verify custom fields appear and work
- [ ] Test state transitions through workflow
- [ ] Add test comment
- [ ] Create blocking relationship between two stories
- [ ] Test moving Epic to "Out of Scope" (note: children don't auto-move)

### 14. Test API Access

- [ ] Verify both API tokens work
- [ ] Query test issue via API
- [ ] Create comment via API as AI-Agent
- [ ] Transition state via API
- [ ] Verify custom fields accessible via API

## Phase 6: Documentation (10 mins)

**Objective**: Capture setup for future reference

### 15. Document Configuration

- [ ] Screenshot workflow states configuration
- [ ] Save API tokens securely (password manager)
- [ ] Note any deviations from plan
- [ ] Record these IDs for API usage:
  - [ ] Workspace ID
  - [ ] Team ID
  - [ ] Custom field IDs (Product, Functional Area)
  - [ ] Workflow state IDs (especially agent states)

## Time Estimates

- Phase 1: 30 minutes
- Phase 2: 15 minutes
- Phase 3: 45 minutes
- Phase 4: 20 minutes
- Phase 5: 15 minutes
- Phase 6: 10 minutes
- **Total: ~2.5 hours**

## Success Criteria

- [ ] Can create Epics with children
- [ ] Can move Stories through all states
- [ ] AI-Agent can comment via API
- [ ] Custom fields visible and usable
- [ ] Templates available for new issues
- [ ] Blocking relationships work correctly
- [ ] API access confirmed for both accounts

## Next Steps After Setup

1. Create initial backlog of real Epics/Stories
2. Implement basic agent integration targeting Tasking state
3. Test simple workflow: Grooming → Ready for Tasking → Tasking → Tasking Blocked
4. Iterate based on actual usage patterns
5. Build prompt management system in monorepo

## Notes

- Keep Linear API documentation open: https://developers.linear.app/docs
- Take screenshots during setup for future reference
- Consider using Postman/Insomnia to test API calls during validation
- If any step seems unavailable, note it and continue (Linear's UI changes frequently)

## Risk Mitigations

- **If custom fields aren't available**: Use labels with prefixes as fallback
- **If workflow customization is limited**: Document desired vs. actual state
- **If API token generation fails**: Contact Linear support early
- **If templates don't stick**: Create example issues to copy from
