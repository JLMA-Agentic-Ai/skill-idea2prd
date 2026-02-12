#!/bin/bash

# Comprehensive Security Scanner
# Security validation for generated PRD content and files
# Version: 1.0.0

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
readonly SCAN_DIR="${1:-$PROJECT_DIR/generated}"
readonly SCAN_REPORT="$PROJECT_DIR/logs/security-scan-$(date +%Y%m%d_%H%M%S).json"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Security pattern definitions
declare -A SECURITY_PATTERNS=(
    ["secrets"]="(password|secret|key|token|api[_-]?key|access[_-]?token|private[_-]?key)"
    ["injection"]="(\{\{|\\$\{|<script|javascript:|eval\(|function\(|require\(|import\()"
    ["paths"]="(\\.\\./|\\.\\\\|/etc/|/home/|/root/|/var/|C:\\\\|\\\\\\\\)"
    ["commands"]="(exec\(|system\(|shell[_-]?exec|cmd\\.exe|/bin/sh|/bin/bash)"
    ["personal_data"]="(ssn|social.security|credit.card|passport|driver.license)"
)

# Risk levels
declare -A RISK_LEVELS=(
    ["secrets"]="CRITICAL"
    ["injection"]="HIGH"
    ["paths"]="HIGH"
    ["commands"]="CRITICAL"
    ["personal_data"]="HIGH"
)

# Initialize scan results
declare -A SCAN_RESULTS=(
    ["files_scanned"]=0
    ["total_issues"]=0
    ["critical_issues"]=0
    ["high_issues"]=0
    ["medium_issues"]=0
    ["low_issues"]=0
)

# Logging function
log_result() {
    local level="$1"
    local file="$2"
    local line_num="$3"
    local pattern_type="$4"
    local content="$5"

    case "$level" in
        "CRITICAL")
            ((SCAN_RESULTS["critical_issues"]++))
            echo -e "${RED}[CRITICAL]${NC} $file:$line_num - $pattern_type"
            ;;
        "HIGH")
            ((SCAN_RESULTS["high_issues"]++))
            echo -e "${RED}[HIGH]${NC} $file:$line_num - $pattern_type"
            ;;
        "MEDIUM")
            ((SCAN_RESULTS["medium_issues"]++))
            echo -e "${YELLOW}[MEDIUM]${NC} $file:$line_num - $pattern_type"
            ;;
        "LOW")
            ((SCAN_RESULTS["low_issues"]++))
            echo -e "${YELLOW}[LOW]${NC} $file:$line_num - $pattern_type"
            ;;
    esac

    echo "  Content: ${content:0:100}..."
    ((SCAN_RESULTS["total_issues"]++))
}

# Scan individual file
scan_file() {
    local file="$1"
    local line_num=0

    echo -e "${BLUE}Scanning: $file${NC}"
    ((SCAN_RESULTS["files_scanned"]++))

    while IFS= read -r line; do
        ((line_num++))

        # Check each security pattern
        for pattern_type in "${!SECURITY_PATTERNS[@]}"; do
            local pattern="${SECURITY_PATTERNS[$pattern_type]}"
            local risk_level="${RISK_LEVELS[$pattern_type]}"

            if echo "$line" | grep -iE "$pattern" >/dev/null 2>&1; then
                log_result "$risk_level" "$file" "$line_num" "$pattern_type" "$line"
            fi
        done

        # Check for overly long lines (potential data exfiltration)
        if [[ ${#line} -gt 1000 ]]; then
            log_result "MEDIUM" "$file" "$line_num" "long_line" "Line exceeds 1000 characters"
        fi

        # Check for binary content
        if [[ "$line" =~ [^[:print:][:space:]] ]]; then
            log_result "HIGH" "$file" "$line_num" "binary_content" "Non-printable characters detected"
        fi

    done < "$file"
}

# Check file permissions
check_permissions() {
    local file="$1"
    local perms
    perms=$(stat -c "%a" "$file" 2>/dev/null || echo "000")

    # Check for overly permissive permissions
    if [[ "$perms" -gt 644 ]] && [[ -f "$file" ]]; then
        log_result "MEDIUM" "$file" "0" "file_permissions" "Overly permissive file permissions: $perms"
    fi

    if [[ "$perms" -gt 755 ]] && [[ -d "$file" ]]; then
        log_result "MEDIUM" "$file" "0" "directory_permissions" "Overly permissive directory permissions: $perms"
    fi
}

# Check for suspicious file names
check_filename() {
    local file="$1"
    local basename
    basename=$(basename "$file")

    # Check for suspicious file extensions
    if [[ "$basename" =~ \.(exe|bat|cmd|sh|ps1|scr|com|pif)$ ]]; then
        log_result "HIGH" "$file" "0" "suspicious_extension" "Potentially dangerous file extension"
    fi

    # Check for hidden files (except allowed ones)
    if [[ "$basename" =~ ^\. ]] && [[ ! "$basename" =~ ^\.ai-context$ ]]; then
        log_result "LOW" "$file" "0" "hidden_file" "Hidden file detected"
    fi

    # Check for suspicious names
    local suspicious_names=("passwd" "shadow" "hosts" "config" "secrets" "private")
    for name in "${suspicious_names[@]}"; do
        if [[ "$basename" =~ $name ]]; then
            log_result "MEDIUM" "$file" "0" "suspicious_name" "Potentially sensitive filename: $name"
        fi
    done
}

# Generate JSON report
generate_report() {
    echo "Generating security scan report..."

    mkdir -p "$(dirname "$SCAN_REPORT")"

    cat > "$SCAN_REPORT" << EOF
{
  "scan_metadata": {
    "timestamp": "$(date -Iseconds)",
    "scan_directory": "$SCAN_DIR",
    "scanner_version": "1.0.0",
    "scan_duration_seconds": $(($(date +%s) - scan_start_time))
  },
  "summary": {
    "files_scanned": ${SCAN_RESULTS["files_scanned"]},
    "total_issues": ${SCAN_RESULTS["total_issues"]},
    "critical_issues": ${SCAN_RESULTS["critical_issues"]},
    "high_issues": ${SCAN_RESULTS["high_issues"]},
    "medium_issues": ${SCAN_RESULTS["medium_issues"]},
    "low_issues": ${SCAN_RESULTS["low_issues"]}
  },
  "risk_assessment": {
    "overall_risk": "$(calculate_risk_level)",
    "security_posture": "$(calculate_security_posture)",
    "recommendations": [
      "Review and remediate all CRITICAL and HIGH severity findings",
      "Implement regular security scanning in CI/CD pipeline",
      "Validate all user inputs and outputs",
      "Follow principle of least privilege for file permissions"
    ]
  }
}
EOF

    echo -e "${BLUE}Security scan report generated: $SCAN_REPORT${NC}"
}

# Calculate overall risk level
calculate_risk_level() {
    local critical=${SCAN_RESULTS["critical_issues"]}
    local high=${SCAN_RESULTS["high_issues"]}

    if [[ $critical -gt 0 ]]; then
        echo "CRITICAL"
    elif [[ $high -gt 5 ]]; then
        echo "HIGH"
    elif [[ $high -gt 0 ]]; then
        echo "MEDIUM"
    else
        echo "LOW"
    fi
}

# Calculate security posture
calculate_security_posture() {
    local total=${SCAN_RESULTS["total_issues"]}

    if [[ $total -eq 0 ]]; then
        echo "EXCELLENT"
    elif [[ $total -le 5 ]]; then
        echo "GOOD"
    elif [[ $total -le 15 ]]; then
        echo "FAIR"
    else
        echo "POOR"
    fi
}

# Print summary
print_summary() {
    echo
    echo -e "${BLUE}=== Security Scan Summary ===${NC}"
    echo "Files scanned: ${SCAN_RESULTS["files_scanned"]}"
    echo "Total issues: ${SCAN_RESULTS["total_issues"]}"
    echo -e "Critical: ${RED}${SCAN_RESULTS["critical_issues"]}${NC}"
    echo -e "High: ${RED}${SCAN_RESULTS["high_issues"]}${NC}"
    echo -e "Medium: ${YELLOW}${SCAN_RESULTS["medium_issues"]}${NC}"
    echo -e "Low: ${YELLOW}${SCAN_RESULTS["low_issues"]}${NC}"
    echo
    echo "Overall Risk: $(calculate_risk_level)"
    echo "Security Posture: $(calculate_security_posture)"
    echo
}

# Main scanning function
main() {
    local scan_start_time
    scan_start_time=$(date +%s)

    echo -e "${BLUE}=== Security Scanner ===${NC}"
    echo "Scanning directory: $SCAN_DIR"
    echo "Report will be saved to: $SCAN_REPORT"
    echo

    # Check if scan directory exists
    if [[ ! -d "$SCAN_DIR" ]]; then
        echo -e "${RED}ERROR: Scan directory does not exist: $SCAN_DIR${NC}"
        exit 1
    fi

    # Scan all files recursively
    while IFS= read -r -d '' file; do
        check_filename "$file"
        check_permissions "$file"

        # Only scan text files
        if file "$file" | grep -q "text\|ASCII\|UTF-8\|empty"; then
            scan_file "$file"
        fi
    done < <(find "$SCAN_DIR" -type f -print0)

    # Generate report and summary
    generate_report
    print_summary

    # Exit with appropriate code
    local critical=${SCAN_RESULTS["critical_issues"]}
    local high=${SCAN_RESULTS["high_issues"]}

    if [[ $critical -gt 0 ]]; then
        echo -e "${RED}SECURITY SCAN FAILED: Critical issues found${NC}"
        exit 2
    elif [[ $high -gt 0 ]]; then
        echo -e "${YELLOW}SECURITY SCAN WARNING: High-risk issues found${NC}"
        exit 1
    else
        echo -e "${GREEN}SECURITY SCAN PASSED: No critical or high-risk issues found${NC}"
        exit 0
    fi
}

# Error handling
trap 'echo -e "${RED}Security scan interrupted${NC}"; exit 1' INT TERM

# Execute main function
main "$@"