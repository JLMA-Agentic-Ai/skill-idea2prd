# Domain-Driven Design Analysis

**Project**: {{PROJECT_NAME|sanitize}}
**Domain**: {{DOMAIN_NAME|sanitize}}
**Analysis Date**: {{ANALYSIS_DATE|validate_date}}
**Version**: {{VERSION|default:1.0}}
**Status**: {{STATUS|validate_enum:Draft,Review,Approved,Archived}}

---

## Security Classification
- **Classification**: {{SECURITY_LEVEL|default:Internal}}
- **Domain Sensitivity**: {{DOMAIN_SENSITIVITY|validate_enum:Public,Internal,Confidential,Restricted}}
- **Business Criticality**: {{BUSINESS_CRITICALITY|validate_enum:Low,Medium,High,Critical}}

---

## Executive Summary

### Domain Overview
{{DOMAIN_OVERVIEW|sanitize|max_length:500}}

### Key Business Value
{{BUSINESS_VALUE|sanitize|max_length:300}}

### Strategic Importance
{{STRATEGIC_IMPORTANCE|sanitize|max_length:300}}

---

## Problem Space Analysis

### Business Problem
{{BUSINESS_PROBLEM|sanitize|max_length:1000}}

### Current Pain Points
{{#each PAIN_POINTS}}
- **{{category|sanitize}}**: {{description|sanitize|max_length:200}}
  - Impact: {{impact|validate_enum:Low,Medium,High,Critical}}
  - Frequency: {{frequency|validate_enum:Rare,Occasional,Frequent,Constant}}
{{/each}}

### Success Vision
{{SUCCESS_VISION|sanitize|max_length:500}}

---

## Ubiquitous Language

### Core Domain Terms
{{#each CORE_TERMS}}
#### {{term|sanitize}}
- **Definition**: {{definition|sanitize|max_length:200}}
- **Context**: {{context|sanitize|max_length:150}}
- **Aliases**: {{aliases|sanitize}}
- **Related Terms**: {{related_terms|sanitize}}
{{/each}}

### Business Rules Vocabulary
{{#each BUSINESS_RULES}}
#### {{rule_name|sanitize}}
- **Rule**: {{rule_description|sanitize|max_length:300}}
- **Trigger**: {{trigger|sanitize|max_length:100}}
- **Outcome**: {{outcome|sanitize|max_length:100}}
- **Exceptions**: {{exceptions|sanitize|max_length:150}}
{{/each}}

### Process Terminology
{{#each PROCESS_TERMS}}
- **{{process|sanitize}}**: {{description|sanitize|max_length:150}}
{{/each}}

---

## Bounded Contexts

{{#each BOUNDED_CONTEXTS}}
### {{name|sanitize}} Context

#### Context Description
{{description|sanitize|max_length:500}}

#### Core Responsibilities
{{#each responsibilities}}
- {{this|sanitize|max_length:100}}
{{/each}}

#### Ubiquitous Language (Local)
{{#each local_language}}
- **{{term|sanitize}}**: {{definition|sanitize|max_length:150}}
{{/each}}

#### Key Entities
{{#each entities}}
- **{{entity|sanitize}}**: {{description|sanitize|max_length:100}}
{{/each}}

#### Business Capabilities
{{#each capabilities}}
- **{{capability|sanitize}}**: {{description|sanitize|max_length:150}}
  - Complexity: {{complexity|validate_enum:Low,Medium,High}}
  - Business Value: {{value|validate_enum:Low,Medium,High,Critical}}
{{/each}}

#### Data Ownership
{{#each data_ownership}}
- **{{data_type|sanitize}}**: {{ownership|validate_enum:Owns,Shares,Consumes}}
{{/each}}

#### Team Ownership
- **Owning Team**: {{owning_team|sanitize}}
- **Team Size**: {{team_size|validate_number}} members
- **Stakeholders**: {{stakeholders|sanitize}}

#### Integration Points
{{#each integration_points}}
- **{{target_context|sanitize}}**: {{integration_type|validate_enum:Shared Kernel,Customer-Supplier,Conformist,Anticorruption Layer,Open Host Service,Published Language}}
  - Direction: {{direction|validate_enum:Upstream,Downstream,Bidirectional}}
  - Protocol: {{protocol|sanitize}}
{{/each}}

---

{{/each}}

## Context Mapping

### Relationship Matrix
| Context A | Context B | Relationship | Integration Pattern | Complexity |
|-----------|-----------|--------------|-------------------|------------|
{{#each CONTEXT_RELATIONSHIPS}}
| {{context_a|sanitize}} | {{context_b|sanitize}} | {{relationship|sanitize}} | {{pattern|sanitize}} | {{complexity|validate_enum:Low,Medium,High}} |
{{/each}}

### Strategic Design Patterns

#### Shared Kernels
{{#each SHARED_KERNELS}}
- **{{name|sanitize}}**: Shared between {{contexts|sanitize}}
  - Content: {{content|sanitize|max_length:200}}
  - Governance: {{governance|sanitize|max_length:100}}
{{/each}}

#### Customer-Supplier Relationships
{{#each CUSTOMER_SUPPLIER}}
- **Customer**: {{customer|sanitize}}
- **Supplier**: {{supplier|sanitize}}
- **Interface**: {{interface|sanitize|max_length:150}}
- **SLA**: {{sla|sanitize}}
{{/each}}

#### Anticorruption Layers
{{#each ANTICORRUPTION_LAYERS}}
- **Protecting Context**: {{protecting_context|sanitize}}
- **External System**: {{external_system|sanitize}}
- **Translation Logic**: {{translation_logic|sanitize|max_length:200}}
{{/each}}

---

## Domain Model Design

### Core Domain
{{CORE_DOMAIN_DESCRIPTION|sanitize|max_length:500}}

#### Domain Entities
{{#each DOMAIN_ENTITIES}}
##### {{entity_name|sanitize}}
- **Identity**: {{identity_field|sanitize}}
- **Lifecycle**: {{lifecycle|sanitize|max_length:150}}
- **Invariants**: {{invariants|sanitize|max_length:200}}
- **Behavior**: {{behavior|sanitize|max_length:200}}

**Attributes**:
{{#each attributes}}
- **{{name|sanitize}}**: {{type|sanitize}} - {{description|sanitize|max_length:100}}
{{/each}}

**Business Rules**:
{{#each business_rules}}
- {{rule|sanitize|max_length:150}}
{{/each}}
{{/each}}

#### Value Objects
{{#each VALUE_OBJECTS}}
##### {{name|sanitize}}
- **Purpose**: {{purpose|sanitize|max_length:150}}
- **Immutability**: {{immutable|validate_boolean}}
- **Validation Rules**: {{validation|sanitize|max_length:200}}

**Properties**:
{{#each properties}}
- **{{name|sanitize}}**: {{type|sanitize}} - {{constraint|sanitize}}
{{/each}}
{{/each}}

#### Aggregates
{{#each AGGREGATES}}
##### {{aggregate_name|sanitize}}
- **Aggregate Root**: {{root_entity|sanitize}}
- **Consistency Boundary**: {{consistency_boundary|sanitize|max_length:200}}
- **Transaction Scope**: {{transaction_scope|sanitize|max_length:150}}

**Contained Entities**:
{{#each contained_entities}}
- {{entity|sanitize}}
{{/each}}

**Domain Events**:
{{#each domain_events}}
- **{{event|sanitize}}**: {{description|sanitize|max_length:150}}
{{/each}}

**Invariants**:
{{#each invariants}}
- {{invariant|sanitize|max_length:150}}
{{/each}}
{{/each}}

#### Domain Services
{{#each DOMAIN_SERVICES}}
##### {{service_name|sanitize}}
- **Purpose**: {{purpose|sanitize|max_length:200}}
- **Stateless**: {{stateless|validate_boolean}}
- **Operations**: {{operations|sanitize}}
{{/each}}

---

## Supporting Subdomains

{{#each SUPPORTING_SUBDOMAINS}}
### {{name|sanitize}} Subdomain

#### Classification
- **Type**: {{type|validate_enum:Supporting,Generic}}
- **Complexity**: {{complexity|validate_enum:Low,Medium,High}}
- **Business Impact**: {{impact|validate_enum:Low,Medium,High}}

#### Description
{{description|sanitize|max_length:300}}

#### Key Capabilities
{{#each capabilities}}
- {{capability|sanitize|max_length:100}}
{{/each}}

#### Implementation Strategy
{{implementation_strategy|sanitize|max_length:200}}

---

{{/each}}

## Event Storming Results

### Domain Events
{{#each DOMAIN_EVENTS}}
#### {{event_name|sanitize}}
- **Trigger**: {{trigger|sanitize|max_length:150}}
- **Data**: {{event_data|sanitize}}
- **Consequences**: {{consequences|sanitize|max_length:200}}
- **Interested Contexts**: {{interested_contexts|sanitize}}
{{/each}}

### Commands
{{#each COMMANDS}}
#### {{command_name|sanitize}}
- **Intent**: {{intent|sanitize|max_length:150}}
- **Actor**: {{actor|sanitize}}
- **Preconditions**: {{preconditions|sanitize|max_length:150}}
- **Resulting Events**: {{resulting_events|sanitize}}
{{/each}}

### Read Models
{{#each READ_MODELS}}
#### {{model_name|sanitize}}
- **Purpose**: {{purpose|sanitize|max_length:150}}
- **Data Sources**: {{data_sources|sanitize}}
- **Update Frequency**: {{update_frequency|validate_enum:Real-time,Near real-time,Batch,On-demand}}
{{/each}}

---

## Architecture Implications

### Application Services
{{#each APPLICATION_SERVICES}}
#### {{service_name|sanitize}}
- **Bounded Context**: {{bounded_context|sanitize}}
- **Responsibilities**: {{responsibilities|sanitize|max_length:200}}
- **Dependencies**: {{dependencies|sanitize}}
{{/each}}

### Infrastructure Requirements
{{#each INFRASTRUCTURE_REQUIREMENTS}}
- **{{component|sanitize}}**: {{requirement|sanitize|max_length:150}}
  - Justification: {{justification|sanitize|max_length:100}}
{{/each}}

### Integration Architecture
{{INTEGRATION_ARCHITECTURE|sanitize|max_length:500}}

### Data Storage Strategy
{{#each STORAGE_STRATEGIES}}
- **{{context|sanitize}}**: {{strategy|sanitize|max_length:200}}
  - Technology: {{technology|sanitize}}
  - Reasoning: {{reasoning|sanitize|max_length:150}}
{{/each}}

---

## Implementation Roadmap

### Phase 1: Core Domain
- **Duration**: {{PHASE1_DURATION|validate_time}}
- **Scope**: {{PHASE1_SCOPE|sanitize|max_length:300}}
- **Success Criteria**: {{PHASE1_SUCCESS|sanitize|max_length:200}}

### Phase 2: Supporting Contexts
- **Duration**: {{PHASE2_DURATION|validate_time}}
- **Scope**: {{PHASE2_SCOPE|sanitize|max_length:300}}
- **Success Criteria**: {{PHASE2_SUCCESS|sanitize|max_length:200}}

### Phase 3: Integration & Optimization
- **Duration**: {{PHASE3_DURATION|validate_time}}
- **Scope**: {{PHASE3_SCOPE|sanitize|max_length:300}}
- **Success Criteria**: {{PHASE3_SUCCESS|sanitize|max_length:200}}

### Risk Mitigation
{{#each RISKS}}
- **{{risk|sanitize}}**: {{mitigation|sanitize|max_length:200}}
  - Probability: {{probability|validate_enum:Low,Medium,High}}
  - Impact: {{impact|validate_enum:Low,Medium,High,Critical}}
{{/each}}

---

## Quality Attributes

### Performance Characteristics
{{#each PERFORMANCE_REQS}}
- **{{metric|sanitize}}**: {{target|sanitize}}
  - Context: {{context|sanitize}}
{{/each}}

### Security Requirements
{{#each SECURITY_REQS}}
- **{{requirement|sanitize}}**: {{description|sanitize|max_length:200}}
  - Context: {{context|sanitize}}
{{/each}}

### Scalability Considerations
{{SCALABILITY_CONSIDERATIONS|sanitize|max_length:500}}

---

## Team Structure & Conway's Law

### Team Organization
{{#each TEAMS}}
#### {{team_name|sanitize}}
- **Owned Contexts**: {{owned_contexts|sanitize}}
- **Team Size**: {{size|validate_number}} members
- **Skill Set**: {{skills|sanitize}}
- **Communication Patterns**: {{communication|sanitize|max_length:150}}
{{/each}}

### Communication Structure
{{COMMUNICATION_STRUCTURE|sanitize|max_length:500}}

---

## Validation & Metrics

### Success Metrics
{{#each SUCCESS_METRICS}}
- **{{metric|sanitize}}**: {{target|sanitize}}
  - Current State: {{current|sanitize}}
  - Measurement Method: {{method|sanitize}}
{{/each}}

### Domain Model Validation
{{#each VALIDATION_CRITERIA}}
- **{{criterion|sanitize}}**: {{status|validate_enum:Pass,Fail,Pending}}
  - Evidence: {{evidence|sanitize|max_length:150}}
{{/each}}

---

## Review and Evolution

### Next Review Date
{{NEXT_REVIEW|validate_date}}

### Evolution Triggers
{{#each EVOLUTION_TRIGGERS}}
- **{{trigger|sanitize}}**: {{description|sanitize|max_length:150}}
{{/each}}

### Knowledge Crunching Sessions
{{#each KNOWLEDGE_SESSIONS}}
- **{{date|validate_date}}**: {{outcome|sanitize|max_length:200}}
  - Participants: {{participants|sanitize}}
{{/each}}

---

## References

### Domain Expert Interviews
{{#each DOMAIN_EXPERT_INTERVIEWS}}
- **{{date|validate_date}}**: {{expert|sanitize}} - {{key_insights|sanitize|max_length:200}}
{{/each}}

### Business Documentation
{{#each BUSINESS_DOCS}}
- [{{title|sanitize}}]({{url|validate_url}})
{{/each}}

### Related Analysis
{{#each RELATED_ANALYSIS}}
- [{{title|sanitize}}]({{url|validate_url}}) - {{relevance|sanitize|max_length:100}}
{{/each}}

---

**Analysis Generated**: {{GENERATION_TIMESTAMP}}
**Generator**: Idea-to-PRD Skill v{{SKILL_VERSION}}
**Domain Model Hash**: {{MODEL_HASH}}
**Last Validated**: {{LAST_VALIDATED|validate_date}}