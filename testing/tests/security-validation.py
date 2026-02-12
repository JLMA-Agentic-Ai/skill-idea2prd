#!/usr/bin/env python3
"""
Security Validation Suite for Idea2PRD Skill
Comprehensive security testing and validation
"""

import re
import os
import json
import hashlib
import subprocess
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from urllib.parse import unquote
import html

@dataclass
class SecurityFinding:
    """Security finding/vulnerability."""
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    category: str  # injection, traversal, xss, etc.
    description: str
    file_path: str
    line_number: Optional[int] = None
    evidence: Optional[str] = None
    recommendation: Optional[str] = None

class InputSanitizer:
    """Input sanitization and validation."""

    # Dangerous patterns that should be blocked/sanitized
    DANGEROUS_PATTERNS = {
        'sql_injection': [
            r"';.*drop\s+table",
            r"';.*delete\s+from",
            r"';.*update\s+.*set",
            r"union\s+select",
            r"or\s+1\s*=\s*1",
            r"and\s+1\s*=\s*1"
        ],
        'command_injection': [
            r";\s*(rm|del|format|shutdown)",
            r"\|\s*(rm|del|format)",
            r"&&\s*(rm|del|format)",
            r"`.*`",
            r"\$\(.*\)"
        ],
        'template_injection': [
            r"\{\{.*?\}\}",
            r"\$\{.*?\}",
            r"<%.*?%>",
            r"\[\[.*?\]\]"
        ],
        'xss': [
            r"<script[^>]*>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe[^>]*>",
            r"<object[^>]*>",
            r"<embed[^>]*>"
        ],
        'path_traversal': [
            r"\.\./",
            r"\.\.\\",
            r"%2e%2e%2f",
            r"%2e%2e%5c",
            r"..%2f",
            r"..%5c"
        ]
    }

    def analyze_input(self, text: str) -> List[SecurityFinding]:
        """Analyze input for security threats."""
        findings = []

        for category, patterns in self.DANGEROUS_PATTERNS.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    severity = self._get_severity(category)
                    finding = SecurityFinding(
                        severity=severity,
                        category=category,
                        description=f"Potential {category} pattern detected",
                        file_path="<input>",
                        evidence=match.group(0),
                        recommendation=self._get_recommendation(category)
                    )
                    findings.append(finding)

        return findings

    def sanitize_input(self, text: str) -> str:
        """Sanitize input text for safe processing."""
        if not text:
            return ""

        # Normalize unicode
        text = text.encode('unicode_escape').decode('ascii', errors='ignore')

        # URL decode (handle multiple levels)
        for _ in range(3):
            decoded = unquote(text)
            if decoded == text:
                break
            text = decoded

        # Remove null bytes
        text = text.replace('\x00', '')

        # HTML escape dangerous characters
        text = html.escape(text, quote=True)

        # Remove/neutralize dangerous patterns
        for category, patterns in self.DANGEROUS_PATTERNS.items():
            for pattern in patterns:
                text = re.sub(pattern, '[FILTERED]', text, flags=re.IGNORECASE)

        # Limit length to prevent DoS
        if len(text) > 10000:
            text = text[:10000] + "... [TRUNCATED]"

        return text

    def _get_severity(self, category: str) -> str:
        """Get severity level for vulnerability category."""
        severity_map = {
            'sql_injection': 'CRITICAL',
            'command_injection': 'CRITICAL',
            'template_injection': 'HIGH',
            'xss': 'HIGH',
            'path_traversal': 'HIGH',
            'file_upload': 'MEDIUM',
            'resource_exhaustion': 'MEDIUM'
        }
        return severity_map.get(category, 'LOW')

    def _get_recommendation(self, category: str) -> str:
        """Get recommendation for vulnerability category."""
        recommendations = {
            'sql_injection': 'Use parameterized queries and input validation',
            'command_injection': 'Validate and sanitize all user inputs, avoid system calls',
            'template_injection': 'Use safe templating with auto-escaping enabled',
            'xss': 'Encode output and validate input, use Content Security Policy',
            'path_traversal': 'Validate and canonicalize file paths, use whitelist approach',
            'file_upload': 'Validate file types, scan for malware, limit file sizes',
            'resource_exhaustion': 'Implement rate limiting and resource quotas'
        }
        return recommendations.get(category, 'Review and validate input handling')

class PathSecurity:
    """File path security validation."""

    def __init__(self, workspace_root: str):
        self.workspace_root = os.path.abspath(workspace_root)
        self.dangerous_paths = [
            '/etc/', '/usr/', '/var/', '/root/', '/home/',
            'c:\\windows\\', 'c:\\users\\', 'c:\\program files\\'
        ]

    def validate_path(self, path: str) -> Tuple[bool, List[SecurityFinding]]:
        """Validate file path for security issues."""
        findings = []
        original_path = path

        try:
            # URL decode
            for _ in range(3):
                decoded = unquote(path)
                if decoded == path:
                    break
                path = decoded

            # Normalize separators
            path = path.replace('\\', '/')

            # Remove null bytes
            path = path.replace('\x00', '')

            # Check for traversal attempts
            if '..' in path:
                findings.append(SecurityFinding(
                    severity='HIGH',
                    category='path_traversal',
                    description='Path traversal attempt detected',
                    file_path=original_path,
                    evidence='..',
                    recommendation='Use absolute paths within workspace boundary'
                ))

            # Resolve to absolute path
            if not os.path.isabs(path):
                path = os.path.join(self.workspace_root, path)

            # Normalize path
            path = os.path.normpath(path)

            # Check workspace boundary
            if not path.startswith(self.workspace_root):
                findings.append(SecurityFinding(
                    severity='CRITICAL',
                    category='path_traversal',
                    description='Path outside workspace boundary',
                    file_path=original_path,
                    evidence=path,
                    recommendation='Ensure all paths remain within workspace'
                ))

            # Check dangerous system paths
            for dangerous_path in self.dangerous_paths:
                if path.lower().startswith(dangerous_path.lower()):
                    findings.append(SecurityFinding(
                        severity='CRITICAL',
                        category='system_access',
                        description='Attempt to access system directory',
                        file_path=original_path,
                        evidence=dangerous_path,
                        recommendation='Block access to system directories'
                    ))

            is_safe = len(findings) == 0

        except Exception as e:
            findings.append(SecurityFinding(
                severity='MEDIUM',
                category='path_validation',
                description=f'Path validation error: {str(e)}',
                file_path=original_path,
                recommendation='Handle path validation errors gracefully'
            ))
            is_safe = False

        return is_safe, findings

    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe file operations."""
        if not filename:
            return "unnamed_file"

        # Remove path separators
        filename = filename.replace('/', '_').replace('\\', '_')

        # Remove dangerous characters
        dangerous_chars = ['<', '>', ':', '"', '|', '?', '*', '\x00']
        for char in dangerous_chars:
            filename = filename.replace(char, '_')

        # Remove leading dots (hidden files)
        filename = filename.lstrip('.')

        # Ensure reasonable length
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:255-len(ext)] + ext

        # Ensure not empty
        if not filename or filename.isspace():
            filename = "safe_filename"

        return filename

class ContentScanner:
    """Scan content for security issues."""

    def __init__(self):
        self.sensitive_patterns = {
            'credentials': [
                r'password\s*[=:]\s*["\']?[^\s"\']{8,}',
                r'api[_-]?key\s*[=:]\s*["\']?[a-zA-Z0-9]{20,}',
                r'secret\s*[=:]\s*["\']?[a-zA-Z0-9]{16,}',
                r'token\s*[=:]\s*["\']?[a-zA-Z0-9]{20,}',
                r'access[_-]?key\s*[=:]\s*["\']?[a-zA-Z0-9]{16,}'
            ],
            'private_info': [
                r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
                r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Email
            ],
            'malicious_code': [
                r'eval\s*\(',
                r'exec\s*\(',
                r'system\s*\(',
                r'shell_exec\s*\(',
                r'passthru\s*\(',
                r'base64_decode\s*\('
            ]
        }

    def scan_content(self, content: str, filepath: str) -> List[SecurityFinding]:
        """Scan content for security issues."""
        findings = []

        # Skip binary files
        try:
            content.encode('utf-8')
        except UnicodeDecodeError:
            return findings

        line_number = 0
        for line in content.splitlines():
            line_number += 1

            for category, patterns in self.sensitive_patterns.items():
                for pattern in patterns:
                    matches = re.finditer(pattern, line, re.IGNORECASE)
                    for match in matches:
                        severity = 'HIGH' if category == 'credentials' else 'MEDIUM'

                        # Don't flag example/placeholder content
                        if any(word in line.lower() for word in ['example', 'placeholder', 'dummy', 'test']):
                            severity = 'LOW'

                        findings.append(SecurityFinding(
                            severity=severity,
                            category=category,
                            description=f'Potential {category} detected',
                            file_path=filepath,
                            line_number=line_number,
                            evidence=match.group(0)[:50],  # Truncate evidence
                            recommendation=f'Remove or obfuscate {category} from source code'
                        ))

        return findings

    def scan_file(self, filepath: str) -> List[SecurityFinding]:
        """Scan a single file for security issues."""
        findings = []

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            findings.extend(self.scan_content(content, filepath))

        except UnicodeDecodeError:
            # Binary file - check for suspicious executable content
            findings.append(SecurityFinding(
                severity='MEDIUM',
                category='binary_file',
                description='Binary file detected in documentation',
                file_path=filepath,
                recommendation='Ensure binary files are safe and necessary'
            ))

        except Exception as e:
            findings.append(SecurityFinding(
                severity='LOW',
                category='scan_error',
                description=f'Error scanning file: {str(e)}',
                file_path=filepath,
                recommendation='Investigate file scan errors'
            ))

        return findings

class SecurityValidator:
    """Main security validation orchestrator."""

    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root
        self.input_sanitizer = InputSanitizer()
        self.path_security = PathSecurity(workspace_root)
        self.content_scanner = ContentScanner()

    def validate_skill_execution(self, input_data: str, output_directory: str) -> Dict:
        """Comprehensive security validation of skill execution."""
        findings = []

        # 1. Validate input
        print("🔍 Validating input security...")
        input_findings = self.input_sanitizer.analyze_input(input_data)
        findings.extend(input_findings)

        # 2. Validate output directory path
        print("🔍 Validating output path security...")
        path_safe, path_findings = self.path_security.validate_path(output_directory)
        findings.extend(path_findings)

        # 3. Scan generated content
        if os.path.exists(output_directory):
            print("🔍 Scanning generated content...")
            content_findings = self._scan_directory(output_directory)
            findings.extend(content_findings)

        # 4. Check file permissions
        print("🔍 Checking file permissions...")
        permission_findings = self._check_file_permissions(output_directory)
        findings.extend(permission_findings)

        # Generate summary
        summary = self._generate_security_summary(findings)

        return summary

    def _scan_directory(self, directory: str) -> List[SecurityFinding]:
        """Recursively scan directory for security issues."""
        findings = []

        for root, dirs, files in os.walk(directory):
            for file in files:
                filepath = os.path.join(root, file)
                file_findings = self.content_scanner.scan_file(filepath)
                findings.extend(file_findings)

        return findings

    def _check_file_permissions(self, directory: str) -> List[SecurityFinding]:
        """Check file permissions for security issues."""
        findings = []

        if not os.path.exists(directory):
            return findings

        for root, dirs, files in os.walk(directory):
            for file in files:
                filepath = os.path.join(root, file)

                try:
                    stat = os.stat(filepath)

                    # Check if world-writable
                    if stat.st_mode & 0o002:
                        findings.append(SecurityFinding(
                            severity='MEDIUM',
                            category='file_permissions',
                            description='World-writable file',
                            file_path=filepath,
                            recommendation='Remove world-write permissions'
                        ))

                    # Check if executable documentation file
                    if file.endswith(('.md', '.txt', '.json')) and stat.st_mode & 0o111:
                        findings.append(SecurityFinding(
                            severity='LOW',
                            category='file_permissions',
                            description='Executable documentation file',
                            file_path=filepath,
                            recommendation='Remove execute permissions from documentation files'
                        ))

                except OSError:
                    continue

        return findings

    def _generate_security_summary(self, findings: List[SecurityFinding]) -> Dict:
        """Generate security validation summary."""
        summary = {
            'total_findings': len(findings),
            'critical': len([f for f in findings if f.severity == 'CRITICAL']),
            'high': len([f for f in findings if f.severity == 'HIGH']),
            'medium': len([f for f in findings if f.severity == 'MEDIUM']),
            'low': len([f for f in findings if f.severity == 'LOW']),
            'categories': {},
            'findings': []
        }

        # Count by category
        for finding in findings:
            if finding.category not in summary['categories']:
                summary['categories'][finding.category] = 0
            summary['categories'][finding.category] += 1

        # Add finding details
        for finding in findings:
            summary['findings'].append({
                'severity': finding.severity,
                'category': finding.category,
                'description': finding.description,
                'file_path': finding.file_path,
                'line_number': finding.line_number,
                'evidence': finding.evidence,
                'recommendation': finding.recommendation
            })

        # Determine overall security status
        if summary['critical'] > 0:
            summary['status'] = 'CRITICAL'
            summary['message'] = f"Critical security issues found: {summary['critical']}"
        elif summary['high'] > 0:
            summary['status'] = 'HIGH_RISK'
            summary['message'] = f"High-risk security issues found: {summary['high']}"
        elif summary['medium'] > 0:
            summary['status'] = 'MEDIUM_RISK'
            summary['message'] = f"Medium-risk security issues found: {summary['medium']}"
        elif summary['low'] > 0:
            summary['status'] = 'LOW_RISK'
            summary['message'] = f"Low-risk security issues found: {summary['low']}"
        else:
            summary['status'] = 'SECURE'
            summary['message'] = "No security issues found"

        return summary

def run_security_tests():
    """Run comprehensive security tests."""
    print("🔒 Security Validation Suite for Idea2PRD Skill")
    print("=" * 50)

    workspace_root = "/workspaces/jlmaworkspace"
    validator = SecurityValidator(workspace_root)

    # Test cases
    test_cases = [
        {
            'name': 'SQL Injection Test',
            'input': "Our system needs database'; DROP TABLE users; --",
            'expected_blocked': True
        },
        {
            'name': 'Path Traversal Test',
            'input': "Check file at ../../../etc/passwd",
            'expected_blocked': True
        },
        {
            'name': 'XSS Test',
            'input': "<script>alert('xss')</script>Our web app",
            'expected_blocked': True
        },
        {
            'name': 'Normal Input Test',
            'input': "We need a task management app for remote teams",
            'expected_blocked': False
        }
    ]

    all_results = []

    for test_case in test_cases:
        print(f"\n🧪 Running: {test_case['name']}")

        # Analyze input
        findings = validator.input_sanitizer.analyze_input(test_case['input'])
        has_issues = len(findings) > 0

        if test_case['expected_blocked']:
            if has_issues:
                print("  ✅ PASS - Malicious input detected and blocked")
                status = "PASS"
            else:
                print("  ❌ FAIL - Malicious input not detected")
                status = "FAIL"
        else:
            if not has_issues:
                print("  ✅ PASS - Safe input processed correctly")
                status = "PASS"
            else:
                print("  ⚠️  WARNING - False positive on safe input")
                status = "WARNING"

        # Show findings
        for finding in findings:
            print(f"    {finding.severity}: {finding.description}")
            print(f"    Evidence: {finding.evidence}")

        all_results.append({
            'test_name': test_case['name'],
            'status': status,
            'findings_count': len(findings),
            'findings': [f.__dict__ for f in findings]
        })

    # Summary
    passed = len([r for r in all_results if r['status'] == 'PASS'])
    failed = len([r for r in all_results if r['status'] == 'FAIL'])
    warnings = len([r for r in all_results if r['status'] == 'WARNING'])

    print(f"\n📊 Security Test Summary")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Warnings: {warnings}")
    print(f"Success Rate: {(passed / len(all_results) * 100):.1f}%")

    # Save results
    results_file = "security-test-results.json"
    with open(results_file, 'w') as f:
        json.dump({
            'summary': {
                'total': len(all_results),
                'passed': passed,
                'failed': failed,
                'warnings': warnings
            },
            'results': all_results
        }, f, indent=2)

    print(f"\n📄 Results saved to: {results_file}")

    return failed == 0

def main():
    """Main entry point."""
    try:
        success = run_security_tests()
        if success:
            print("\n🎉 All security tests passed!")
            return 0
        else:
            print("\n⚠️ Some security tests failed!")
            return 1

    except Exception as e:
        print(f"\n💥 Security test error: {e}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())