---
name: idea-to-prd
description: >
  Transforms product ideas and problem statements into comprehensive,
  structured Product Requirement Documents (PRDs) using a 7-phase pipeline
  including DDD analysis, architecture decisions, and testing strategy.
  Use when user says "create a PRD", "transform my idea", "product requirements",
  "I have an idea for", "help me plan a product", "write requirements for",
  or asks to turn a concept into technical specifications.
  Do NOT use for simple brainstorming or code generation tasks.
license: MIT
metadata:
  author: JLMA
  version: 2.0.0
---

# Idea-to-PRD Skill

Transform raw ideas into comprehensive Product Requirement Documents through
a structured 7-phase pipeline with user checkpoints at each stage.

## Instructions

### Step 1: Problem Analysis & Requirements
Collect the user's idea or problem statement. Ask:
- What pain point are you addressing?
- Who is affected?
- What would success look like?

Generate a requirements document using `references/prd-template.md` as base.
Validate input with: `bash scripts/validate-input.sh`

**Checkpoint**: Present the requirements summary and ask user to approve before continuing.

### Step 2: DDD Strategic Design
Identify bounded contexts from the requirements:
- Main business capabilities
- User roles
- Key business entities

Use `references/ddd-template.md` for structure.

**Checkpoint**: Present bounded contexts for user approval.

### Step 3: Architecture & ADRs
Define technical architecture based on domain model.
Create Architecture Decision Records using `references/adr-template.md`.

**Checkpoint**: Present architecture overview for approval.

### Step 4: DDD Tactical Design
For each bounded context from Step 2, define:
- Aggregates and entities
- Value Objects
- Domain Events
- Domain Services

### Step 5: Pseudocode & Implementation Logic
Define core algorithms and integration patterns.

### Step 6: Testing Strategy
Define testing levels (unit, integration, e2e), quality gates, and security testing.

### Step 7: Final PRD Generation
Compile all phases into a comprehensive PRD document.
Generate AI context files for future development.
Run security scan: `bash scripts/security-scan.sh`

## Examples

### Example 1: New Product Analysis
User says: "I have an idea for an AI-powered task management app"
Actions:
1. Execute Phase 1 — extract problem statement, generate requirements.
2. Phase 2 — identify bounded contexts (Task, User, AI Engine, Notification).
3. Phase 3 — recommend architecture (microservices, event-driven).
4. Phases 4-7 — complete pipeline with user approvals at each gate.

### Example 2: E-commerce Requirements
User says: "Create a PRD for a marketplace for handmade goods"
Actions: Execute full 7-phase pipeline focused on e-commerce domain, using `references/prd-template.md`.

## Troubleshooting

Error: User provides a vague one-line idea
Solution: Ask probing questions about target users, scale, and domain before proceeding.

Error: User wants to skip phases
Solution: Allow skipping but warn about reduced PRD quality. Minimum required: Phase 1 + Phase 7.

Error: Input contains sensitive data (API keys, passwords)
Solution: Run `bash scripts/security-scan.sh` and mask sensitive content before proceeding.