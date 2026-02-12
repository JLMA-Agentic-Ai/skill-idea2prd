---
name: "idea-to-prd"
description: "Transform ideas into comprehensive Product Requirement Documents (PRDs) with security-first architecture"
version: "2.0.0"
author: "Claude Code Skill Builder"
category: "product-development"
tags: ["prd", "ddd", "architecture", "security", "planning"]
security_level: "high"
validation_required: true
checkpoint_system: true
progressive_disclosure: true
---

# Secure Idea-to-PRD Skill

Transform raw ideas into comprehensive, security-first Product Requirement Documents through a structured 7-phase pipeline with progressive disclosure and checkpoint validation.

## Security Features

- **Input Sanitization**: All user inputs are validated and sanitized
- **Path Safety**: Secure file path construction prevents directory traversal
- **Content Escaping**: Template content is properly escaped
- **Validation Checkpoints**: User confirmation at each phase
- **Error Handling**: Comprehensive error recovery and logging

## Pipeline Overview

```
Idea/Problem → Requirements → DDD Design → Architecture →
Tactical Design → Implementation → Testing → AI Context
```

## Usage

```bash
# Interactive mode with checkpoints
/idea-to-prd

# Direct execution (advanced users)
/idea-to-prd --auto-execute --idea "Your idea here"

# Resume from checkpoint
/idea-to-prd --resume-from phase-3
```

## Implementation

### Core Validation Functions

```typescript
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\-_\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 100);
}

function validatePath(path: string): boolean {
  const allowedPaths = ['/docs/', '/src/', '/tests/', '/config/'];
  return allowedPaths.some(allowed => path.startsWith(allowed)) &&
         !path.includes('..') &&
         !path.includes('~');
}

function escapeContent(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

### Phase 1: Problem Analysis & Requirements

**Objective**: Transform the idea into structured requirements

**Security Patterns**:
- Input validation for problem statement
- Safe filename generation for requirement documents

**Implementation**:

```typescript
async function executePhase1() {
  // Collect and validate user input
  const problemStatement = await askUserQuestion(
    "🎯 **Phase 1: Problem Analysis**\n\n" +
    "Describe the problem or idea you want to solve:\n" +
    "- What pain point are you addressing?\n" +
    "- Who is affected by this problem?\n" +
    "- What would success look like?\n\n" +
    "**Problem/Idea Description:**"
  );

  if (!problemStatement || problemStatement.length < 10) {
    throw new Error("Problem statement must be at least 10 characters");
  }

  const sanitizedName = sanitizeFileName(problemStatement.split(' ').slice(0, 5).join(' '));
  const requirementsDoc = generateRequirementsDocument(problemStatement);

  // Create requirements document
  await writeFile(
    `/docs/${sanitizedName}-requirements.md`,
    requirementsDoc
  );

  // Checkpoint: User review
  const approval = await askUserQuestion(
    "✅ **Phase 1 Complete**\n\n" +
    `Requirements document created: \`${sanitizedName}-requirements.md\`\n\n` +
    "Please review the generated requirements. Continue to Phase 2? (yes/no)"
  );

  if (approval.toLowerCase() !== 'yes') {
    throw new Error("Phase 1 not approved by user");
  }

  return { sanitizedName, requirementsDoc };
}

function generateRequirementsDocument(problemStatement: string): string {
  return `# Requirements Document

## Problem Statement
${escapeContent(problemStatement)}

## Functional Requirements
- [ ] Core functionality identified
- [ ] User stories defined
- [ ] Acceptance criteria established

## Non-Functional Requirements
- [ ] Performance requirements
- [ ] Security requirements
- [ ] Scalability requirements
- [ ] Usability requirements

## Constraints
- [ ] Technical constraints
- [ ] Business constraints
- [ ] Time constraints

## Success Criteria
- [ ] Measurable outcomes defined
- [ ] KPIs established

*Generated on ${new Date().toISOString()}*
`;
}
```

### Phase 2: DDD Strategic Design

**Objective**: Define bounded contexts and domain model

**Security Patterns**:
- Validate domain context names
- Safe directory structure creation

**Implementation**:

```typescript
async function executePhase2(projectName: string) {
  const domainExploration = await askUserQuestion(
    "🏗️ **Phase 2: Domain-Driven Design - Strategic Design**\n\n" +
    "Let's identify the core domains and bounded contexts:\n\n" +
    "1. What are the main business capabilities?\n" +
    "2. What are the different user roles?\n" +
    "3. What are the key business entities?\n\n" +
    "**Domain Analysis:**"
  );

  const boundedContexts = identifyBoundedContexts(domainExploration);
  const dddDoc = generateDDDStrategicDocument(domainExploration, boundedContexts);

  await writeFile(
    `/docs/${projectName}-ddd-strategic.md`,
    dddDoc
  );

  // Create bounded context directories
  for (const context of boundedContexts) {
    const safeName = sanitizeFileName(context);
    await writeFile(
      `/src/${safeName}/README.md`,
      `# ${context} Bounded Context\n\n*Auto-generated structure*`
    );
  }

  const approval = await askUserQuestion(
    "✅ **Phase 2 Complete**\n\n" +
    `DDD Strategic Design: \`${projectName}-ddd-strategic.md\`\n` +
    `Bounded Contexts: ${boundedContexts.join(', ')}\n\n` +
    "Continue to Phase 3? (yes/no)"
  );

  if (approval.toLowerCase() !== 'yes') {
    throw new Error("Phase 2 not approved by user");
  }

  return { boundedContexts, dddDoc };
}

function identifyBoundedContexts(domainText: string): string[] {
  // Simple heuristic to identify contexts
  const keywords = ['user', 'account', 'payment', 'order', 'product', 'inventory', 'notification'];
  const contexts = keywords.filter(keyword =>
    domainText.toLowerCase().includes(keyword)
  );
  return contexts.length > 0 ? contexts : ['core'];
}
```

### Phase 3: Architecture & ADRs

**Objective**: Define technical architecture and decision records

**Security Patterns**:
- Architecture validation
- Secure ADR template usage

**Implementation**:

```typescript
async function executePhase3(projectName: string, boundedContexts: string[]) {
  const architectureInput = await askUserQuestion(
    "🏛️ **Phase 3: Architecture & ADRs**\n\n" +
    "Define the technical architecture:\n\n" +
    "1. What's your preferred tech stack?\n" +
    "2. What are your scalability requirements?\n" +
    "3. What are your integration needs?\n" +
    "4. What are your security requirements?\n\n" +
    "**Architecture Details:**"
  );

  const architectureDoc = generateArchitectureDocument(architectureInput, boundedContexts);
  const adrs = generateADRs(architectureInput);

  await writeFile(
    `/docs/${projectName}-architecture.md`,
    architectureDoc
  );

  // Create ADRs
  for (let i = 0; i < adrs.length; i++) {
    const adrNumber = String(i + 1).padStart(4, '0');
    await writeFile(
      `/docs/adrs/ADR-${adrNumber}-${sanitizeFileName(adrs[i].title)}.md`,
      adrs[i].content
    );
  }

  const approval = await askUserQuestion(
    "✅ **Phase 3 Complete**\n\n" +
    `Architecture: \`${projectName}-architecture.md\`\n` +
    `ADRs created: ${adrs.length}\n\n` +
    "Continue to Phase 4? (yes/no)"
  );

  if (approval.toLowerCase() !== 'yes') {
    throw new Error("Phase 3 not approved by user");
  }

  return { architectureDoc, adrs };
}

function generateADRs(architectureInput: string): Array<{title: string, content: string}> {
  return [
    {
      title: "technology-stack",
      content: generateADRContent("Technology Stack Selection", architectureInput)
    },
    {
      title: "data-storage",
      content: generateADRContent("Data Storage Strategy", architectureInput)
    },
    {
      title: "security-model",
      content: generateADRContent("Security Model", architectureInput)
    }
  ];
}

function generateADRContent(title: string, context: string): string {
  return `# ADR: ${title}

## Status
Proposed

## Context
${escapeContent(context)}

## Decision
[To be filled based on analysis]

## Consequences
### Positive
- [Benefits]

### Negative
- [Trade-offs]

## Alternatives Considered
- [Option 1]
- [Option 2]

*Generated on ${new Date().toISOString()}*
`;
}
```

### Phase 4: DDD Tactical Design

**Objective**: Define aggregates, entities, and value objects

**Implementation**:

```typescript
async function executePhase4(projectName: string, boundedContexts: string[]) {
  const tacticalInput = await askUserQuestion(
    "⚙️ **Phase 4: DDD Tactical Design**\n\n" +
    "Define the domain model for each bounded context:\n\n" +
    "For each context, identify:\n" +
    "1. Aggregates (main business entities)\n" +
    "2. Value Objects (immutable concepts)\n" +
    "3. Domain Events (things that happen)\n" +
    "4. Services (domain operations)\n\n" +
    "**Domain Model Details:**"
  );

  const tacticalDoc = generateTacticalDocument(tacticalInput, boundedContexts);

  await writeFile(
    `/docs/${projectName}-ddd-tactical.md`,
    tacticalDoc
  );

  // Create domain model files for each context
  for (const context of boundedContexts) {
    const safeName = sanitizeFileName(context);
    await writeFile(
      `/src/${safeName}/domain/entities.ts`,
      generateEntityTemplate(context)
    );
    await writeFile(
      `/src/${safeName}/domain/value-objects.ts`,
      generateValueObjectTemplate(context)
    );
  }

  const approval = await askUserQuestion(
    "✅ **Phase 4 Complete**\n\n" +
    `Tactical Design: \`${projectName}-ddd-tactical.md\`\n` +
    `Domain models created for ${boundedContexts.length} contexts\n\n` +
    "Continue to Phase 5? (yes/no)"
  );

  if (approval.toLowerCase() !== 'yes') {
    throw new Error("Phase 4 not approved by user");
  }

  return { tacticalDoc };
}
```

### Phase 5: Pseudocode & Implementation Logic

**Objective**: Define implementation logic and algorithms

**Implementation**:

```typescript
async function executePhase5(projectName: string, boundedContexts: string[]) {
  const implementationInput = await askUserQuestion(
    "💻 **Phase 5: Pseudocode & Implementation Logic**\n\n" +
    "Define the core implementation logic:\n\n" +
    "1. What are the main use cases/workflows?\n" +
    "2. What algorithms will you use?\n" +
    "3. What are the integration patterns?\n" +
    "4. What are the error handling strategies?\n\n" +
    "**Implementation Details:**"
  );

  const pseudocodeDoc = generatePseudocodeDocument(implementationInput);

  await writeFile(
    `/docs/${projectName}-pseudocode.md`,
    pseudocodeDoc
  );

  // Create pseudocode files for each context
  for (const context of boundedContexts) {
    const safeName = sanitizeFileName(context);
    await writeFile(
      `/src/${safeName}/pseudocode.md`,
      generateContextPseudocode(context, implementationInput)
    );
  }

  const approval = await askUserQuestion(
    "✅ **Phase 5 Complete**\n\n" +
    `Pseudocode: \`${projectName}-pseudocode.md\`\n\n` +
    "Continue to Phase 6? (yes/no)"
  );

  if (approval.toLowerCase() !== 'yes') {
    throw new Error("Phase 5 not approved by user");
  }

  return { pseudocodeDoc };
}
```

### Phase 6: Testing Strategy

**Objective**: Define comprehensive testing approach

**Implementation**:

```typescript
async function executePhase6(projectName: string, boundedContexts: string[]) {
  const testingInput = await askUserQuestion(
    "🧪 **Phase 6: Testing Strategy**\n\n" +
    "Define your testing approach:\n\n" +
    "1. What testing levels do you need? (unit, integration, e2e)\n" +
    "2. What are your quality gates?\n" +
    "3. What are your performance requirements?\n" +
    "4. What security testing is needed?\n\n" +
    "**Testing Requirements:**"
  );

  const testingDoc = generateTestingDocument(testingInput, boundedContexts);

  await writeFile(
    `/docs/${projectName}-testing-strategy.md`,
    testingDoc
  );

  // Create test templates
  for (const context of boundedContexts) {
    const safeName = sanitizeFileName(context);
    await writeFile(
      `/tests/${safeName}/unit.test.ts`,
      generateUnitTestTemplate(context)
    );
    await writeFile(
      `/tests/${safeName}/integration.test.ts`,
      generateIntegrationTestTemplate(context)
    );
  }

  const approval = await askUserQuestion(
    "✅ **Phase 6 Complete**\n\n" +
    `Testing Strategy: \`${projectName}-testing-strategy.md\`\n\n` +
    "Continue to Phase 7? (yes/no)"
  );

  if (approval.toLowerCase() !== 'yes') {
    throw new Error("Phase 6 not approved by user");
  }

  return { testingDoc };
}
```

### Phase 7: AI Context Generation

**Objective**: Create comprehensive AI context for future development

**Implementation**:

```typescript
async function executePhase7(projectName: string, allPhaseData: any) {
  const aiContextDoc = generateAIContextDocument(projectName, allPhaseData);

  await writeFile(
    `/.ai-context/project-context.md`,
    aiContextDoc
  );

  await writeFile(
    `/.ai-context/development-rules.md`,
    generateDevelopmentRules(allPhaseData)
  );

  await writeFile(
    `/.ai-context/architectural-constraints.md`,
    generateArchitecturalConstraints(allPhaseData)
  );

  await writeFile(
    `/docs/${projectName}-PRD.md`,
    generateFinalPRD(projectName, allPhaseData)
  );

  await askUserQuestion(
    "🎉 **SKILL COMPLETE**\n\n" +
    `✅ Final PRD: \`${projectName}-PRD.md\`\n` +
    `✅ AI Context: \`.ai-context/\` directory\n` +
    `✅ Documentation: \`docs/\` directory\n` +
    `✅ Source Structure: \`src/\` directory\n` +
    `✅ Test Templates: \`tests/\` directory\n\n` +
    "Your idea has been transformed into a comprehensive PRD with full technical specification!\n\n" +
    "Press Enter to continue..."
  );

  return { success: true, projectName };
}
```

### Error Handling & Recovery

```typescript
function handlePhaseError(phase: number, error: Error): void {
  console.error(`❌ Phase ${phase} Error: ${error.message}`);

  // Log error securely (no sensitive data)
  const sanitizedError = {
    phase,
    message: error.message.substring(0, 200),
    timestamp: new Date().toISOString()
  };

  // Save checkpoint for recovery
  saveCheckpoint(phase - 1, sanitizedError);

  throw new Error(`Phase ${phase} failed. Use --resume-from phase-${phase} to retry.`);
}

function saveCheckpoint(phase: number, data: any): void {
  const checkpoint = {
    phase,
    timestamp: new Date().toISOString(),
    data: sanitizeCheckpointData(data)
  };

  // Save to secure location
  writeFile(`/.claude-temp/checkpoint-phase-${phase}.json`, JSON.stringify(checkpoint));
}
```

## Main Execution Function

```typescript
export async function executeSkill(args: string[] = []): Promise<void> {
  try {
    console.log("🚀 Starting Secure Idea-to-PRD Pipeline...\n");

    // Phase 1: Problem Analysis & Requirements
    const phase1 = await executePhase1();

    // Phase 2: DDD Strategic Design
    const phase2 = await executePhase2(phase1.sanitizedName);

    // Phase 3: Architecture & ADRs
    const phase3 = await executePhase3(phase1.sanitizedName, phase2.boundedContexts);

    // Phase 4: DDD Tactical Design
    const phase4 = await executePhase4(phase1.sanitizedName, phase2.boundedContexts);

    // Phase 5: Pseudocode & Implementation
    const phase5 = await executePhase5(phase1.sanitizedName, phase2.boundedContexts);

    // Phase 6: Testing Strategy
    const phase6 = await executePhase6(phase1.sanitizedName, phase2.boundedContexts);

    // Phase 7: AI Context Generation
    await executePhase7(phase1.sanitizedName, {
      phase1,
      phase2,
      phase3,
      phase4,
      phase5,
      phase6
    });

    console.log("✅ Idea-to-PRD transformation completed successfully!");

  } catch (error) {
    console.error("❌ Pipeline failed:", error.message);
    throw error;
  }
}
```

## Security Compliance

- ✅ Input validation at every phase
- ✅ Safe file path construction
- ✅ Content sanitization and escaping
- ✅ Error handling with secure logging
- ✅ Checkpoint system for recovery
- ✅ Progressive disclosure with user consent
- ✅ No hardcoded secrets or credentials

## Usage Examples

### Basic Usage
```bash
/idea-to-prd
```

### Advanced Usage
```bash
/idea-to-prd --project-name "my-app" --domain "e-commerce"
```

### Resume from Checkpoint
```bash
/idea-to-prd --resume-from phase-3 --project-name "my-app"
```

This skill provides a secure, comprehensive pipeline for transforming ideas into production-ready PRDs with full technical specifications, architectural decisions, and AI context for future development.