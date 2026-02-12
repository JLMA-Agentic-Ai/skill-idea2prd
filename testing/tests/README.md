# Testing Framework for Secure Idea-to-PRD Skill

## Overview

This comprehensive testing framework validates the security, functionality, and quality of the idea2prd-manual skill across all phases of execution.

## Framework Structure

```
tests/
├── README.md                    # This file - testing framework overview
├── test-scenarios.md           # Comprehensive test case definitions
├── security-tests.md           # Security validation documentation
├── example-inputs.md           # Test input data and scenarios
├── expected-outputs.md         # Output validation criteria
├── test-runner.py              # Main Python test execution engine
├── security-validation.py     # Security-specific validation tools
├── run-all-tests.sh           # Comprehensive test suite runner
├── test_outputs/              # Generated test execution results
└── reports/                   # Test reports and analysis
```

## Test Categories

### 1. Security Testing (SEC-xxx)
- **Input Validation**: SQL injection, XSS, command injection prevention
- **Path Traversal**: Directory traversal attack prevention
- **Template Security**: Template injection prevention
- **File Security**: Secure file operations and permissions
- **Resource Protection**: DoS attack prevention

### 2. Functional Testing (FUNC-xxx)
- **End-to-End Pipeline**: Complete skill execution validation
- **Checkpoint System**: Pause/resume functionality
- **Output Generation**: Document completeness and accuracy
- **Error Handling**: Graceful error recovery

### 3. Edge Case Testing (EDGE-xxx)
- **Boundary Values**: Minimum/maximum input sizes
- **Malformed Inputs**: Invalid format handling
- **Unicode Support**: International character handling
- **Concurrent Operations**: Multi-user safety

### 4. Performance Testing (PERF-xxx)
- **Execution Time**: Phase timing validation
- **Memory Usage**: Resource consumption monitoring
- **Output Size**: Generated file size limits
- **Scalability**: Load handling capacity

### 5. Integration Testing (INT-xxx)
- **External Skills**: Integration with explore, goap-research, problem-solver
- **File System**: Safe file operations within workspace
- **Pipeline Routing**: Correct problem vs. idea detection

## Quick Start

### Run All Tests
```bash
./run-all-tests.sh
```

### Run Specific Test Categories
```bash
# Security tests only
python3 security-validation.py

# Functional tests only
python3 test-runner.py

# Custom test execution
./run-all-tests.sh --category security
```

## Test Execution

### Prerequisites
- Python 3.8+
- Required packages: `psutil`, `html`, `urllib.parse`
- Workspace access: `/workspaces/jlmaworkspace/`
- Skill file: `../idea2prd-manual.skill`

### Environment Setup
```bash
# Install required packages
pip install psutil

# Set permissions
chmod +x run-all-tests.sh

# Verify workspace access
ls -la /workspaces/jlmaworkspace/
```

### Test Execution Modes

#### 1. Comprehensive Testing
```bash
# Run all test categories with detailed reporting
./run-all-tests.sh

# Expected output:
# - Security validation results
# - Functional test outcomes
# - Performance metrics
# - Integration test results
# - Consolidated report generation
```

#### 2. Security-Only Testing
```bash
# Focus on security validation
python3 security-validation.py

# Tests include:
# - Input sanitization validation
# - Path traversal prevention
# - Output encoding verification
# - File permission checks
```

#### 3. Development Testing
```bash
# Quick functional validation during development
python3 test-runner.py

# Covers:
# - Basic pipeline execution
# - Output structure validation
# - Content quality checks
```

## Security Testing Details

### Input Attack Vectors

The framework tests against these attack patterns:

```yaml
SQL Injection:
  - "'; DROP TABLE users; --"
  - "UNION SELECT * FROM sensitive_data"
  - "OR 1=1"

Command Injection:
  - "; rm -rf /"
  - "| cat /etc/passwd"
  - "$(malicious_command)"

Template Injection:
  - "{{7*7}}"
  - "${process.env.SECRET}"
  - "<%=system('whoami')%>"

XSS Attacks:
  - "<script>alert('xss')</script>"
  - "javascript:void(0)"
  - "<img src=x onerror=alert(1)>"

Path Traversal:
  - "../../../etc/passwd"
  - "..%2F..%2F..%2Fetc%2Fpasswd"
  - "..\\..\\windows\\system32"
```

### Security Validation Process

1. **Input Analysis**: Scan all user inputs for malicious patterns
2. **Path Validation**: Ensure file operations stay within workspace
3. **Content Scanning**: Check generated files for sensitive data
4. **Permission Verification**: Validate secure file permissions
5. **Output Encoding**: Verify proper escaping of dynamic content

## Functional Testing Scenarios

### Test Input Categories

#### Valid Problems (Analyst Pipeline)
- Business process inefficiencies
- Technical performance issues
- Security vulnerabilities
- Customer service challenges

#### Valid Ideas (PRD Pipeline)
- Software product concepts
- AI/ML platform ideas
- IoT device specifications
- Mobile application features

#### Edge Cases
- Minimum input (single words)
- Maximum input (10,000+ characters)
- Unicode and multi-language content
- Malformed data structures

### Expected Output Validation

Each test validates these output components:

```
✅ PRD.md - Product Requirements Document
✅ executive-summary.md - Executive overview
✅ ddd-strategic/ - Domain-driven design strategy
✅ architecture/ - ADRs and C4 diagrams
✅ ddd-tactical/ - Domain model implementation
✅ pseudocode/ - Algorithm specifications
✅ validation/ - Test scenarios and fitness functions
✅ completion/ - Deployment and CI/CD plans
✅ .ai-context/ - Structured AI context data
```

## Performance Benchmarks

### Target Performance Metrics

| Phase | Target Time | Max Acceptable | Memory Limit |
|-------|-------------|---------------|--------------|
| Input Detection | < 1s | 3s | 50MB |
| Problem Analysis | < 120s | 300s | 200MB |
| Requirements | < 60s | 120s | 150MB |
| Architecture | < 120s | 240s | 200MB |
| Implementation | < 90s | 180s | 180MB |
| Validation | < 30s | 60s | 100MB |
| **Total Pipeline** | **< 15min** | **20min** | **512MB** |

### Performance Test Execution

```bash
# Monitor resource usage during test execution
./run-all-tests.sh --monitor-performance

# Generate performance report
./run-all-tests.sh --performance-only

# Stress test with large inputs
./run-all-tests.sh --stress-test
```

## Test Result Analysis

### Success Criteria

| Category | Requirement | Validation |
|----------|-------------|------------|
| **Security** | No critical/high vulnerabilities | 100% pass rate |
| **Functionality** | All core features working | 95% pass rate |
| **Performance** | Within acceptable limits | 90% within targets |
| **Quality** | Complete, accurate outputs | 95% quality score |
| **Integration** | External dependencies work | 100% connectivity |

### Failure Analysis

When tests fail, the framework provides:

1. **Detailed Error Logs**: Specific failure reasons and stack traces
2. **Security Findings**: Categorized vulnerabilities with remediation advice
3. **Performance Metrics**: Resource usage and timing analysis
4. **Quality Reports**: Content completeness and accuracy assessment
5. **Recommendations**: Specific improvement suggestions

## Continuous Integration Integration

### CI/CD Pipeline Integration

```yaml
# .github/workflows/test-skill.yml
name: Test Idea2PRD Skill

on: [push, pull_request]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Security Tests
        run: |
          cd tests/
          python3 security-validation.py
        env:
          WORKSPACE_ROOT: ${{ github.workspace }}

  functional-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Functional Tests
        run: |
          cd tests/
          python3 test-runner.py
        env:
          WORKSPACE_ROOT: ${{ github.workspace }}

  comprehensive-tests:
    runs-on: ubuntu-latest
    needs: [security-tests, functional-tests]
    steps:
      - uses: actions/checkout@v3
      - name: Run All Tests
        run: |
          cd tests/
          ./run-all-tests.sh
        env:
          WORKSPACE_ROOT: ${{ github.workspace }}
```

### Quality Gates

```bash
# Pre-commit hooks
#!/bin/bash
# .git/hooks/pre-commit

cd tests/
if ! python3 security-validation.py; then
    echo "❌ Security tests failed - commit blocked"
    exit 1
fi

echo "✅ Security tests passed - commit allowed"
exit 0
```

## Test Data Management

### Test Input Sources

1. **Synthetic Data**: Generated test cases covering edge conditions
2. **Real-world Examples**: Anonymized customer inputs and scenarios
3. **Attack Vectors**: Known security exploit patterns and payloads
4. **Performance Data**: Large datasets for stress testing

### Data Privacy and Security

- All test data is sanitized and contains no real personal information
- Security test payloads are contained and cannot cause actual harm
- Test outputs are automatically cleaned after execution
- No sensitive information is logged or persisted

## Troubleshooting

### Common Issues and Solutions

#### Test Execution Failures

```bash
# Permission issues
chmod +x run-all-tests.sh
sudo chown -R $(whoami) /workspaces/jlmaworkspace/

# Python dependency issues
pip install -r requirements.txt
python3 -m pip install --upgrade pip

# Workspace access issues
export WORKSPACE_ROOT="/workspaces/jlmaworkspace"
mkdir -p $WORKSPACE_ROOT/new_projects/claude-skill-idea_to_PRD/tests/
```

#### Security Test False Positives

```python
# Whitelist safe patterns in security-validation.py
SAFE_PATTERNS = [
    'example.com',           # Example domains
    'placeholder_password',  # Obvious placeholders
    'test_api_key_123',     # Test credentials
]
```

#### Performance Test Timeouts

```bash
# Increase timeout limits
export TEST_TIMEOUT=1800  # 30 minutes
export MAX_MEMORY=1024    # 1GB

# Run with performance monitoring
./run-all-tests.sh --monitor --verbose
```

### Debug Mode Execution

```bash
# Enable detailed logging
DEBUG=1 ./run-all-tests.sh

# Run individual test components
python3 test-runner.py --debug --test-id FUNC-001-1
python3 security-validation.py --verbose --show-details
```

## Contributing to the Test Suite

### Adding New Test Cases

1. **Define Test Scenario**: Add to `test-scenarios.md`
2. **Create Test Input**: Add to `example-inputs.md`
3. **Specify Expected Output**: Update `expected-outputs.md`
4. **Implement Test Logic**: Modify `test-runner.py`
5. **Update Documentation**: Update this README

### Test Case Template

```python
def test_new_scenario(self):
    """Test description and purpose."""
    test_input = {
        'id': 'NEW-001',
        'name': 'New Test Scenario',
        'category': 'functional',
        'input': 'Test input data',
        'expected_behavior': 'Expected result'
    }

    result = self.run_skill_test(test_input)

    self.assertEqual(result.status, 'PASS')
    self.assertIn('expected_output', result.details)
```

### Security Test Development

When adding security tests:

1. **Research Attack Vectors**: Study current security threats
2. **Create Safe Payloads**: Ensure test attacks are contained
3. **Validate Defenses**: Verify protection mechanisms work
4. **Document Findings**: Update security documentation
5. **Test Remediation**: Ensure fixes prevent the attack

## Support and Documentation

### Additional Resources

- **Test Scenarios**: Complete test case definitions in `test-scenarios.md`
- **Security Guide**: Detailed security testing in `security-tests.md`
- **Input Examples**: Comprehensive test inputs in `example-inputs.md`
- **Output Validation**: Expected results in `expected-outputs.md`

### Getting Help

1. **Check Logs**: Review detailed logs in `test_outputs/`
2. **Run Debug Mode**: Use `--debug` flags for detailed output
3. **Review Documentation**: Check all markdown files for guidance
4. **Examine Test Results**: Analyze JSON reports in `reports/`

This comprehensive testing framework ensures the idea2prd-manual skill operates securely, reliably, and efficiently across all supported scenarios and use cases.