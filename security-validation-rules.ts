/**
 * Security Validation Rules for Secure Idea-to-PRD Claude Code Skill
 *
 * This module defines comprehensive validation rules, sanitization functions,
 * and security constraints for all input processing and file operations.
 */

import { createHash } from 'crypto';
import { normalize, extname, join, dirname } from 'path';

// AIMDS Integration Interface
interface AIMDSResult {
  safe: boolean;
  threats: string[];
  confidence: number;
  detectionTimeMs: number;
  piiFound: boolean;
}

// Result types for security operations
type SecurityResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; threat?: string };

// Security validation levels
enum SecurityLevel {
  STRICT = 'strict',     // Maximum security, minimal false positives
  BALANCED = 'balanced', // Balance security with usability
  PERMISSIVE = 'permissive' // Minimal security for testing
}

// Input validation configuration
interface ValidationConfig {
  level: SecurityLevel;
  maxInputSize: number;
  allowedFileExtensions: string[];
  maxFileSize: number;
  enableAIMDS: boolean;
  logSecurityEvents: boolean;
}

const DEFAULT_CONFIG: ValidationConfig = {
  level: SecurityLevel.STRICT,
  maxInputSize: 1000000, // 1MB
  allowedFileExtensions: ['.md', '.txt', '.json', '.pseudo', '.feature', '.yaml', '.yml'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  enableAIMDS: true,
  logSecurityEvents: true
};

/**
 * Comprehensive Input Validator with AIMDS integration
 */
export class SecurityValidator {
  private config: ValidationConfig;
  private dangerousPatterns: RegExp[];
  private suspiciousPatterns: RegExp[];

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Critical security patterns (immediate block)
    this.dangerousPatterns = [
      // Template injection patterns
      /\{\{.*?__.*?\}\}/gi,                    // Python dunder methods
      /\{\{.*?eval\s*\(.*?\}\}/gi,             // eval() calls
      /\{\{.*?exec\s*\(.*?\}\}/gi,             // exec() calls
      /\{\{.*?import\s+.*?\}\}/gi,             // import statements
      /\{\{.*?subprocess.*?\}\}/gi,            // subprocess module
      /\{\{.*?os\..*?\}\}/gi,                  // os module access
      /\{\{.*?file\s*\(.*?\}\}/gi,            // file() calls
      /\{\{.*?open\s*\(.*?\}\}/gi,            // open() calls

      // Path traversal patterns
      /\.\.[\/\\]/g,                           // ../ or ..\
      /[\/\\]\.\.[\/\\]/g,                     // /../ or \..\
      /\x00/g,                                 // null bytes

      // Code execution patterns
      /__import__\s*\(/gi,                     // __import__()
      /getattr\s*\(/gi,                        // getattr()
      /setattr\s*\(/gi,                        // setattr()
      /delattr\s*\(/gi,                        // delattr()
      /globals\s*\(/gi,                        // globals()
      /locals\s*\(/gi,                         // locals()
      /vars\s*\(/gi,                          // vars()

      // System command patterns
      /system\s*\(/gi,                         // system() calls
      /popen\s*\(/gi,                          // popen() calls
      /spawn\s*\(/gi,                          // spawn() calls

      // Network/External access
      /urllib\./gi,                            // urllib module
      /requests\./gi,                          // requests module
      /socket\./gi,                            // socket module
      /http\./gi,                              // http module
    ];

    // Suspicious patterns (require additional validation)
    this.suspiciousPatterns = [
      /\{\{.*?['"]\s*\+\s*.*?\}\}/gi,         // String concatenation in templates
      /\{\{.*?\[\s*.*?\s*\]\}\}/gi,           // Array/dict access
      /\{\{.*?\.\s*\w+.*?\}\}/gi,             // Method calls
      /javascript:/gi,                         // JavaScript URLs
      /data:/gi,                               // Data URLs
      /vbscript:/gi,                           // VBScript URLs
      /<script[^>]*>/gi,                       // Script tags
      /<iframe[^>]*>/gi,                       // iframes
      /<object[^>]*>/gi,                       // Object tags
      /<embed[^>]*>/gi,                        // Embed tags
    ];
  }

  /**
   * Main validation method - validates input through multiple security layers
   */
  async validateInput(input: string, context?: string): Promise<SecurityResult<string>> {
    try {
      // Layer 1: Basic input validation
      const basicValidation = this.validateBasicInput(input);
      if (!basicValidation.ok) {
        return basicValidation;
      }

      // Layer 2: AIMDS threat detection (if enabled)
      if (this.config.enableAIMDS) {
        const aimdsResult = await this.scanWithAIMDS(input);
        if (!aimdsResult.safe) {
          await this.logSecurityEvent('aimds_threat_detected', {
            threats: aimdsResult.threats,
            context,
            inputSample: input.substring(0, 100)
          });
          return {
            ok: false,
            error: 'AI manipulation threat detected',
            threat: aimdsResult.threats.join(', ')
          };
        }
      }

      // Layer 3: Pattern-based validation
      const patternValidation = this.validatePatterns(input);
      if (!patternValidation.ok) {
        return patternValidation;
      }

      // Layer 4: Content sanitization
      const sanitized = this.sanitizeInput(input);

      // Layer 5: Final validation
      if (sanitized !== input) {
        await this.logSecurityEvent('input_sanitized', {
          originalLength: input.length,
          sanitizedLength: sanitized.length,
          context
        });
      }

      return { ok: true, value: sanitized };

    } catch (error) {
      await this.logSecurityEvent('validation_error', {
        error: error.message,
        context
      });
      return {
        ok: false,
        error: 'Validation failed',
        threat: 'validation_error'
      };
    }
  }

  /**
   * Validate file paths for secure file operations
   */
  async validateFilePath(filepath: string, baseDir: string): Promise<SecurityResult<string>> {
    try {
      // Normalize the path
      const normalizedPath = normalize(filepath);
      const normalizedBase = normalize(baseDir);

      // Check for path traversal
      if (normalizedPath.includes('..')) {
        return {
          ok: false,
          error: 'Path traversal detected',
          threat: 'path_traversal'
        };
      }

      // Ensure path is within base directory
      const fullPath = join(normalizedBase, normalizedPath);
      if (!fullPath.startsWith(normalizedBase)) {
        return {
          ok: false,
          error: 'Path outside allowed directory',
          threat: 'directory_escape'
        };
      }

      // Validate file extension
      const ext = extname(normalizedPath);
      if (ext && !this.config.allowedFileExtensions.includes(ext.toLowerCase())) {
        return {
          ok: false,
          error: `File extension ${ext} not allowed`,
          threat: 'invalid_extension'
        };
      }

      // Check path length
      if (fullPath.length > 255) {
        return {
          ok: false,
          error: 'Path too long',
          threat: 'path_length_limit'
        };
      }

      // Validate filename characters
      const filename = normalizedPath.split(/[/\\]/).pop() || '';
      const invalidChars = /[<>:"|?*\x00-\x1f]/;
      if (invalidChars.test(filename)) {
        return {
          ok: false,
          error: 'Invalid characters in filename',
          threat: 'invalid_filename'
        };
      }

      // Check for reserved names (Windows)
      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
      const baseFilename = filename.split('.')[0].toUpperCase();
      if (reservedNames.includes(baseFilename)) {
        return {
          ok: false,
          error: 'Reserved filename',
          threat: 'reserved_filename'
        };
      }

      return { ok: true, value: fullPath };

    } catch (error) {
      return {
        ok: false,
        error: 'Path validation failed',
        threat: 'path_validation_error'
      };
    }
  }

  /**
   * Validate file content before writing
   */
  async validateFileContent(content: string, filepath: string): Promise<SecurityResult<string>> {
    // Check file size
    if (content.length > this.config.maxFileSize) {
      return {
        ok: false,
        error: 'File size exceeds limit',
        threat: 'file_size_limit'
      };
    }

    // Validate content through normal input validation
    const contentValidation = await this.validateInput(content, `file:${filepath}`);
    if (!contentValidation.ok) {
      return contentValidation;
    }

    // Additional file-specific validations
    const ext = extname(filepath).toLowerCase();

    // JSON files - validate JSON structure
    if (ext === '.json') {
      try {
        JSON.parse(content);
      } catch (error) {
        return {
          ok: false,
          error: 'Invalid JSON format',
          threat: 'invalid_json'
        };
      }
    }

    // Markdown files - check for dangerous HTML/scripts
    if (ext === '.md') {
      const htmlValidation = this.validateMarkdownHTML(content);
      if (!htmlValidation.ok) {
        return htmlValidation;
      }
    }

    return { ok: true, value: contentValidation.value };
  }

  /**
   * Basic input validation (size, encoding, etc.)
   */
  private validateBasicInput(input: string): SecurityResult<string> {
    // Check input size
    if (input.length > this.config.maxInputSize) {
      return {
        ok: false,
        error: 'Input size exceeds limit',
        threat: 'input_size_limit'
      };
    }

    // Check for null bytes
    if (input.includes('\x00')) {
      return {
        ok: false,
        error: 'Null bytes detected',
        threat: 'null_bytes'
      };
    }

    // Check for excessive control characters
    const controlCharCount = (input.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
    if (controlCharCount > input.length * 0.1) { // More than 10% control chars
      return {
        ok: false,
        error: 'Excessive control characters',
        threat: 'control_characters'
      };
    }

    return { ok: true, value: input };
  }

  /**
   * Pattern-based validation using dangerous and suspicious patterns
   */
  private validatePatterns(input: string): SecurityResult<string> {
    // Check dangerous patterns (immediate block)
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(input)) {
        return {
          ok: false,
          error: 'Dangerous pattern detected',
          threat: `dangerous_pattern:${pattern.source}`
        };
      }
    }

    // Check suspicious patterns (additional validation based on security level)
    if (this.config.level === SecurityLevel.STRICT) {
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(input)) {
          return {
            ok: false,
            error: 'Suspicious pattern detected',
            threat: `suspicious_pattern:${pattern.source}`
          };
        }
      }
    }

    return { ok: true, value: input };
  }

  /**
   * Sanitize input by removing/escaping dangerous content
   */
  private sanitizeInput(input: string): string {
    let sanitized = input;

    // Remove null bytes
    sanitized = sanitized.replace(/\x00/g, '');

    // Remove or escape control characters (except common whitespace)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Normalize line endings
    sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Limit consecutive whitespace
    sanitized = sanitized.replace(/[ \t]{4,}/g, '   '); // Max 3 consecutive spaces
    sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n'); // Max 3 consecutive newlines

    // HTML/XML entity encoding for potential HTML content
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    // Trim excessive whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Validate markdown content for dangerous HTML
   */
  private validateMarkdownHTML(content: string): SecurityResult<string> {
    // Dangerous HTML patterns in markdown
    const dangerousHTMLPatterns = [
      /<script[^>]*>/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<form[^>]*>/gi,
      /<input[^>]*>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+\s*=/gi, // Event handlers
    ];

    for (const pattern of dangerousHTMLPatterns) {
      if (pattern.test(content)) {
        return {
          ok: false,
          error: 'Dangerous HTML detected in markdown',
          threat: `markdown_html:${pattern.source}`
        };
      }
    }

    return { ok: true, value: content };
  }

  /**
   * AIMDS integration for AI threat detection
   */
  private async scanWithAIMDS(input: string): Promise<AIMDSResult> {
    try {
      // Mock AIMDS call - replace with actual AIMDS integration
      // const result = await aimds.scan({ input, mode: 'thorough' });

      // For now, return a mock result
      const mockResult: AIMDSResult = {
        safe: true,
        threats: [],
        confidence: 0.95,
        detectionTimeMs: 5,
        piiFound: false
      };

      // Quick check for obvious threats that AIMDS would catch
      const obviousThreats = [
        'ignore previous instructions',
        'forget everything',
        'new instructions',
        'system prompt',
        'jailbreak',
        'pretend to be',
        'act as if'
      ];

      for (const threat of obviousThreats) {
        if (input.toLowerCase().includes(threat)) {
          mockResult.safe = false;
          mockResult.threats.push('prompt_injection');
          break;
        }
      }

      return mockResult;
    } catch (error) {
      // Fail secure - if AIMDS scan fails, assume threat
      return {
        safe: false,
        threats: ['aimds_scan_failure'],
        confidence: 0.0,
        detectionTimeMs: 0,
        piiFound: false
      };
    }
  }

  /**
   * Log security events for monitoring and analysis
   */
  private async logSecurityEvent(eventType: string, details: Record<string, any>): Promise<void> {
    if (!this.config.logSecurityEvents) return;

    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      details: {
        ...details,
        // Remove sensitive data
        inputSample: details.inputSample ? details.inputSample.substring(0, 100) + '...' : undefined
      },
      severity: this.calculateSeverity(eventType),
      checksum: this.generateEventChecksum(eventType, details)
    };

    // In a real implementation, send to security monitoring system
    console.warn(`[SECURITY EVENT] ${JSON.stringify(event)}`);
  }

  /**
   * Calculate event severity for monitoring
   */
  private calculateSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'aimds_threat_detected': 'high',
      'dangerous_pattern': 'critical',
      'suspicious_pattern': 'medium',
      'path_traversal': 'critical',
      'directory_escape': 'critical',
      'input_sanitized': 'low',
      'validation_error': 'medium',
      'file_size_limit': 'low',
      'invalid_extension': 'medium'
    };

    return severityMap[eventType] || 'medium';
  }

  /**
   * Generate event checksum for integrity
   */
  private generateEventChecksum(eventType: string, details: Record<string, any>): string {
    const content = JSON.stringify({ eventType, details });
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }
}

/**
 * Utility functions for security operations
 */
export class SecurityUtils {
  /**
   * Generate secure filename from user input
   */
  static generateSecureFilename(input: string, extension?: string): string {
    // Remove dangerous characters
    let clean = input
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^[._-]+/, '')
      .replace(/[._-]+$/, '');

    // Ensure not empty
    if (!clean) {
      clean = 'file';
    }

    // Limit length
    clean = clean.substring(0, 100);

    // Add extension if provided
    if (extension && !clean.endsWith(extension)) {
      clean += extension;
    }

    // Add timestamp for uniqueness
    const timestamp = Date.now();
    const name = clean.replace(/(\.[^.]*)?$/, `_${timestamp}$1`);

    return name;
  }

  /**
   * Calculate content hash for integrity verification
   */
  static calculateContentHash(content: string): string {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Validate content integrity
   */
  static validateContentIntegrity(content: string, expectedHash: string): boolean {
    const actualHash = this.calculateContentHash(content);
    return actualHash === expectedHash;
  }
}

// Export default validator instance
export const defaultSecurityValidator = new SecurityValidator();

// Export types for external use
export type { SecurityResult, ValidationConfig, AIMDSResult };
export { SecurityLevel };