#!/usr/bin/env python3
"""
Comprehensive Test Runner for Idea-to-PRD Skill
Executes all test scenarios and validates outputs
"""

import os
import sys
import json
import time
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import yaml

@dataclass
class TestResult:
    """Test execution result."""
    test_id: str
    name: str
    category: str
    status: str  # PASS, FAIL, WARNING, SKIP
    duration: float
    message: str
    details: Dict = None

@dataclass
class TestConfig:
    """Test configuration."""
    max_execution_time: int = 900  # 15 minutes
    max_memory_mb: int = 512
    workspace_root: str = "/workspaces/jlmaworkspace"
    output_dir: str = "test_outputs"

class SecurityValidator:
    """Security validation for test outputs."""

    DANGEROUS_PATTERNS = [
        r'password\s*[=:]\s*["\']?[^"\'\s]+',
        r'secret\s*[=:]\s*["\']?[^"\'\s]+',
        r'api[_-]?key\s*[=:]\s*["\']?[^"\'\s]+',
        r'token\s*[=:]\s*["\']?[^"\'\s]+',
        r'<script[^>]*>',
        r'javascript:',
        r'\$\{.*?\}',
        r'\{\{.*?\}\}',
    ]

    def validate_content(self, content: str, filename: str) -> List[str]:
        """Validate content for security issues."""
        import re
        issues = []

        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                issues.append(f"Dangerous pattern in {filename}: {pattern}")

        return issues

    def validate_file_permissions(self, filepath: str) -> List[str]:
        """Check file has secure permissions."""
        issues = []
        stat = os.stat(filepath)

        # Check if world-writable
        if stat.st_mode & 0o002:
            issues.append(f"World-writable file: {filepath}")

        # Check if executable when it shouldn't be
        if filepath.endswith(('.md', '.txt', '.json')) and stat.st_mode & 0o111:
            issues.append(f"Executable documentation file: {filepath}")

        return issues

class OutputValidator:
    """Validates generated outputs against expected structure."""

    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.security_validator = SecurityValidator()

    def validate_file_structure(self) -> Tuple[bool, List[str]]:
        """Validate expected file structure exists."""
        required_files = [
            "docs/PRD.md",
            "docs/executive-summary.md",
            "docs/ddd-strategic/bounded-contexts.md",
            "docs/ddd-strategic/context-map.md",
            "docs/architecture/adrs",
            "docs/architecture/c4-diagrams",
            "docs/ddd-tactical/aggregates.md",
            "docs/ddd-tactical/schema.sql",
            "docs/pseudocode/core-algorithms.md",
            "docs/validation/fitness-functions.md",
            "docs/validation/test-scenarios.md",
            "docs/completion/deployment-plan.md",
            ".ai-context/summary.json"
        ]

        issues = []

        for required_file in required_files:
            file_path = self.output_dir / required_file

            if required_file.endswith("/"):  # Directory
                if not file_path.is_dir():
                    issues.append(f"Missing directory: {required_file}")
            else:  # File
                if not file_path.exists():
                    issues.append(f"Missing file: {required_file}")

        return len(issues) == 0, issues

    def validate_content_quality(self) -> Tuple[bool, List[str]]:
        """Validate content quality and completeness."""
        issues = []

        # Check PRD.md
        prd_path = self.output_dir / "docs/PRD.md"
        if prd_path.exists():
            content = prd_path.read_text()

            # Check for placeholder content
            placeholders = ["TODO", "TBD", "FIXME", "[PLACEHOLDER]", "XXX"]
            for placeholder in placeholders:
                if placeholder in content:
                    issues.append(f"Placeholder content in PRD.md: {placeholder}")

            # Check minimum content length
            word_count = len(content.split())
            if word_count < 2000:
                issues.append(f"PRD.md too short: {word_count} words (minimum 2000)")

            # Check required sections
            required_sections = [
                "Executive Summary",
                "Product Overview",
                "Functional Requirements",
                "Non-Functional Requirements",
                "Success Metrics"
            ]

            for section in required_sections:
                if section not in content:
                    issues.append(f"Missing section in PRD.md: {section}")

        # Check ADRs
        adr_dir = self.output_dir / "docs/architecture/adrs"
        if adr_dir.exists():
            adr_files = list(adr_dir.glob("*.md"))
            if len(adr_files) < 5:
                issues.append(f"Insufficient ADRs: {len(adr_files)} (minimum 5)")

        # Check AI context
        ai_context_path = self.output_dir / ".ai-context/summary.json"
        if ai_context_path.exists():
            try:
                with open(ai_context_path) as f:
                    ai_data = json.load(f)

                required_keys = ["product_name", "description", "bounded_contexts", "key_features"]
                for key in required_keys:
                    if key not in ai_data:
                        issues.append(f"Missing key in AI context: {key}")

            except json.JSONDecodeError:
                issues.append("Invalid JSON in AI context file")

        return len(issues) == 0, issues

    def validate_security(self) -> Tuple[bool, List[str]]:
        """Validate security of generated content."""
        issues = []

        # Check all generated files
        for file_path in self.output_dir.rglob("*"):
            if file_path.is_file():
                # Check file permissions
                perm_issues = self.security_validator.validate_file_permissions(str(file_path))
                issues.extend(perm_issues)

                # Check content for security issues
                if file_path.suffix in ['.md', '.txt', '.json', '.sql']:
                    try:
                        content = file_path.read_text(encoding='utf-8')
                        content_issues = self.security_validator.validate_content(
                            content, str(file_path.relative_to(self.output_dir))
                        )
                        issues.extend(content_issues)
                    except UnicodeDecodeError:
                        issues.append(f"Binary content in text file: {file_path}")

        return len(issues) == 0, issues

class SkillTestRunner:
    """Main test runner for the idea2prd-manual skill."""

    def __init__(self, config: TestConfig):
        self.config = config
        self.results: List[TestResult] = []

    def load_test_inputs(self) -> List[Dict]:
        """Load test inputs from example-inputs.md."""
        # This is a simplified version - in practice, would parse the markdown
        # and extract YAML blocks
        test_inputs = []

        # Add some basic test cases
        test_inputs.extend([
            {
                'id': 'FUNC-001-1',
                'name': 'Simple E-commerce Problem',
                'category': 'functional',
                'type': 'problem',
                'input': 'Our small retail business needs inventory management.',
                'expected_pipeline': 'analyst',
                'expected_phases': 9
            },
            {
                'id': 'FUNC-001-2',
                'name': 'Task Management App Idea',
                'category': 'functional',
                'type': 'idea',
                'input': 'A task management app for remote teams with time zone awareness.',
                'expected_pipeline': 'prd',
                'expected_phases': 6
            },
            {
                'id': 'SEC-001-1',
                'name': 'SQL Injection Attack',
                'category': 'security',
                'type': 'attack',
                'input': "Our system needs database'; DROP TABLE users; --",
                'expected_behavior': 'input_sanitized'
            },
            {
                'id': 'EDGE-001-1',
                'name': 'Minimum Input',
                'category': 'edge_case',
                'type': 'minimal',
                'input': 'Productivity',
                'expected_behavior': 'request_elaboration'
            }
        ])

        return test_inputs

    def run_skill_test(self, test_input: Dict) -> TestResult:
        """Run a single skill test."""
        start_time = time.time()
        test_id = test_input['id']

        try:
            # Create isolated test directory
            with tempfile.TemporaryDirectory() as temp_dir:
                output_dir = Path(temp_dir) / "output"
                output_dir.mkdir()

                # Simulate skill execution (in practice, would call actual skill)
                success = self._simulate_skill_execution(test_input, output_dir)

                if success:
                    # Validate outputs
                    validator = OutputValidator(str(output_dir))

                    # Run all validations
                    structure_valid, structure_issues = validator.validate_file_structure()
                    quality_valid, quality_issues = validator.validate_content_quality()
                    security_valid, security_issues = validator.validate_security()

                    # Determine overall status
                    all_issues = structure_issues + quality_issues + security_issues

                    if not structure_valid:
                        status = "FAIL"
                        message = f"File structure validation failed: {len(structure_issues)} issues"
                    elif not security_valid:
                        status = "FAIL"
                        message = f"Security validation failed: {len(security_issues)} issues"
                    elif not quality_valid:
                        status = "WARNING"
                        message = f"Quality issues found: {len(quality_issues)} issues"
                    else:
                        status = "PASS"
                        message = "All validations passed"

                    details = {
                        "structure_issues": structure_issues,
                        "quality_issues": quality_issues,
                        "security_issues": security_issues
                    }
                else:
                    status = "FAIL"
                    message = "Skill execution failed"
                    details = {}

        except Exception as e:
            status = "FAIL"
            message = f"Test execution error: {str(e)}"
            details = {"error": str(e)}

        duration = time.time() - start_time

        return TestResult(
            test_id=test_id,
            name=test_input['name'],
            category=test_input['category'],
            status=status,
            duration=duration,
            message=message,
            details=details
        )

    def _simulate_skill_execution(self, test_input: Dict, output_dir: Path) -> bool:
        """Simulate skill execution (placeholder for actual skill call)."""
        # In practice, this would call the actual skill with the test input
        # For now, we'll create some mock output files

        try:
            # Create basic file structure
            docs_dir = output_dir / "docs"
            docs_dir.mkdir()

            # Create PRD.md
            prd_content = f"""# {test_input.get('name', 'Test Product')} - Product Requirements Document

## 1. Executive Summary
This is a test product generated from input: {test_input['input'][:100]}...

## 2. Product Overview
[Product overview content]

## 3. Functional Requirements
### 3.1 Core Features
- Feature 1: Core functionality
- Feature 2: User interface

### 3.2 Non-Functional Requirements
- Performance: Response time < 500ms
- Security: Authentication required

## 4. User Experience
[User experience details]

## 5. Technical Considerations
[Technical requirements]

## 6. Success Metrics
- User adoption rate
- Performance metrics

## 7. Timeline and Milestones
[Development timeline]

## 8. Risks and Assumptions
[Risk assessment]
"""

            (docs_dir / "PRD.md").write_text(prd_content)

            # Create other required directories and files
            (docs_dir / "executive-summary.md").write_text("# Executive Summary\nProduct overview...")

            # DDD Strategic
            strategic_dir = docs_dir / "ddd-strategic"
            strategic_dir.mkdir()
            (strategic_dir / "bounded-contexts.md").write_text("# Bounded Contexts\n...")
            (strategic_dir / "context-map.md").write_text("# Context Map\n...")

            # Architecture
            arch_dir = docs_dir / "architecture"
            arch_dir.mkdir()

            adrs_dir = arch_dir / "adrs"
            adrs_dir.mkdir()

            for i in range(1, 6):
                adr_content = f"""# ADR-{i:03d}: Test Decision {i}

## Status
Accepted

## Context
Test context for decision {i}

## Decision
We will use test approach {i}

## Rationale
This is the best approach because...

## Consequences
### Positive
- Benefit 1
- Benefit 2

### Negative
- Trade-off 1
"""
                (adrs_dir / f"{i:03d}-test-decision-{i}.md").write_text(adr_content)

            c4_dir = arch_dir / "c4-diagrams"
            c4_dir.mkdir()
            (c4_dir / "c4-context.md").write_text("# C4 Context Diagram\n...")

            # DDD Tactical
            tactical_dir = docs_dir / "ddd-tactical"
            tactical_dir.mkdir()
            (tactical_dir / "aggregates.md").write_text("# Domain Aggregates\n...")
            (tactical_dir / "schema.sql").write_text("-- Database Schema\nCREATE TABLE test_table ();")

            # Pseudocode
            pseudo_dir = docs_dir / "pseudocode"
            pseudo_dir.mkdir()
            (pseudo_dir / "core-algorithms.md").write_text("# Core Algorithms\n...")

            # Validation
            validation_dir = docs_dir / "validation"
            validation_dir.mkdir()
            (validation_dir / "fitness-functions.md").write_text("# Fitness Functions\n...")
            (validation_dir / "test-scenarios.md").write_text("# Test Scenarios\n...")

            # Completion
            completion_dir = docs_dir / "completion"
            completion_dir.mkdir()
            (completion_dir / "deployment-plan.md").write_text("# Deployment Plan\n...")

            # AI Context
            ai_context_dir = output_dir / ".ai-context"
            ai_context_dir.mkdir()

            ai_summary = {
                "product_name": test_input.get('name', 'Test Product'),
                "description": test_input['input'][:200],
                "bounded_contexts": [{"name": "Core", "type": "Core", "responsibility": "Main logic"}],
                "key_features": ["Feature 1", "Feature 2"],
                "tech_stack": {"backend": "Node.js", "database": "PostgreSQL"}
            }

            (ai_context_dir / "summary.json").write_text(json.dumps(ai_summary, indent=2))

            return True

        except Exception as e:
            print(f"Error simulating skill execution: {e}")
            return False

    def run_all_tests(self) -> Dict:
        """Run all test scenarios."""
        print("🚀 Starting Idea2PRD Skill Test Suite")
        print("=" * 50)

        test_inputs = self.load_test_inputs()

        for test_input in test_inputs:
            print(f"🧪 Running {test_input['id']}: {test_input['name']}")

            result = self.run_skill_test(test_input)
            self.results.append(result)

            status_emoji = {
                "PASS": "✅",
                "FAIL": "❌",
                "WARNING": "⚠️",
                "SKIP": "⏭️"
            }.get(result.status, "❓")

            print(f"   {status_emoji} {result.status} ({result.duration:.2f}s): {result.message}")

            if result.details and any(result.details.values()):
                for issue_type, issues in result.details.items():
                    if issues:
                        print(f"     {issue_type}: {len(issues)} issues")

        return self._generate_summary()

    def _generate_summary(self) -> Dict:
        """Generate test run summary."""
        total = len(self.results)
        passed = len([r for r in self.results if r.status == "PASS"])
        failed = len([r for r in self.results if r.status == "FAIL"])
        warnings = len([r for r in self.results if r.status == "WARNING"])
        skipped = len([r for r in self.results if r.status == "SKIP"])

        total_duration = sum(r.duration for r in self.results)

        summary = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "warnings": warnings,
            "skipped": skipped,
            "success_rate": (passed / total * 100) if total > 0 else 0,
            "total_duration": total_duration,
            "results": [
                {
                    "test_id": r.test_id,
                    "name": r.name,
                    "category": r.category,
                    "status": r.status,
                    "duration": r.duration,
                    "message": r.message
                }
                for r in self.results
            ]
        }

        print("\n" + "=" * 50)
        print("📊 Test Summary")
        print("=" * 50)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Warnings: {warnings}")
        print(f"Skipped: {skipped}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print(f"Total Duration: {total_duration:.2f}s")

        if failed > 0:
            print("\n❌ Failed Tests:")
            for result in self.results:
                if result.status == "FAIL":
                    print(f"   {result.test_id}: {result.message}")

        if warnings > 0:
            print("\n⚠️ Tests with Warnings:")
            for result in self.results:
                if result.status == "WARNING":
                    print(f"   {result.test_id}: {result.message}")

        return summary

def main():
    """Main entry point."""
    config = TestConfig()
    runner = SkillTestRunner(config)

    try:
        summary = runner.run_all_tests()

        # Save results
        results_file = "test-results.json"
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)

        print(f"\n📄 Results saved to: {results_file}")

        # Exit with appropriate code
        if summary['failed'] > 0:
            sys.exit(1)
        elif summary['warnings'] > 0:
            sys.exit(2)
        else:
            sys.exit(0)

    except KeyboardInterrupt:
        print("\n⏹️ Test run interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n💥 Test runner error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()