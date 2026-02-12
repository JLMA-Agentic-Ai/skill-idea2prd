# C4 Model Architecture Documentation

**System**: {{SYSTEM_NAME|sanitize}}
**Version**: {{VERSION|default:1.0}}
**Date**: {{ANALYSIS_DATE|validate_date}}
**Architect**: {{ARCHITECT|sanitize}}
**Status**: {{STATUS|validate_enum:Draft,Review,Approved,Deprecated}}

---

## Security Classification
- **Classification**: {{SECURITY_LEVEL|default:Internal}}
- **Architecture Sensitivity**: {{ARCH_SENSITIVITY|validate_enum:Public,Internal,Confidential,Restricted}}
- **Technical Risk**: {{TECH_RISK|validate_enum:Low,Medium,High,Critical}}

---

## C4 Model Overview

### Purpose
{{PURPOSE|sanitize|max_length:500}}

### Scope
{{SCOPE|sanitize|max_length:300}}

### Audience
{{AUDIENCE|sanitize|max_length:200}}

---

## Level 1: System Context Diagram

### System Description
{{SYSTEM_DESCRIPTION|sanitize|max_length:1000}}

### External Actors
{{#each EXTERNAL_ACTORS}}
#### {{name|sanitize}}
- **Type**: {{type|validate_enum:Person,External System,Organization}}
- **Description**: {{description|sanitize|max_length:200}}
- **Interaction**: {{interaction|sanitize|max_length:150}}
- **Trust Level**: {{trust_level|validate_enum:Trusted,Semi-trusted,Untrusted}}
{{/each}}

### External Systems
{{#each EXTERNAL_SYSTEMS}}
#### {{name|sanitize}}
- **Type**: {{type|sanitize}}
- **Description**: {{description|sanitize|max_length:200}}
- **Protocol**: {{protocol|sanitize}}
- **Data Exchanged**: {{data_exchanged|sanitize|max_length:150}}
- **SLA Requirements**: {{sla|sanitize}}
- **Security Zone**: {{security_zone|validate_enum:Public,DMZ,Internal,Restricted}}
{{/each}}

### System Boundaries
{{SYSTEM_BOUNDARIES|sanitize|max_length:500}}

### Key Interactions
{{#each KEY_INTERACTIONS}}
- **{{from|sanitize}}** → **{{to|sanitize}}**: {{description|sanitize|max_length:150}}
  - Protocol: {{protocol|sanitize}}
  - Frequency: {{frequency|sanitize}}
  - Data Volume: {{volume|sanitize}}
{{/each}}

---

## Level 2: Container Diagram

### Container Overview
{{CONTAINER_OVERVIEW|sanitize|max_length:500}}

### Application Containers
{{#each APPLICATION_CONTAINERS}}
#### {{name|sanitize}}
- **Type**: {{type|validate_enum:Web Application,Mobile App,Desktop App,CLI Tool,Microservice,API,Database,Message Broker,Web Server,Application Server}}
- **Technology**: {{technology|sanitize}}
- **Description**: {{description|sanitize|max_length:200}}
- **Responsibilities**: {{responsibilities|sanitize|max_length:300}}

**Runtime Environment**:
- **Platform**: {{platform|sanitize}}
- **Runtime**: {{runtime|sanitize}}
- **Memory**: {{memory|sanitize}}
- **CPU**: {{cpu|sanitize}}
- **Storage**: {{storage|sanitize}}

**Security Characteristics**:
- **Authentication**: {{auth_method|sanitize}}
- **Authorization**: {{authz_model|sanitize}}
- **Encryption**: {{encryption|sanitize}}
- **Security Zone**: {{security_zone|validate_enum:Public,DMZ,Internal,Restricted}}

**Quality Attributes**:
- **Availability**: {{availability|validate_percentage}}
- **Performance**: {{performance_req|sanitize}}
- **Scalability**: {{scalability_req|sanitize}}
- **Maintainability**: {{maintainability|validate_enum:Low,Medium,High}}
{{/each}}

### Data Stores
{{#each DATA_STORES}}
#### {{name|sanitize}}
- **Type**: {{type|validate_enum:Relational Database,NoSQL Database,Cache,File System,Object Store,Message Queue,Event Store}}
- **Technology**: {{technology|sanitize}}
- **Purpose**: {{purpose|sanitize|max_length:200}}
- **Data Classification**: {{data_classification|validate_enum:Public,Internal,Confidential,Restricted}}

**Schema Information**:
- **Tables/Collections**: {{entity_count|validate_number}}
- **Data Volume**: {{data_volume|sanitize}}
- **Growth Rate**: {{growth_rate|sanitize}}
- **Retention Policy**: {{retention|sanitize}}

**Performance Characteristics**:
- **Read Operations**: {{read_ops|sanitize}} ops/sec
- **Write Operations**: {{write_ops|sanitize}} ops/sec
- **Query Patterns**: {{query_patterns|sanitize|max_length:200}}

**Security & Compliance**:
- **Encryption at Rest**: {{encryption_at_rest|validate_boolean}}
- **Encryption in Transit**: {{encryption_in_transit|validate_boolean}}
- **Access Controls**: {{access_controls|sanitize}}
- **Compliance**: {{compliance|sanitize}}
{{/each}}

### Container Interactions
{{#each CONTAINER_INTERACTIONS}}
- **{{source|sanitize}}** → **{{target|sanitize}}**
  - Protocol: {{protocol|sanitize}}
  - Port: {{port|validate_number}}
  - Security: {{security|sanitize}}
  - Data Format: {{format|sanitize}}
  - Synchronous: {{synchronous|validate_boolean}}
{{/each}}

---

## Level 3: Component Diagram

{{#each CONTAINERS_DETAILED}}
### Components in {{container_name|sanitize}}

#### Component Overview
{{component_overview|sanitize|max_length:500}}

#### Core Components
{{#each components}}
##### {{name|sanitize}}
- **Type**: {{type|validate_enum:Controller,Service,Repository,Utility,Handler,Middleware,Validator,Transformer}}
- **Responsibility**: {{responsibility|sanitize|max_length:200}}
- **Technology**: {{technology|sanitize}}

**Interfaces**:
{{#each interfaces}}
- **{{interface_name|sanitize}}**: {{description|sanitize|max_length:100}}
{{/each}}

**Dependencies**:
{{#each dependencies}}
- {{dependency|sanitize}}
{{/each}}

**Quality Attributes**:
- **Testability**: {{testability|validate_enum:Low,Medium,High}}
- **Complexity**: {{complexity|validate_enum:Low,Medium,High}}
- **Reusability**: {{reusability|validate_enum:Low,Medium,High}}
{{/each}}

#### Component Interactions
{{#each component_interactions}}
- **{{from|sanitize}}** → **{{to|sanitize}}**: {{interaction|sanitize|max_length:100}}
{{/each}}

#### Layered Architecture
{{#each layers}}
- **{{layer|sanitize}}**: {{components|sanitize}}
{{/each}}

---

{{/each}}

## Level 4: Code Structure

### Package Organization
{{#each PACKAGES}}
#### {{package_name|sanitize}}
- **Purpose**: {{purpose|sanitize|max_length:200}}
- **Dependencies**: {{dependencies|sanitize}}
- **Size**: {{file_count|validate_number}} files

**Key Classes/Modules**:
{{#each key_classes}}
- **{{class_name|sanitize}}**: {{description|sanitize|max_length:100}}
{{/each}}
{{/each}}

### Design Patterns
{{#each DESIGN_PATTERNS}}
- **{{pattern|sanitize}}**: {{usage|sanitize|max_length:200}}
  - Location: {{location|sanitize}}
  - Rationale: {{rationale|sanitize|max_length:150}}
{{/each}}

### Coding Standards
{{#each CODING_STANDARDS}}
- **{{standard|sanitize}}**: {{description|sanitize|max_length:150}}
{{/each}}

---

## Deployment Architecture

### Environments
{{#each ENVIRONMENTS}}
#### {{environment|sanitize}}
- **Purpose**: {{purpose|sanitize|max_length:100}}
- **Infrastructure**: {{infrastructure|sanitize}}
- **Configuration**: {{configuration|sanitize|max_length:200}}
- **Security Level**: {{security_level|validate_enum:Low,Medium,High,Critical}}
{{/each}}

### Infrastructure Components
{{#each INFRASTRUCTURE}}
#### {{component|sanitize}}
- **Type**: {{type|validate_enum:Load Balancer,Web Server,Application Server,Database Server,Cache,CDN,Message Queue}}
- **Technology**: {{technology|sanitize}}
- **Purpose**: {{purpose|sanitize|max_length:150}}
- **Scaling Strategy**: {{scaling|sanitize}}
{{/each}}

### Networking
{{#each NETWORK_SEGMENTS}}
#### {{segment|sanitize}}
- **CIDR**: {{cidr|sanitize}}
- **Purpose**: {{purpose|sanitize|max_length:100}}
- **Security Zone**: {{zone|validate_enum:Public,DMZ,Internal,Restricted}}
- **Access Controls**: {{access_controls|sanitize}}
{{/each}}

---

## Cross-Cutting Concerns

### Security Architecture
{{#each SECURITY_CONCERNS}}
#### {{concern|sanitize}}
- **Implementation**: {{implementation|sanitize|max_length:200}}
- **Components Affected**: {{components|sanitize}}
- **Standards**: {{standards|sanitize}}
{{/each}}

### Monitoring & Observability
{{#each MONITORING_ASPECTS}}
#### {{aspect|sanitize}}
- **Metrics**: {{metrics|sanitize}}
- **Tools**: {{tools|sanitize}}
- **Thresholds**: {{thresholds|sanitize}}
{{/each}}

### Performance Considerations
{{#each PERFORMANCE_CONSIDERATIONS}}
- **{{area|sanitize}}**: {{consideration|sanitize|max_length:200}}
  - Impact: {{impact|validate_enum:Low,Medium,High}}
  - Mitigation: {{mitigation|sanitize|max_length:150}}
{{/each}}

### Reliability Patterns
{{#each RELIABILITY_PATTERNS}}
- **{{pattern|sanitize}}**: {{implementation|sanitize|max_length:200}}
  - Components: {{components|sanitize}}
{{/each}}

---

## Quality Attributes Analysis

### Performance Analysis
{{#each PERFORMANCE_METRICS}}
- **{{metric|sanitize}}**: {{target|sanitize}} (current: {{current|sanitize}})
  - Measurement: {{measurement|sanitize}}
{{/each}}

### Security Analysis
{{#each SECURITY_METRICS}}
- **{{metric|sanitize}}**: {{assessment|sanitize|max_length:200}}
  - Risk Level: {{risk|validate_enum:Low,Medium,High,Critical}}
{{/each}}

### Scalability Analysis
{{SCALABILITY_ANALYSIS|sanitize|max_length:500}}

### Maintainability Analysis
{{MAINTAINABILITY_ANALYSIS|sanitize|max_length:500}}

---

## Architecture Decisions

### Key Decisions
{{#each ARCHITECTURE_DECISIONS}}
#### ADR-{{id|validate_number}}: {{title|sanitize}}
- **Status**: {{status|validate_enum:Proposed,Accepted,Deprecated,Superseded}}
- **Decision**: {{decision|sanitize|max_length:200}}
- **Rationale**: {{rationale|sanitize|max_length:300}}
- **Consequences**: {{consequences|sanitize|max_length:200}}
{{/each}}

---

## Evolution and Migration

### Current State Assessment
{{CURRENT_STATE|sanitize|max_length:500}}

### Target State Vision
{{TARGET_STATE|sanitize|max_length:500}}

### Migration Strategy
{{#each MIGRATION_PHASES}}
#### Phase {{phase|validate_number}}: {{name|sanitize}}
- **Duration**: {{duration|validate_time}}
- **Scope**: {{scope|sanitize|max_length:300}}
- **Risks**: {{risks|sanitize|max_length:200}}
- **Success Criteria**: {{success_criteria|sanitize|max_length:150}}
{{/each}}

### Technical Debt
{{#each TECHNICAL_DEBT}}
- **{{debt_item|sanitize}}**: {{description|sanitize|max_length:200}}
  - Priority: {{priority|validate_enum:Low,Medium,High,Critical}}
  - Effort: {{effort|sanitize}}
{{/each}}

---

## Validation and Review

### Architecture Review
- **Review Date**: {{REVIEW_DATE|validate_date}}
- **Reviewers**: {{REVIEWERS|sanitize}}
- **Status**: {{REVIEW_STATUS|validate_enum:Pending,Approved,Needs Changes,Rejected}}

### Compliance Check
{{#each COMPLIANCE_CHECKS}}
- **{{standard|sanitize}}**: {{status|validate_enum:Compliant,Non-compliant,Partial,Not Applicable}}
  - Notes: {{notes|sanitize|max_length:150}}
{{/each}}

### Stakeholder Approval
{{#each STAKEHOLDER_APPROVALS}}
- **{{role|sanitize}}**: {{name|sanitize}}
  - Date: {{date|validate_date}}
  - Status: {{status|validate_enum:Pending,Approved,Rejected}}
{{/each}}

---

## References

### Related Documents
{{#each RELATED_DOCS}}
- [{{title|sanitize}}]({{url|validate_url}}) - {{description|sanitize|max_length:100}}
{{/each}}

### Standards and Guidelines
{{#each STANDARDS}}
- **{{standard|sanitize}}**: {{description|sanitize|max_length:150}}
{{/each}}

### Tools and Technologies
{{#each TOOLS}}
- **{{tool|sanitize}}**: {{purpose|sanitize|max_length:100}}
  - Version: {{version|sanitize}}
  - Documentation: {{docs_url|validate_url}}
{{/each}}

---

## Glossary

{{#each GLOSSARY_TERMS}}
### {{term|sanitize}}
{{definition|sanitize|max_length:200}}
{{/each}}

---

**Document Generated**: {{GENERATION_TIMESTAMP}}
**Generator**: Idea-to-PRD Skill v{{SKILL_VERSION}}
**Architecture Hash**: {{ARCHITECTURE_HASH}}
**Validation Status**: {{VALIDATION_STATUS}}