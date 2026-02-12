# Architecture Decision Record (ADR)

**ADR Number**: {{ADR_NUMBER|validate_number}}
**Title**: {{TITLE|sanitize|max_length:100}}
**Date**: {{DECISION_DATE|validate_date}}
**Status**: {{STATUS|validate_enum:Proposed,Accepted,Deprecated,Superseded}}
**Deciders**: {{DECIDERS|sanitize}}

---

## Security Classification
- **Classification**: {{SECURITY_LEVEL|default:Internal}}
- **Technical Sensitivity**: {{TECH_SENSITIVITY|validate_enum:Low,Medium,High}}
- **Business Impact**: {{BUSINESS_IMPACT|validate_enum:Low,Medium,High,Critical}}

---

## Context and Problem Statement

### Problem Description
{{PROBLEM_DESCRIPTION|sanitize|max_length:1000}}

### Decision Drivers
{{#each DECISION_DRIVERS}}
- **{{category|sanitize}}**: {{description|sanitize|max_length:200}}
  - Impact: {{impact|validate_enum:Low,Medium,High}}
  - Urgency: {{urgency|validate_enum:Low,Medium,High}}
{{/each}}

### Constraints
{{#each CONSTRAINTS}}
- **{{type|sanitize}}**: {{description|sanitize|max_length:150}}
  - Severity: {{severity|validate_enum:Soft,Hard}}
{{/each}}

---

## Considered Options

{{#each OPTIONS}}
### Option {{@index|add:1}}: {{name|sanitize}}

#### Description
{{description|sanitize|max_length:500}}

#### Pros
{{#each pros}}
- {{this|sanitize|max_length:100}}
{{/each}}

#### Cons
{{#each cons}}
- {{this|sanitize|max_length:100}}
{{/each}}

#### Technical Considerations
- **Complexity**: {{complexity|validate_enum:Low,Medium,High}}
- **Performance Impact**: {{performance_impact|sanitize}}
- **Security Implications**: {{security_implications|sanitize}}
- **Maintainability**: {{maintainability|validate_enum:Poor,Fair,Good,Excellent}}

#### Cost Analysis
- **Development Cost**: {{dev_cost|validate_currency}}
- **Operational Cost**: {{ops_cost|validate_currency}}/month
- **Training Cost**: {{training_cost|validate_currency}}
- **Total Cost of Ownership (3 years)**: {{tco|validate_currency}}

#### Risk Assessment
{{#each risks}}
- **{{risk|sanitize}}**: {{impact|validate_enum:Low,Medium,High}} impact, {{probability|validate_enum:Low,Medium,High}} probability
  - Mitigation: {{mitigation|sanitize|max_length:150}}
{{/each}}

---

{{/each}}

## Decision Outcome

### Chosen Option
**Option {{CHOSEN_OPTION|validate_number}}: {{CHOSEN_OPTION_NAME|sanitize}}**

### Rationale
{{DECISION_RATIONALE|sanitize|max_length:1000}}

### Decision Criteria Weighting
{{#each CRITERIA}}
- **{{criterion|sanitize}}**: {{weight|validate_percentage}} weight
  - Option scores: {{scores|sanitize}}
{{/each}}

### Expected Benefits
{{#each EXPECTED_BENEFITS}}
- **{{benefit|sanitize}}**: {{description|sanitize|max_length:150}}
  - Measurable outcome: {{metric|sanitize}}
  - Timeline: {{timeline|validate_time}}
{{/each}}

### Accepted Trade-offs
{{#each TRADE_OFFS}}
- **{{trade_off|sanitize}}**: {{description|sanitize|max_length:150}}
  - Impact level: {{impact|validate_enum:Low,Medium,High}}
{{/each}}

---

## Implementation Plan

### Phase 1: Preparation
- **Duration**: {{PREP_DURATION|validate_time}}
- **Resources**: {{PREP_RESOURCES|sanitize}}
- **Deliverables**: {{PREP_DELIVERABLES|sanitize}}

### Phase 2: Core Implementation
- **Duration**: {{IMPL_DURATION|validate_time}}
- **Resources**: {{IMPL_RESOURCES|sanitize}}
- **Critical Path**: {{CRITICAL_PATH|sanitize}}

### Phase 3: Validation & Rollout
- **Duration**: {{ROLLOUT_DURATION|validate_time}}
- **Success Metrics**: {{SUCCESS_METRICS|sanitize}}
- **Rollback Plan**: {{ROLLBACK_PLAN|sanitize}}

### Dependencies
{{#each DEPENDENCIES}}
- **{{dependency|sanitize}}**: {{status|validate_enum:Blocked,In Progress,Complete}}
  - Owner: {{owner|sanitize}}
  - Due Date: {{due_date|validate_date}}
{{/each}}

---

## Consequences

### Positive Consequences
{{#each POSITIVE_CONSEQUENCES}}
- **{{consequence|sanitize}}**: {{description|sanitize|max_length:200}}
  - Timeline: {{timeline|sanitize}}
  - Confidence: {{confidence|validate_percentage}}
{{/each}}

### Negative Consequences
{{#each NEGATIVE_CONSEQUENCES}}
- **{{consequence|sanitize}}**: {{description|sanitize|max_length:200}}
  - Mitigation: {{mitigation|sanitize|max_length:150}}
  - Timeline: {{timeline|sanitize}}
{{/each}}

### Technical Debt Impact
{{TECHNICAL_DEBT_IMPACT|sanitize|max_length:500}}

---

## Validation & Success Metrics

### Success Criteria
{{#each SUCCESS_CRITERIA}}
- **{{metric|sanitize}}**: {{target|sanitize}}
  - Measurement method: {{measurement|sanitize}}
  - Review date: {{review_date|validate_date}}
{{/each}}

### Key Performance Indicators (KPIs)
{{#each KPIS}}
- **{{kpi|sanitize}}**: {{target|sanitize}}
  - Current baseline: {{baseline|sanitize}}
  - Improvement target: {{improvement|sanitize}}
{{/each}}

### Validation Timeline
{{#each VALIDATION_MILESTONES}}
- **{{date|validate_date}}**: {{milestone|sanitize|max_length:100}}
{{/each}}

---

## Related Decisions

### Supersedes
{{#each SUPERSEDES}}
- [ADR-{{number|validate_number}}](./adr-{{number}}.md): {{title|sanitize}}
{{/each}}

### Influences
{{#each INFLUENCES}}
- [ADR-{{number|validate_number}}](./adr-{{number}}.md): {{title|sanitize}}
  - Relationship: {{relationship|sanitize}}
{{/each}}

### Related Requirements
{{#each RELATED_REQUIREMENTS}}
- **{{requirement|sanitize}}**: {{description|sanitize|max_length:150}}
{{/each}}

---

## Security Considerations

### Security Impact Assessment
{{SECURITY_IMPACT|sanitize|max_length:500}}

### Threat Model Changes
{{#each THREAT_MODEL_CHANGES}}
- **{{threat|sanitize}}**: {{impact|validate_enum:New,Modified,Removed}}
  - Risk level: {{risk_level|validate_enum:Low,Medium,High,Critical}}
  - Mitigation: {{mitigation|sanitize|max_length:150}}
{{/each}}

### Compliance Impact
{{#each COMPLIANCE_IMPACT}}
- **{{standard|sanitize}}**: {{impact|validate_enum:Positive,Negative,Neutral}}
  - Details: {{details|sanitize|max_length:200}}
{{/each}}

---

## Review and Updates

### Review Schedule
- **Next Review Date**: {{NEXT_REVIEW|validate_date}}
- **Review Owner**: {{REVIEW_OWNER|sanitize}}
- **Review Criteria**: {{REVIEW_CRITERIA|sanitize}}

### Update History
| Date | Version | Author | Changes |
|------|---------|--------|---------|
| {{UPDATE_DATE|validate_date}} | {{VERSION}} | {{AUTHOR|sanitize}} | {{CHANGES|sanitize}} |

### Stakeholder Approval
| Role | Name | Date | Status |
|------|------|------|--------|
| Architecture Review Board | {{ARB_REVIEWER|sanitize}} | {{ARB_DATE|validate_date}} | {{ARB_STATUS|validate_enum:Pending,Approved,Rejected}} |
| Security Review | {{SEC_REVIEWER|sanitize}} | {{SEC_DATE|validate_date}} | {{SEC_STATUS|validate_enum:Pending,Approved,Rejected}} |
| Technical Lead | {{TECH_LEAD|sanitize}} | {{TECH_DATE|validate_date}} | {{TECH_STATUS|validate_enum:Pending,Approved,Rejected}} |

---

## References

### Documentation
{{#each DOCUMENTATION_REFS}}
- [{{title|sanitize}}]({{url|validate_url}})
{{/each}}

### Standards and Guidelines
{{#each STANDARDS_REFS}}
- **{{standard|sanitize}}**: {{description|sanitize|max_length:100}}
{{/each}}

### Research and Analysis
{{#each RESEARCH_REFS}}
- [{{title|sanitize}}]({{url|validate_url}}) - {{description|sanitize|max_length:100}}
{{/each}}

---

**ADR Generated**: {{GENERATION_TIMESTAMP}}
**Generator**: Idea-to-PRD Skill v{{SKILL_VERSION}}
**Document Hash**: {{DOCUMENT_HASH}}
**Last Modified**: {{LAST_MODIFIED|validate_date}}