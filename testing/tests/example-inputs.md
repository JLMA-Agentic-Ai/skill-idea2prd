# Example Test Inputs for Idea-to-PRD Skill

## Overview

This document provides a comprehensive collection of test inputs for validating the idea2prd-manual skill across various scenarios, edge cases, and security attack vectors.

## Input Categories

### 1. Valid Problem Inputs

#### 1.1 Simple Business Problems

**TEST-INPUT-001**: Basic E-commerce Problem
```yaml
type: problem
category: simple_business
input: |
  Our small retail business is struggling to manage inventory manually.
  We have about 200 products and constantly run out of stock on popular items
  while overstocking slow-moving products. This leads to lost sales and
  increased storage costs. We need a solution to track inventory levels
  and automate reorder processes.
context:
  business_size: "Small (5-10 employees)"
  industry: "Retail"
  budget: "Limited ($5,000-$15,000)"
  timeline: "3-6 months"
expected_pipeline: "Analyst → Problem Solver → PRD"
expected_phases: 9
```

**TEST-INPUT-002**: Customer Service Challenge
```yaml
type: problem
category: simple_business
input: |
  We receive 100+ customer support emails daily but have only 2 support staff.
  Response times are slow (24-48 hours) and customers are complaining.
  Many questions are repetitive and could be automated. How can we improve
  our customer support efficiency and response times?
context:
  team_size: "2 support staff"
  volume: "100+ emails/day"
  current_response_time: "24-48 hours"
  target_response_time: "< 4 hours"
expected_pipeline: "Analyst → Problem Solver → PRD"
expected_phases: 9
```

#### 1.2 Technical Problems

**TEST-INPUT-003**: Performance Issue
```yaml
type: problem
category: technical
input: |
  Our web application becomes extremely slow when we have more than 50
  concurrent users. Page load times go from 2 seconds to 15+ seconds.
  Database queries seem to be the bottleneck, but we're not sure how to
  optimize them. Users are abandoning the site due to poor performance.
context:
  current_users: "50 concurrent max"
  target_users: "500 concurrent"
  current_load_time: "15+ seconds under load"
  target_load_time: "< 3 seconds"
  tech_stack: "Node.js, PostgreSQL, React"
expected_pipeline: "Analyst → Problem Solver → PRD"
expected_phases: 9
```

**TEST-INPUT-004**: Security Concern
```yaml
type: problem
category: technical_security
input: |
  We've had two security incidents in the past month where user accounts
  were compromised. Our current authentication system only uses passwords
  and we suspect weak passwords are the issue. We need to implement
  better security measures to protect our users' data and accounts.
context:
  incidents: "2 in past month"
  current_auth: "Password only"
  user_count: "5,000 active users"
  compliance_required: "GDPR, SOC2"
expected_pipeline: "Analyst → Problem Solver → PRD"
expected_phases: 9
```

### 2. Valid Idea Inputs

#### 2.1 Software Product Ideas

**TEST-INPUT-005**: Task Management App
```yaml
type: idea
category: software_product
input: |
  A task management app specifically designed for remote teams working
  across different time zones. Features include:
  - Asynchronous task assignment and updates
  - Time zone aware scheduling
  - Integration with Slack and Microsoft Teams
  - Real-time collaboration on task details
  - Automated progress reporting for managers

  Target users: Remote teams of 10-50 people
  Monetization: SaaS subscription model ($5/user/month)
context:
  target_market: "Remote teams"
  team_size: "10-50 people"
  pricing_model: "SaaS subscription"
  key_differentiator: "Time zone awareness"
expected_pipeline: "PRD only"
expected_phases: 6
```

**TEST-INPUT-006**: AI-Powered Analytics Platform
```yaml
type: idea
category: ai_product
input: |
  An AI analytics platform that automatically analyzes customer behavior
  data and provides actionable insights for e-commerce businesses.

  Core features:
  - Automated customer segmentation
  - Predictive lifetime value calculation
  - Personalized marketing recommendations
  - Churn prediction and prevention strategies
  - Real-time dashboard with AI-generated insights

  Target market: Small to medium e-commerce businesses ($1M-$50M revenue)
  Business model: Tiered SaaS pricing based on monthly revenue
context:
  target_market: "SMB e-commerce"
  revenue_range: "$1M-$50M"
  key_technology: "Machine Learning"
  competitive_advantage: "Automated insights"
expected_pipeline: "PRD only"
expected_phases: 6
```

#### 2.2 Physical Product Ideas

**TEST-INPUT-007**: Smart Home Device
```yaml
type: idea
category: iot_product
input: |
  A smart air quality monitor that not only measures air quality but
  also automatically controls connected air purifiers, HVAC systems,
  and smart windows. Uses AI to learn patterns and optimize air quality
  throughout the day.

  Features:
  - Multi-sensor air quality monitoring (PM2.5, CO2, VOCs, humidity)
  - Integration with existing smart home ecosystems
  - Mobile app with real-time alerts and historical data
  - Automated control of air purification devices
  - Energy efficiency optimization

  Target customers: Health-conscious homeowners with smart home setups
context:
  product_type: "IoT device"
  target_market: "Health-conscious homeowners"
  integration: "Smart home ecosystems"
  key_feature: "Automated optimization"
expected_pipeline: "PRD only"
expected_phases: 6
```

### 3. Ambiguous Inputs (Require Clarification)

#### 3.1 Unclear Problem vs Idea

**TEST-INPUT-008**: Ambiguous Input
```yaml
type: ambiguous
category: unclear_type
input: |
  Something to help restaurants manage their operations better with technology.
context:
  clarity_level: "Very low"
  missing_info: "Specific problem, solution type, scope"
expected_behavior: "Request clarification"
expected_question: "Is this a specific problem you're facing or do you have a product idea in mind?"
```

**TEST-INPUT-009**: Vague Description
```yaml
type: ambiguous
category: insufficient_detail
input: |
  Make work more efficient for teams
context:
  clarity_level: "Low"
  missing_info: "Industry, team size, specific inefficiencies"
expected_behavior: "Request clarification"
expected_question: "Could you describe the specific inefficiencies your team is facing?"
```

### 4. Edge Cases

#### 4.1 Minimum Input

**TEST-INPUT-010**: Single Word
```yaml
type: edge_case
category: minimum_input
input: "Productivity"
context:
  word_count: 1
  character_count: 12
expected_behavior: "Request elaboration"
expected_response: "Could you provide more details about this productivity-related idea or problem?"
```

#### 4.2 Maximum Input

**TEST-INPUT-011**: Large Input
```yaml
type: edge_case
category: maximum_input
input: |
  [10,000 character detailed business case with extensive background,
  market analysis, technical requirements, user stories, acceptance criteria,
  competitive analysis, financial projections, risk assessment, timeline,
  team structure, technology stack preferences, integration requirements,
  compliance needs, scalability concerns, and implementation strategy...]
context:
  character_count: 10000
  word_count: ~1666
  complexity: "Very high"
expected_behavior: "Process successfully with chunking"
expected_response: "Comprehensive analysis and structured breakdown"
```

#### 4.3 Multi-language Input

**TEST-INPUT-012**: Unicode and Multi-language
```yaml
type: edge_case
category: internationalization
input: |
  我们需要一个客户管理系统 for our international business. The system should
  handle múltiples idiomas and support العربية text as well.
  こんにちは世界 - this needs to work globally! 🌍📱💼

  Features needed:
  - Multi-language support (中文, English, Español, العربية, 日本語)
  - Unicode character handling
  - Right-to-left text support
  - Emoji support in user content
context:
  languages: ["Chinese", "English", "Spanish", "Arabic", "Japanese"]
  special_chars: "Emojis, RTL text"
  encoding: "UTF-8"
expected_behavior: "Handle properly with UTF-8 encoding"
```

#### 4.4 Empty and Null Inputs

**TEST-INPUT-013**: Empty Input
```yaml
type: edge_case
category: empty_input
input: ""
context:
  length: 0
expected_behavior: "Validation error"
expected_response: "Input cannot be empty. Please describe your problem or idea."
```

**TEST-INPUT-014**: Whitespace Only
```yaml
type: edge_case
category: whitespace_input
input: "   \n\t   \r\n   "
context:
  visible_chars: 0
  whitespace_chars: 12
expected_behavior: "Treated as empty"
expected_response: "Input appears to be empty. Please provide a description."
```

### 5. Security Attack Inputs

#### 5.1 Injection Attacks

**TEST-INPUT-015**: SQL Injection
```yaml
type: security_test
category: sql_injection
input: |
  Our company needs a database solution'; DROP TABLE users; SELECT * FROM sensitive_data WHERE '1'='1
context:
  attack_type: "SQL Injection"
  danger_level: "Critical"
expected_behavior: "Input sanitized, dangerous patterns removed"
expected_result: "Literal text processing, no code execution"
```

**TEST-INPUT-016**: Template Injection
```yaml
type: security_test
category: template_injection
input: |
  We need a system that can handle {{7*7}} calculations and
  ${process.env.SECRET_KEY} configurations for our {{constructor.constructor('return process')().env}} environment.
context:
  attack_type: "Template Injection"
  danger_level: "High"
expected_behavior: "Template syntax treated as literal text"
expected_result: "No template evaluation, escaped output"
```

**TEST-INPUT-017**: XSS Attempt
```yaml
type: security_test
category: xss_injection
input: |
  <script>alert('XSS')</script>
  <img src=x onerror=alert('XSS')>
  javascript:void(0)
  Our web application needs to handle user-generated content safely.
context:
  attack_type: "Cross-Site Scripting"
  danger_level: "High"
expected_behavior: "HTML tags escaped or stripped"
expected_result: "Safe text output, no script execution"
```

#### 5.2 Path Traversal Attacks

**TEST-INPUT-018**: Directory Traversal
```yaml
type: security_test
category: path_traversal
input: |
  We need to analyze the file at ../../../etc/passwd and also check
  ..\\..\\windows\\system32\\config\\sam for our security audit project.
context:
  attack_type: "Path Traversal"
  danger_level: "Critical"
expected_behavior: "Paths normalized and contained"
expected_result: "No access outside workspace boundary"
```

**TEST-INPUT-019**: URL Encoded Traversal
```yaml
type: security_test
category: encoded_traversal
input: |
  Please check the configuration in %2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
  for our system setup requirements.
context:
  attack_type: "URL Encoded Path Traversal"
  danger_level: "High"
expected_behavior: "URL decoding and path sanitization"
expected_result: "Contained within workspace"
```

#### 5.3 Resource Exhaustion

**TEST-INPUT-020**: Large Payload DoS
```yaml
type: security_test
category: dos_attack
input: "A" * (5 * 1024 * 1024)  # 5MB of 'A' characters
context:
  attack_type: "Resource Exhaustion"
  size: "5MB"
  danger_level: "Medium"
expected_behavior: "Size limit enforcement"
expected_result: "Input rejected with size limit error"
```

**TEST-INPUT-021**: Complex Regex DoS
```yaml
type: security_test
category: regex_dos
input: |
  (a+)+b followed by many a's: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaac
  This pattern can cause catastrophic backtracking in poorly designed regex engines.
context:
  attack_type: "ReDoS (Regular Expression DoS)"
  danger_level: "Medium"
expected_behavior: "Regex timeout or optimized patterns"
expected_result: "Processing completes within time limits"
```

### 6. Malformed Inputs

#### 6.1 JSON-like Malformed Data

**TEST-INPUT-022**: Broken JSON Structure
```yaml
type: malformed_input
category: broken_json
input: |
  {
    "product": "Task Manager",
    "features": [
      "Real-time sync",
      "Team collaboration"
    // missing closing bracket and quote
context:
  format: "Pseudo-JSON"
  malformation: "Syntax errors"
expected_behavior: "Parse as plain text, ignore JSON structure"
expected_result: "Content extracted and processed as description"
```

#### 6.2 Markdown Malformed

**TEST-INPUT-023**: Broken Markdown
```yaml
type: malformed_input
category: broken_markdown
input: |
  # Product Idea

  ## Features
  - [ Incomplete checkbox
  - **Bold without closing
  - [Link without closing](

  ```code block without closing
  function example() {
    return "unclosed";

  | Table | With |
  | Broken | Columns
context:
  format: "Malformed Markdown"
  issues: ["Unclosed elements", "Syntax errors"]
expected_behavior: "Graceful parsing with error tolerance"
expected_result: "Best-effort content extraction"
```

#### 6.3 Mixed Formats

**TEST-INPUT-024**: Multiple Format Mix
```yaml
type: malformed_input
category: format_mix
input: |
  <xml><root>
  # Markdown Header

  {"json": "object",
  "incomplete": true

  Regular text content mixed with
  **markdown** and <html>tags</html>

  </root>
context:
  formats: ["XML", "Markdown", "JSON", "HTML", "Plain text"]
  complexity: "Very high"
expected_behavior: "Extract text content, ignore formatting"
expected_result: "Clean text processing"
```

### 7. Business Domain Specific Inputs

#### 7.1 Healthcare Domain

**TEST-INPUT-025**: Healthcare Problem
```yaml
type: domain_specific
category: healthcare
input: |
  Our medical practice struggles with patient appointment scheduling.
  We have 5 doctors with different specialties and availability patterns.
  Patients often need follow-up appointments at specific intervals.
  We also need to handle emergency slots and manage waiting lists.
  HIPAA compliance is critical for any solution.
context:
  domain: "Healthcare"
  compliance: "HIPAA"
  users: "Medical practice"
  complexity: "High regulatory requirements"
expected_behavior: "Domain-aware analysis with compliance considerations"
expected_outputs: "HIPAA-compliant architecture and security requirements"
```

#### 7.2 Financial Services

**TEST-INPUT-026**: FinTech Idea
```yaml
type: domain_specific
category: financial
input: |
  A mobile app for teenagers to learn financial literacy through
  gamified experiences. Parents can monitor progress and set spending
  limits on connected debit cards. Features include:

  - Educational games about budgeting and saving
  - Real-world spending challenges
  - Parent dashboard and controls
  - Integration with youth banking accounts
  - Reward system for good financial habits
context:
  domain: "Financial Services"
  target_age: "13-17 years"
  compliance: "COPPA, PCI DSS"
  regulatory_complexity: "High"
expected_behavior: "Financial compliance awareness in design"
expected_outputs: "PCI DSS compliant architecture, age verification"
```

#### 7.3 Education Technology

**TEST-INPUT-027**: EdTech Platform
```yaml
type: domain_specific
category: education
input: |
  An adaptive learning platform that personalizes math education
  for middle school students (grades 6-8). The system should:

  - Assess student skill levels automatically
  - Create personalized learning paths
  - Provide real-time feedback and hints
  - Track progress for teachers and parents
  - Support both classroom and home use
  - Include accessibility features for diverse learners
context:
  domain: "Education Technology"
  age_group: "11-14 years"
  compliance: "FERPA, COPPA"
  accessibility: "Required (ADA compliance)"
expected_behavior: "Educational domain expertise and privacy focus"
expected_outputs: "FERPA-compliant data handling, accessibility requirements"
```

### 8. Performance Test Inputs

#### 8.1 Complex Multi-part Input

**TEST-INPUT-028**: Enterprise System Requirements
```yaml
type: performance_test
category: complex_enterprise
input: |
  [Large, detailed enterprise requirement document with multiple stakeholders,
  complex integrations, detailed user stories, extensive acceptance criteria,
  technical constraints, compliance requirements, scalability needs,
  security specifications, and international considerations - approximately 5,000 words]
context:
  complexity: "Enterprise-level"
  word_count: ~5000
  stakeholders: "Multiple departments"
  integrations: "10+ systems"
expected_performance:
  analysis_time: "< 180 seconds"
  memory_usage: "< 256MB"
  output_completeness: "> 95%"
```

#### 8.2 Rapid Sequential Inputs

**TEST-INPUT-029**: Batch Processing Test
```yaml
type: performance_test
category: batch_processing
inputs:
  - "Quick e-commerce inventory solution"
  - "Customer service chatbot for retail"
  - "Employee scheduling app for restaurants"
  - "Expense tracking for small business"
  - "Social media management tool"
context:
  input_count: 5
  processing_type: "Sequential"
  expected_behavior: "Handle each input independently"
  performance_target: "< 60 seconds per input"
```

## Input Validation Criteria

### Security Validation

For each input, the system should validate:

1. **Size Limits**: No input exceeds 1MB
2. **Character Encoding**: Proper UTF-8 handling
3. **Malicious Patterns**: No code injection attempts succeed
4. **Resource Usage**: Processing stays within memory/time limits

### Functional Validation

For valid inputs, verify:

1. **Type Detection**: Correct problem vs. idea classification
2. **Pipeline Selection**: Appropriate analyst or PRD pipeline
3. **Checkpoint Flow**: Proper pause/resume at checkpoints
4. **Output Generation**: Complete and accurate documentation

### Quality Validation

For all outputs, ensure:

1. **Completeness**: All required sections generated
2. **Accuracy**: Content matches input requirements
3. **Format**: Proper markdown and file structure
4. **Security**: No sensitive information leaked

## Test Input Categories Summary

| Category | Count | Purpose | Security Level |
|----------|-------|---------|---------------|
| Valid Problems | 4 | Functional testing | Standard |
| Valid Ideas | 3 | Pipeline testing | Standard |
| Ambiguous | 2 | Clarification flow | Standard |
| Edge Cases | 5 | Boundary testing | Standard |
| Security Attacks | 7 | Security validation | High |
| Malformed | 3 | Error handling | Standard |
| Domain Specific | 3 | Industry testing | Standard |
| Performance | 2 | Load testing | Standard |
| **Total** | **29** | **Comprehensive** | **Mixed** |

These test inputs provide comprehensive coverage for validating the idea2prd-manual skill across security, functionality, performance, and quality dimensions.