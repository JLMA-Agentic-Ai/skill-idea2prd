#!/bin/bash

# Secure Input Validation Script
# Security-first input validation for idea-to-PRD skill
# Version: 1.0.0

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Security constants
readonly MAX_INPUT_LENGTH=10240  # 10KB
readonly ALLOWED_CHARS_PATTERN='^[a-zA-Z0-9[:space:]\-_.,!?()[\]{}'"'"'":;@#%&*+=/<>|~`^\\]*$'
readonly BLOCKED_PATTERNS=('{{' '${' '<script' 'javascript:' 'eval(' 'function(' 'require(' 'import(' '../' '/./' '/etc/' '/home/' '/root/')

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

# Validation function
validate_input() {
    local input="$1"
    local field_name="${2:-input}"
    local verbose="${3:-false}"
    local errors=0

    echo "Validating input for field: $field_name"

    # Check input length
    if [[ ${#input} -gt $MAX_INPUT_LENGTH ]]; then
        echo -e "${RED}ERROR: Input exceeds maximum length of $MAX_INPUT_LENGTH characters${NC}"
        echo "  Current length: ${#input}"
        ((errors++))
    elif [[ "$verbose" == "true" ]]; then
        echo -e "${GREEN}✓ Length validation passed (${#input}/$MAX_INPUT_LENGTH)${NC}"
    fi

    # Check for blocked patterns
    for pattern in "${BLOCKED_PATTERNS[@]}"; do
        if [[ "$input" == *"$pattern"* ]]; then
            echo -e "${RED}ERROR: Input contains blocked pattern: $pattern${NC}"
            echo "  This pattern is blocked for security reasons"
            ((errors++))
        fi
    done

    if [[ $errors -eq 0 && "$verbose" == "true" ]]; then
        echo -e "${GREEN}✓ Pattern validation passed${NC}"
    fi

    # Check for dangerous control characters
    if [[ "$input" =~ [[:cntrl:]] ]]; then
        # Allow common whitespace characters but block other control chars
        if [[ ! "$input" =~ ^[[:print:][:space:]]*$ ]]; then
            echo -e "${RED}ERROR: Input contains dangerous control characters${NC}"
            echo "  Allowed: printable characters and basic whitespace"
            ((errors++))
        fi
    fi

    if [[ $errors -eq 0 && "$verbose" == "true" ]]; then
        echo -e "${GREEN}✓ Character validation passed${NC}"
    fi

    # Check for potential injection attempts
    local injection_patterns=('SELECT ' 'INSERT ' 'UPDATE ' 'DELETE ' 'DROP ' 'CREATE ' 'ALTER ' 'UNION ' 'OR 1=1' 'AND 1=1')
    for pattern in "${injection_patterns[@]}"; do
        if [[ "$input" =~ $pattern ]]; then
            echo -e "${YELLOW}WARNING: Input contains SQL-like pattern: $pattern${NC}"
            echo "  This may be legitimate content, but please verify"
        fi
    done

    # Summary
    if [[ $errors -eq 0 ]]; then
        echo -e "${GREEN}✓ Input validation PASSED for $field_name${NC}"
        return 0
    else
        echo -e "${RED}✗ Input validation FAILED for $field_name ($errors errors)${NC}"
        return 1
    fi
}

# Main function
main() {
    local input_file=""
    local verbose=false
    local field_name="input"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --verbose)
                verbose=true
                shift
                ;;
            --field)
                field_name="$2"
                shift 2
                ;;
            --help|-h)
                echo "Usage: $0 [input_file] [--verbose] [--field field_name]"
                echo "  input_file: File containing input to validate (optional, will read from stdin)"
                echo "  --verbose: Show detailed validation results"
                echo "  --field: Name of the field being validated"
                exit 0
                ;;
            *)
                if [[ -z "$input_file" ]]; then
                    input_file="$1"
                fi
                shift
                ;;
        esac
    done

    local input=""

    # Read input
    if [[ -n "$input_file" ]]; then
        if [[ ! -f "$input_file" ]]; then
            echo -e "${RED}ERROR: Input file not found: $input_file${NC}"
            exit 1
        fi
        input=$(cat "$input_file")
    else
        echo "Enter input to validate (Ctrl+D to finish):"
        input=$(cat)
    fi

    # Validate input
    validate_input "$input" "$field_name" "$verbose"
}

# Execute main function
main "$@"