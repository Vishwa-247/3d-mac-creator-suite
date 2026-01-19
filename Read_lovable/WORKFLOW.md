# Lovable + Antigravity Workflow

> This document explains how Lovable and Antigravity work together to build StudyMate.

## The Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   1. LOVABLE (Chat Mode)                                        │
│      - Read: CURRENT_STATE.md                                   │
│      - Read: patterns/ (if needed)                              │
│      - Output: Implementation suggestion using SUGGESTION_TEMPLATE│
│                                                                 │
│                          ↓                                      │
│                                                                 │
│   2. USER                                                       │
│      - Review Lovable's suggestion                              │
│      - Copy suggestion to Antigravity                           │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│   3. ANTIGRAVITY                                                │
│      - Implement based on suggestion                            │
│      - Run tests/verification                                   │
│      - Update CURRENT_STATE.md                                  │
│      - Update IMPLEMENTATION_LOG.md                             │
│      - Commit to Git                                            │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│   4. LOVABLE (Auto-sync via Git)                                │
│      - Sees new commits                                         │
│      - Reads updated CURRENT_STATE.md                           │
│      - Suggests next step                                       │
│                                                                 │
│                          ↺ (repeat)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Responsibilities

| File | Who Updates | When |
|------|-------------|------|
| `PROJECT_CONTEXT.md` | Manual (rare) | Only if project vision changes |
| `CURRENT_STATE.md` | Antigravity | After each implementation phase |
| `IMPLEMENTATION_LOG.md` | Antigravity | After each implementation |
| `SUGGESTION_TEMPLATE.md` | Manual (rare) | If template needs improvement |
| `patterns/*.md` | Manual (rare) | If new patterns needed |

## Rules for Lovable

1. **Always check `CURRENT_STATE.md`** before suggesting anything
2. **Always check Git commits** since last session
3. **Use `SUGGESTION_TEMPLATE.md`** format for all suggestions
4. **Reference `patterns/`** when suggesting implementations
5. **One feature per suggestion** - don't bundle multiple features

## Rules for Antigravity

1. **Follow Lovable's suggestion structure** exactly
2. **Update `CURRENT_STATE.md`** after implementation (before commit)
3. **Log in `IMPLEMENTATION_LOG.md`** what worked/failed
4. **Run verification steps** before marking complete
5. **Commit with clear messages** that Lovable can parse

## Example Workflow

### Step 1: User asks Lovable
```
"What should I build next for StudyMate?"
```

### Step 2: Lovable reads context, suggests
```markdown
## Feature: Interview Clarification Detection

### Priority: HIGH
### Module: Interview

### Problem Being Solved
Users jump to solutions without clarification. Need to detect and penalize.

### Files to Modify
...
```

### Step 3: User pastes to Antigravity
```
"Implement this: [paste Lovable's suggestion]"
```

### Step 4: Antigravity implements
- Writes code
- Runs tests
- Updates `CURRENT_STATE.md`:
  ```markdown
  ### 🟡 Module 4: Production Interviews
  - **Current**: Q&A with clarification detection ✅ NEW
  - **Missing**: Follow-ups, curveballs
  ```
- Updates `IMPLEMENTATION_LOG.md`
- Commits: `feat(interview): add clarification detection`

### Step 5: Lovable sees Git sync, reads updates, suggests next

## Folder Structure

```
D:\Agenntic-Studymate\
├── Read_lovable/
│   ├── PROJECT_CONTEXT.md      # What StudyMate IS
│   ├── CURRENT_STATE.md        # What's built NOW
│   ├── IMPLEMENTATION_LOG.md   # Changelog
│   ├── SUGGESTION_TEMPLATE.md  # Format for suggestions
│   ├── WORKFLOW.md             # This file
│   └── patterns/
│       ├── zep_memory_pattern.md
│       ├── parlant_journey_pattern.md
│       ├── agentic_rag_pattern.md
│       ├── database_memory_pattern.md
│       ├── book_writer_flow_pattern.md
│       ├── corrective_rag_pattern.md
│       └── eval_observability_pattern.md
└── ... (rest of project)
```

## Troubleshooting

### Lovable doesn't see new changes
- Trigger manual sync in Lovable settings
- Or ask: "Check the latest Git commits"

### Antigravity doesn't follow suggestion
- Ensure suggestion uses `SUGGESTION_TEMPLATE.md` format
- Be specific about file paths

### Context drift (tools see different realities)
- Always update `CURRENT_STATE.md` before committing
- Keep log entries in `IMPLEMENTATION_LOG.md` detailed
