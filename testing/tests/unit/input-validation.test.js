/**
 * Unit Tests for Input Validation
 * Tests the security-focused input validation for the idea-to-PRD skill
 */

const { validateInput, sanitizeInput, detectSensitiveData } = require('../../src/validation/input-validator');
const ideaInputSchema = require('../../schemas/idea-input.schema.json');

describe('Input Validation Security Tests', () => {

  describe('Schema Validation', () => {

    test('should accept valid input with all required fields', () => {
      const validInput = {
        idea: "AI-powered task management app for remote teams",
        stakeholders: ["Product", "Engineering", "Design"],
        securityLevel: "high",
        outputFormat: "comprehensive"
      };

      const result = validateInput(validInput, ideaInputSchema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject input with missing required idea field', () => {
      const invalidInput = {
        stakeholders: ["Product", "Engineering"],
        securityLevel: "medium"
      };

      const result = validateInput(invalidInput, ideaInputSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: idea');
    });

    test('should reject input with idea too short', () => {
      const invalidInput = {
        idea: "Short" // Less than 10 characters
      };

      const result = validateInput(invalidInput, ideaInputSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field "idea" must be at least 10 characters');
    });

    test('should reject input with idea too long', () => {
      const invalidInput = {
        idea: "A".repeat(10001) // More than 10000 characters
      };

      const result = validateInput(invalidInput, ideaInputSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field "idea" exceeds maximum length of 10000 characters');
    });

    test('should reject input with invalid security level', () => {
      const invalidInput = {
        idea: "Valid idea for testing purposes",
        securityLevel: "super-high" // Not in enum
      };

      const result = validateInput(invalidInput, ideaInputSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field "securityLevel" must be one of: low, medium, high, critical');
    });

    test('should reject input with too many stakeholders', () => {
      const invalidInput = {
        idea: "Valid idea for testing purposes",
        stakeholders: new Array(21).fill("Stakeholder") // More than 20 allowed
      };

      const result = validateInput(invalidInput, ideaInputSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field "stakeholders" cannot have more than 20 items');
    });

  });

  describe('Input Sanitization', () => {

    test('should remove HTML tags from idea field', () => {
      const maliciousInput = {
        idea: "Task management app with <script>alert('xss')</script> features"
      };

      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized.idea).toBe("Task management app with alert('xss') features");
      expect(sanitized.idea).not.toContain('<script>');
    });

    test('should encode HTML entities', () => {
      const inputWithEntities = {
        idea: "App for managing tasks & projects with 'quotes' and \"double quotes\""
      };

      const sanitized = sanitizeInput(inputWithEntities);
      expect(sanitized.idea).toContain('&amp;');
      expect(sanitized.idea).toContain('&#x27;'); // Single quote
      expect(sanitized.idea).toContain('&quot;'); // Double quote
    });

    test('should trim whitespace from string fields', () => {
      const inputWithWhitespace = {
        idea: "  Task management app with extra spaces  ",
        stakeholders: ["  Product  ", "  Engineering  "]
      };

      const sanitized = sanitizeInput(inputWithWhitespace);
      expect(sanitized.idea).toBe("Task management app with extra spaces");
      expect(sanitized.stakeholders).toEqual(["Product", "Engineering"]);
    });

    test('should normalize case for stakeholder names', () => {
      const inputWithMixedCase = {
        idea: "Task management application",
        stakeholders: ["product", "ENGINEERING", "dEsIgN"]
      };

      const sanitized = sanitizeInput(inputWithMixedCase);
      expect(sanitized.stakeholders).toEqual(["Product", "Engineering", "Design"]);
    });

  });

  describe('Sensitive Data Detection', () => {

    test('should detect potential PII in idea field', () => {
      const inputWithPII = {
        idea: "Create app for managing tasks, contact john.doe@company.com for details"
      };

      const detection = detectSensitiveData(inputWithPII);
      expect(detection.hasPII).toBe(true);
      expect(detection.detectedTypes).toContain('email');
      expect(detection.maskedData.idea).toContain('[REDACTED_EMAIL]');
    });

    test('should detect phone numbers in idea field', () => {
      const inputWithPhone = {
        idea: "Task app, call 555-123-4567 for support"
      };

      const detection = detectSensitiveData(inputWithPhone);
      expect(detection.hasPII).toBe(true);
      expect(detection.detectedTypes).toContain('phone');
      expect(detection.maskedData.idea).toContain('[REDACTED_PHONE]');
    });

    test('should detect potential credit card numbers', () => {
      const inputWithCC = {
        idea: "Payment app with card 4532-1234-5678-9012 integration"
      };

      const detection = detectSensitiveData(inputWithCC);
      expect(detection.hasPII).toBe(true);
      expect(detection.detectedTypes).toContain('credit_card');
      expect(detection.maskedData.idea).toContain('[REDACTED_CC]');
    });

    test('should detect Social Security Numbers', () => {
      const inputWithSSN = {
        idea: "HR app managing SSN 123-45-6789 for employees"
      };

      const detection = detectSensitiveData(inputWithSSN);
      expect(detection.hasPII).toBe(true);
      expect(detection.detectedTypes).toContain('ssn');
      expect(detection.maskedData.idea).toContain('[REDACTED_SSN]');
    });

    test('should detect potential API keys or tokens', () => {
      const inputWithAPI = {
        idea: "Integration with API key sk_live_1234567890abcdef"
      };

      const detection = detectSensitiveData(inputWithAPI);
      expect(detection.hasPII).toBe(true);
      expect(detection.detectedTypes).toContain('api_key');
      expect(detection.maskedData.idea).toContain('[REDACTED_API_KEY]');
    });

    test('should not flag legitimate business content', () => {
      const legitimateInput = {
        idea: "AI-powered task management for agile development teams"
      };

      const detection = detectSensitiveData(legitimateInput);
      expect(detection.hasPII).toBe(false);
      expect(detection.detectedTypes).toHaveLength(0);
      expect(detection.maskedData.idea).toBe(legitimateInput.idea);
    });

  });

  describe('Content Filtering', () => {

    test('should filter profanity from input', () => {
      const inputWithProfanity = {
        idea: "This damn app is really good for task management"
      };

      const filtered = sanitizeInput(inputWithProfanity, { profanityFilter: true });
      expect(filtered.idea).toContain('[FILTERED]');
      expect(filtered.idea).not.toContain('damn');
    });

    test('should detect and filter potential SQL injection attempts', () => {
      const maliciousInput = {
        idea: "Task app; DROP TABLE users; --"
      };

      const filtered = sanitizeInput(maliciousInput, { sqlInjectionFilter: true });
      expect(filtered.idea).not.toContain('DROP TABLE');
      expect(filtered.warnings).toContain('Potential SQL injection detected');
    });

    test('should detect and filter XSS attempts', () => {
      const xssInput = {
        idea: "javascript:alert('xss') in task management"
      };

      const filtered = sanitizeInput(xssInput, { xssFilter: true });
      expect(filtered.idea).not.toContain('javascript:');
      expect(filtered.warnings).toContain('Potential XSS attempt detected');
    });

  });

  describe('Rate Limiting Validation', () => {

    test('should track request frequency per user', () => {
      const userId = 'test-user-123';
      const requestTracker = require('../../src/validation/rate-limiter');

      // Simulate multiple requests
      for (let i = 0; i < 55; i++) {
        const result = requestTracker.checkRateLimit(userId);
        expect(result.allowed).toBe(true);
      }

      // 61st request should be blocked (limit is 60/minute)
      for (let i = 0; i < 6; i++) {
        const result = requestTracker.checkRateLimit(userId);
        expect(result.allowed).toBe(false);
        expect(result.retryAfter).toBeGreaterThan(0);
      }
    });

    test('should reset rate limit after time window', async () => {
      const userId = 'test-user-reset';
      const requestTracker = require('../../src/validation/rate-limiter');

      // Fill up the rate limit
      for (let i = 0; i < 60; i++) {
        requestTracker.checkRateLimit(userId);
      }

      const blocked = requestTracker.checkRateLimit(userId);
      expect(blocked.allowed).toBe(false);

      // Wait for reset (using mock timer in test environment)
      jest.advanceTimersByTime(61000); // 61 seconds

      const reset = requestTracker.checkRateLimit(userId);
      expect(reset.allowed).toBe(true);
    });

  });

  describe('Path Sanitization', () => {

    test('should prevent directory traversal in file paths', () => {
      const { sanitizePath } = require('../../src/validation/path-sanitizer');

      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '/var/log/../../etc/shadow',
        'normal/path/../../../secret'
      ];

      maliciousPaths.forEach(path => {
        const sanitized = sanitizePath(path);
        expect(sanitized).not.toContain('..');
        expect(sanitized).not.toMatch(/\.\.[\\\/]/);
      });
    });

    test('should allow legitimate file paths', () => {
      const { sanitizePath } = require('../../src/validation/path-sanitizer');

      const legitimatePaths = [
        'documents/prd.md',
        'templates/prd-template.md',
        'output/analysis-report.json'
      ];

      legitimatePaths.forEach(path => {
        const sanitized = sanitizePath(path);
        expect(sanitized).toBe(path);
      });
    });

    test('should prevent access to system directories', () => {
      const { sanitizePath } = require('../../src/validation/path-sanitizer');

      const systemPaths = [
        '/etc/passwd',
        '/var/log/system.log',
        'C:\\Windows\\System32\\config',
        '/usr/bin/sudo'
      ];

      systemPaths.forEach(path => {
        const sanitized = sanitizePath(path);
        expect(sanitized).toBe(null); // Should reject system paths
      });
    });

  });

  describe('Memory and Resource Validation', () => {

    test('should estimate memory usage for large inputs', () => {
      const { estimateMemoryUsage } = require('../../src/validation/resource-validator');

      const largeInput = {
        idea: 'A'.repeat(5000),
        stakeholders: new Array(15).fill('Stakeholder'),
        constraints: {
          technology: new Array(8).fill('Framework')
        }
      };

      const estimate = estimateMemoryUsage(largeInput);
      expect(estimate.estimatedMB).toBeGreaterThan(0);
      expect(estimate.estimatedMB).toBeLessThan(100); // Should be reasonable
    });

    test('should reject inputs that would cause memory exhaustion', () => {
      const { validateResourceRequirements } = require('../../src/validation/resource-validator');

      const massiveInput = {
        idea: 'A'.repeat(9999), // Near maximum
        stakeholders: new Array(20).fill('A'.repeat(50)) // Maximum items with max length
      };

      const validation = validateResourceRequirements(massiveInput);
      expect(validation.withinLimits).toBe(true); // Should still be within limits

      const excessiveInput = {
        idea: 'A'.repeat(15000) // Exceeds maximum
      };

      const excessiveValidation = validateResourceRequirements(excessiveInput);
      expect(excessiveValidation.withinLimits).toBe(false);
      expect(excessiveValidation.errors).toContain('Input exceeds memory limits');
    });

  });

});

// Test utilities and mocks
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});